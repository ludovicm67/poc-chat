using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;
using UnityEngine;
using UnityEngine.UI;

public class Client : MonoBehaviour {

    public GameObject chatContainer;
    public GameObject messagePrefab;


    private bool socketReady;
    private TcpClient socket;
    private NetworkStream stream;
    private StreamWriter writer;
    private StreamReader reader;

    private void Start()
    {
        int width = 800;
        int height = 600;
        bool isFullScreen = false;
        int desiredFPS = 60;

        Screen.SetResolution(width, height, isFullScreen, desiredFPS);
    }

    public void ConnectToServer()
    {
        if (socketReady) return;

        // default params
        string host = "localhost";
        int port = 4242;

        // rewrite params from interface
        string h;
        int p;
        h = GameObject.Find("HostInput").GetComponent<InputField>().text;
        if (h != "") host = h;
        int.TryParse(GameObject.Find("PortInput").GetComponent<InputField>().text, out p);
        if (p != 0) port = p;

        Debug.Log("Try to join " + host + ":" + port);

        // socket creation
        try
        {
            socket = new TcpClient(host, port);
            stream = socket.GetStream();
            writer = new StreamWriter(stream);
            reader = new StreamReader(stream);
            socketReady = true;

            Debug.Log("Client created socket successfuly");
        }
        catch (Exception e)
        {
            Debug.Log("Socket error: " + e.Message);
        }
    }

    private void Update()
    {
        if (socketReady)
        {
            if (stream.DataAvailable)
            {
                string data = reader.ReadLine();
                if (data != null) OnIncomingData(data);
            }
        }
    }

    private void OnIncomingData(string data)
    {
        Debug.Log("DATA: " + data);
        if (chatContainer.transform.childCount >= 10)
        {
            Destroy(chatContainer.transform.GetChild(0).gameObject);
        }
        GameObject go = Instantiate(messagePrefab, chatContainer.transform) as GameObject;
        go.GetComponentInChildren<Text>().text = data;
    }

    private void SendData(string data)
    {
        if (!socketReady) return;
        writer.WriteLine(data);
        writer.Flush();
    }

    public void OnSendAction()
    {
        GameObject go = GameObject.Find("MessageInput");
        string message = go.GetComponent<InputField>().text;
        SendData(message);
        OnIncomingData(message);
        go.GetComponent<InputField>().text = "";
    }
}
