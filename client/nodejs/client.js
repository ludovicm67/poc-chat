var net = require('net');
var readline = require('readline');
var client = new net.Socket();
client.setEncoding('utf-8');

client.connect(4242, '127.0.0.1', function() {
  console.log('Connected!');
  client.write("Node client connected!\n");
});

function send_data(data) {
  client.write(data + "\n");
}

client.on('data', function(data) {
  console.log(data.replace(/\n$/, ""));
});

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', function(data) {
  send_data(data);
});
