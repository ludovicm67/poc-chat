// all what we need to import
var net      = require('net');
var readline = require('readline');

// client init
var client = new net.Socket();
client.setEncoding('utf-8');

// try to connect
client.connect(4242, '127.0.0.1', function() {
  console.log('Connected!');
  console.log('Type /quit to exit.\n\n')
  client.write("Node client connected!\n");
});

// when we receive data, we log it in the console
client.on('data', function(data) {
  console.log(data.replace(/\n$/, ""));
});

// readline init
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// when we read a user input
rl.on('line', function(data) {
  if (data == '/quit') {
    client.destroy();
    rl.close();
  } else {
    client.write(data + "\n");
  }
});
