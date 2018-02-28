// all what we need to import
const net      = require('net');
const readline = require('readline');
const prompts  = require('prompts');

// informations we need to ask the user about the server location
async function askServerDetails() {
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
    }
  ];
  return await prompts(questions);
};


// first we get all needed informations from the user, then we create the socket
askServerDetails().then((response) => {

  // client socket init
  const client = new net.Socket();
  client.setEncoding('utf-8');

  // try to connect
  client.connect(response.port, response.host, () => {
    console.log(`Connected to ${response.host}:${response.port}!`);
    console.log('Type /quit to exit.\n\n')
    client.write("Node client connected!\n");
  });

  // when we receive data, we log it in the console
  client.on('data', data => {
    console.log(data.replace(/\n$/, ""));
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
      client.write(data + "\n");
    }
  });
});
