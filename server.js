// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = 5000;

app.set('port', port);
app.use('', express.static(__dirname));


// Starts the server.
server.listen(port, StartServer());

// Add the WebSocket handlers
io.on('connection', function(socket) {
	console.log("Someone connected @ " + socket);
});
io.on('disconnection', function(socket) {
	console.log("Someone disconnected @ " + socket);
});
io.on('polo', function(socket) {
	console.log("Someone disconnected @ " + socket);
});

setInterval(function() {
  io.sockets.emit('message', 'hi!');
}, 1000);


function StartServer()
{
	console.log('Starting server on port ' + port);
	connectedPlayers = 0;
	player1 = undefined;
	player2 = undefined;
	player3 = undefined;
	player4 = undefined;
}

function ConnectPlayer(socket)
{
	if(connectedPlayers >= 4)
	{
		//	REFUSE
		console.log("Refused New Player");
	}
	else
	{
		//	ACCEPT
		connectedPlayers ++;

		var connectedAsPlayer = 1;
		if(player1.connected === false)
		{
			player1 = new Player(socket);
			connectedAsPlayer = 1;
		}
		else if(player2.connected === false)
		{
			player2 = new Player(socket);
			connectedAsPlayer = 2;
		}
		else if(player3.connected === false)
		{
			player3 = new Player(socket);
			connectedAsPlayer = 3;
		}
		else
		{
			player4 = new Player(socket);
			connectedAsPlayer = 4;
		}
		console.log("Connected A Player " + connectedAsPlayer);
	}
}




//	GAME STUFF
class Player
{
	constructor(socket)
	{
		this.health = 100;
		this.mana = 100;
		this.connected = true;
		this.socket = socket;
	}
}

var connectedPlayers = 0;
var player1;
var player2;
var player3;
var player4;