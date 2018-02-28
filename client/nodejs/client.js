// all what we need to import
const net      = require('net');
const readline = require('readline');
const prompts  = require('prompts');
const messages = require('./messages_pb');

// informations we need to ask the user about the server location
async function askDetails() {
  let questions = [
    {
      type: 'text',
      name: 'host',
      message: 'Server host',
      initial: 'localhost'
    },
    {
      type: 'number',
      name: 'port',
      message: 'Server port',
      initial: 4242,
      min: 0,
      max: 65535
    },
    {
      type: 'text',
      name: 'user',
      message: 'Username',
      initial: 'NodeJS'
    },
  ];
  return await prompts(questions);
};

// encode a message
function msgEncode(content, user) {
  let message = new messages.Message();
  message.setContent(content);
  message.setUser(user);
  return message.serializeBinary() + '\n';
}

// decode a message
function msgDecode(msg) {
  let message;
  try {
    message = messages.Message.deserializeBinary(msg);
  } catch (e) { // in case the message was sent without protobuf
    message = new messages.Message();
    message.setContent(msg.replace(/\n$/, ''));
  }
  return message;
}

// first we get all needed informations from the user, then we create the socket
askDetails().then(response => {

  // just to store the user
  const user = response.user;

  // client socket init
  const client = new net.Socket();
  client.setEncoding('utf-8');

  // try to connect
  client.connect(response.port, response.host, () => {
    console.log(`Connected to ${response.host}:${response.port}!`);
    console.log('Type /quit to exit.\n\n');
    client.write(msgEncode("Node client connected!", user));
  });

  // when we receive data, we log it in the console
  client.on('data', data => {
    let msg = msgDecode(data);
    console.log(msg.getContent());
  });

  // error handling
  client.on('error', err => {
    console.error(`  !!  ${err}.`);
    client.destroy();
    rl.close();
  });

  // readline init
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // when we read a user input
  rl.on('line', data => {
    if (data == '/quit') {
      client.destroy();
      rl.close();
      console.log("Goodbye!");
    } else {
      client.write(msgEncode(data, user));
    }
  });
});
