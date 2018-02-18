defmodule Chat.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    port = Application.fetch_env!(:chat, :port)

    children = [
      {Task.Supervisor, name: Chat.TaskSupervisor},
      {Task, fn -> Chat.accept(port) end}
    ]

    opts = [strategy: :one_for_one, name: Chat.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
