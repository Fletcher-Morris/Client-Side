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

	socket.on('polo', function(data)
	{
		GetPlayerBySocket(socket).Polo();
	});

	socket.on('name is', function(name)
	{
		GetPlayerBySocket(socket).name = name;
		console.log("PLAYER " + GetPlayerBySocket(socket).id + "'s NAME IS : " + name + ".");
		if(connectedPlayers == 4)
		{
			waitingForPlayers = false;
			StartGame();
		}
	});

});

io.on('disconnect', function(socket) {
	console.log("Someone disconnected @ " + socket);
});



setInterval(function()
{
  SendToPlayers('marco');
  var players = ConnectedPlayers();
  for(var i = 0; i < players.length; i++)
  {
  	players[i].timeout --;
  }
}, 1000);
setInterval(function()
{
	var players = ConnectedPlayers();
	for(var i = 0; i < players.length; i++)
	{
		if(players[i].timeout < 0)
		{
			console.log("PLAYER " + players[i].id + " HAS TIMED OUT!");
		}
	}
}, 4000);


function StartServer()
{
	console.log('Starting server on port ' + port);
	waitingForPlayers = true;
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
		socket.emit('refuse connection', "Server Is Full");
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
			//	SOMETHING IS NOT RIGHT
			console.log("Something went wrong connecting the player!");
			socket.emit('refuse connection', "Server Error");
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
function SendToPlayers(command, message)
{
	var players = ConnectedPlayers();
	for(var i = 0; i < players.length; i++)
	{
		GetPlayerById(i + 1).socket.emit(command, message);
	}
}




//	GAME STUFF
class Player
{
	constructor(socket, id)
	{
		this.name = "";
		this.health = 100;
		this.mana = 100;
		this.socket = socket;
		this.id = id;
		this.timeout = 5;
	}

	Polo()
	{
		this.timeout  = 5;
	}
}

var waitingForPlayers = true;
var connectedPlayers = 0;
var player1; //	TEAM A
var player2; // TEAM B
var player3; // TEAM A
var player4; // TEAM B

function ConnectedPlayers()
{
	var result = [];
	if(player1 != undefined) result.push(player1);
	if(player2 != undefined) result.push(player2);
	if(player3 != undefined) result.push(player3);
	if(player4 != undefined) result.push(player4);
	return result;
}


function StartGame()
{
	console.log("GAME STARTED!");
	SendToPlayers('start game');

	//	SEND THE PLAYERS' NAMES TO EACH PLAYER
	var nameString = "";
	for(var i = 0; i < 4; i++)
	{
		nameString += GetPlayerById(i + 1).name;
		if(i < 3) nameString += "_";
	}
	SendToPlayers('player names', nameString);
}