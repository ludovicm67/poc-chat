require Logger

defmodule Chat do
  def accept(port) do
    {:ok, clients} = Agent.start_link(fn -> [] end)

    {:ok, socket} =
      :gen_tcp.listen(port, [:binary, packet: :line, active: false, reuseaddr: true])

    Logger.info("Accepting connections on port #{port}")
    loop_acceptor(socket, clients)
  end

  defp loop_acceptor(socket, clients) do
    {:ok, client} = :gen_tcp.accept(socket)
    clientId = Port.info(client)[:id]
    Logger.info("Client #{clientId} joined!")
    write_info(client, "Welcome to the chat server!")
    Agent.update(clients, fn list -> [client] ++ list end)

    {:ok, pid} =
      Task.Supervisor.start_child(Chat.TaskSupervisor, fn -> serve(client, clients) end)

    :ok = :gen_tcp.controlling_process(client, pid)
    loop_acceptor(socket, clients)
  end

  defp serve(socket, clients) do
    case read_line(socket) do
      {:ok, data} ->
        clientId = Port.info(socket)[:id]
        Logger.info("Client #{clientId} sent message: #{data}")

        Agent.get(clients, fn list ->
          Enum.each(list, fn c -> send_message(c, socket, data) end)
        end)

        serve(socket, clients)

      {:logout, reason} ->
        Agent.update(clients, fn list -> list -- [socket] end)
        clientId = Port.info(socket)[:id]
        Logger.info("Client #{clientId} has leaved. Reason: #{reason}")

      {:error, msg} ->
        Logger.info("Error: #{msg}")
    end
  end

  defp send_message(socket, from, data) do
    unless from == socket do
      write_line(socket, data)
    end
  end

  defp read_line(socket) do
    case :gen_tcp.recv(socket, 0) do
      {:ok, data} -> {:ok, data}
      {:error, :closed} -> {:logout, "socket is closed"}
      _ -> {:error, "Unknown error"}
    end
  end

  defp write_line(socket, line) do
    :gen_tcp.send(socket, line)
  end

  defp write_info(socket, line) do
    write_line(socket, "[INFO] #{line}\n")
  end
end
