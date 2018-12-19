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
	console.log("Someone Connected");
	ConnectPlayer(socket);

	socket.on('name is', function(name)
	{
		GetPlayerBySocket(socket).name = name;
		console.log("PLAYER " + GetPlayerBySocket(socket).id + "'s NAME IS : " + name + ".");
	});

});
io.on('disconnect', function(socket) {
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
		var connectedAsPlayer = 0;
		if(player1 === undefined)
		{
			connectedAsPlayer = 1;
			player1 = new Player(socket, connectedAsPlayer);
		}
		else if(player2 === undefined)
		{
			connectedAsPlayer = 2;
			player2 = new Player(socket, connectedAsPlayer);
		}
		else if(player3 === undefined)
		{
			connectedAsPlayer = 3;
			player3 = new Player(socket, connectedAsPlayer);
		}
		else if(player4 === undefined)
		{
			connectedAsPlayer = 4;
			player4 = new Player(socket, connectedAsPlayer);
		}

		if(connectedAsPlayer != 0)
		{
			//	SUCCESS!
			connectedPlayers ++;
			console.log("Connected As Player " + connectedAsPlayer);
			socket.emit('confirm name', connectedAsPlayer);
		}
		else
		{
			console.log("Something went wrong connecting the player!");
		}
	}
}

function GetPlayerBySocket(socket)
{
	if(player1.socket === socket)
	{
		return player1;
	}
	else if(player2.socket === socket)
	{
		return player2;
	}
	else if(player3.socket === socket)
	{
		return player3;
	}
	else if(player4.socket === socket)
	{
		return player4;
	}
}
function GetPlayerById(id)
{
	if(id == 1)
	{
		return player1;
	}
	else if(id == 2)
	{
		return player2;
	}
	else if(id == 3)
	{
		return player3;
	}
	else if(id == 4)
	{
		return player4;
	}
}




//	GAME STUFF
class Player
{
	constructor(socket, id)
	{
		this.health = 100;
		this.mana = 100;
		this.connected = true;
		this.socket = socket;
		this.id = id;
	}
}

var connectedPlayers = 0;
var player1;
var player2;
var player3;
var player4;