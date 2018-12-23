// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var spellsJson = require('./server-spells.json');
var loadedSpells = JSON.parse(JSON.stringify(spellsJson));

var settingsJson = require('./settings.json');
var serverSettings = JSON.parse(JSON.stringify(settingsJson));
var bannedNames;
var timeoutTime = 4;
var port = 5000;
LoadSettings();

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', port);
app.use('', express.static(__dirname));


// Starts the server.
server.listen(port, StartServer());
var queuedPlayers;

// Add the WebSocket handlers
io.on('connection', function(socket) {
	ConnectSocket(socket);

	socket.on('polo', function(data)
	{
		GetPlayerBySocket(socket).Polo();
	});

	socket.on('name is', function(name)
	{
		ConfirmWizard(socket, name);
	});

	socket.on('action', function(action)
	{
		GetPlayerBySocket(socket).SetAction(action);
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
}, (timeoutTime + 1) * 1000);

function LoadSettings()
{
	port = serverSettings.port;
	bannedNames = new Array();
	var bannedNamesString = "Banned Names : "
	timeoutTime = serverSettings.timeout;
	for (var i = 0; i < serverSettings.bannedNames.length; i++)
	{
		bannedNames.push(serverSettings.bannedNames[i]);
		bannedNamesString += serverSettings.bannedNames[i] + ", ";
	}
	console.log(bannedNamesString + "\n");
}

function StartServer()
{
	console.log('Starting server on port ' + port);
	LoadSpells();
	queuedPlayers = new Array();
	player1 = undefined;
	player2 = undefined;
	player3 = undefined;
	player4 = undefined;
}

function ConnectSocket(socket)
{
	socket.emit('confirm name');
}
function ConfirmWizard(socket, name)
{
	if(CheckBannedNames(name) == false)
	{
		queuedPlayers.push(new Player(socket, 0, name));
		console.log(name + " joined the queue");
		TryStartGame();
	}
	else
	{
		//	BANNED NAME
		RefuseConnection(socket, "Banned Name");
	}
}

function TryStartGame()
{
	if(gameInProgress == true)
	{
		SendToQueue('queue length', queuedPlayers.length);
	}
	else if (queuedPlayers.length >= 4)
	{
		StartGame();
	}
	else if(queuedPlayers.length <= 3)
	{
		SendToQueue('player count', queuedPlayers.length);
	}
}

function CreatePlayer(player)
{
	var connectedAsPlayer = 0;
	if(player1 === undefined)
	{
		connectedAsPlayer = 1;
		player1 = new Player(player.socket, connectedAsPlayer, player.name);
	}
	else if(player2 === undefined)
	{
		connectedAsPlayer = 2;
		player2 = new Player(player.socket, connectedAsPlayer, player.name);
	}
	else if(player3 === undefined)
	{
		connectedAsPlayer = 3;
		player3 = new Player(player.socket, connectedAsPlayer, player.name);
	}
	else if(player4 === undefined)
	{
		connectedAsPlayer = 4;
		player4 = new Player(player.socket, connectedAsPlayer, player.name);
	}

	if(connectedAsPlayer != 0)
	{
		//	SUCCESS!
		console.log(player.name + " has joined the battle!");
	}
}
function RefuseConnection(socket, reason)
{
	socket.emit('refuse connection', reason);
	console.log("Refused connection to player, reason : " + reason + ".");
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
function SendToQueue(command, message)
{
	if(queuedPlayers.length >= 1)
	{
		for(var i = 0; i < queuedPlayers.length; i++)
		{
			queuedPlayers[i].Send(command, message);
		}
	}
}
function SendToPlayers(command, message)
{
	var players = ConnectedPlayers();
	for(var i = 0; i < players.length; i++)
	{
		GetPlayerById(i + 1).Send(command, message);
	}
}

function CheckBannedNames(name)
{
	for(var i = 0; i < bannedNames.length; i++)
	{
		if(bannedNames[i] == name) return true;
	}
	return false;
}


//	GAME STUFF
class Player
{
	constructor(socket, id, name)
	{
		this.name = name;
		this.health = 100;
		this.mana = 100;
		this.socket = socket;
		this.id = id;
		this.timeout = 5;
		this.dead = false;
		this.defence = 0;
		this.evadedNothing = true;
	}

	Send(command, message)
	{
		this.socket.emit(command, message);
	}

	Polo()
	{
		this.timeout = 5;
	}

	SetAction(act)
	{
		this.action = act;
		this.action.spell = GetSpell(act.spell);
		console.log(this.name + " has chosen the '" + act.spell.name + "' spell");
		ProccessRound();
	}

	Heal(amount)
	{
		this.health += amount;
		if(this.health >= 100) this.health = 100;
	}

	DrainMana(amount)
	{
		this.mana -= amount;
		if(this.mana <= 0) this.mana = 0;
	}

	Damage(amount)
	{
		this.health -= amount;
		if(this.health <= 0) this.Death();
	}

	Defend(amount)
	{
		this.defence += amount;
	}

	Death()
	{
		this.health = 0;
		this.dead = true;
		console.log(this.name + " HAS RETIRED FROM WIZARDING");
		HandlePlayerDeath();
	}
}

var gameInProgress = false;
var connectedPlayers = 0;
var player1; //	TEAM A
var player2; // TEAM A
var player3; // TEAM B
var player4; // TEAM B
var playerTurn = 0;

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
	gameInProgress = true;
	for(var i = 0; i < 4; i++){CreatePlayer(queuedPlayers.shift());}
	SendToQueue('player count', queuedPlayers.length);

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

function ProccessRound()
{
	//	CKECK ALL PLAYERS HAVE AN ACTION
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		if(GetPlayerById(i + 1).action == undefined) return;
	}

	var executionOrder = new Array();
	var caster;
	var target;
	var spell;

	//	Check for special spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.type == "special")
		{
			executionOrder.push(caster);
		}
	}
	//	Check for defence spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.type == "defend")
		{
			executionOrder.push(caster);
		}
	}
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.type == "attack")
		{
			executionOrder.push(caster);
		}
	}
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.type == "evade")
		{
			executionOrder.push(caster);
		}
	}
	for(var i = 0; i < executionOrder.length; i++)
	{
		caster = executionOrder[i];
		target = GetPlayerById(caster.action.target);
		if(caster.dead == false && target.dead == false)
		{
			spell = caster.action.spell;
			if(spell.type == "special")
			{
				if(spell.name == "boost")
				{
					//	Boost the target
					target.boosted = true;
				}
				if(spell.name == "heal")
				{
					//	Heal the target
					target.Heal(caster.action.spell.effect);
				}
			}
			if(spell.type == "defend")
			{
				target.Defend(spell.effect);
				if(caster == target)
				{
					console.log(caster.name + " increased their defence by " + spell.effect + " points!");
				}
				else
				{
					console.log(caster.name + " increased " + target.name + "'s defence by" + spell.effect + " points!");
				}
			}
			else if(spell.type == "attack")
			{
				if(target.action.spell.type == "evade")
				{
					if(CoinFlip(target.action.effect / 1.0))
					{
						//	Evade fails
						target.Damage(spell.effect);
						console.log(target.name + " tried to evade " + caster.name + "'s spell but failed!");
						console.log(caster.name + " used '" + spell.name + "' and damaged " + target.name + " " + spell.effect + " points!");
					}
					else
					{
						//	Evade succeedes
						console.log(caster.name + " used '" + spell.name + "' on " + target.name + ", but " + target.name + " evaded!");
					}
					target.evadedNothing = false;
				}
				else if(target.defence > 0)
				{
					//	Target absorbs damage, if defence value exeeds attack value, difference is reflected back
					if(target.defence > spell.effect)
					{
						//	Reflect
						var reflectValue = target.defence - spell.effect;
						console.log(target.name + "'s defence overpowered " + caster.name + "'s '" + spell.name + "' spell, deflecting " + reflectValue + " back towards them!");
						caster.Damage(reflectValue);
					}
				}
				else
				{
					target.Damage(spell.effect);
						console.log(caster.name + " used '" + spell.name + "' and damaged " + target.name + " " + spell.effect + " points!");
				}
			}
			if(spell.type == "evade")
			{
				if(target.evadedNothing)
				{
					console.log(caster.name + " evaded nothing!");
				}
			}

			//	Drain the cost of the spell from the caster's mana pool
			caster.DrainMana(spell.cost);
		}
	}
}

function HandlePlayerDeath(player)
{
	if(GetPlayerById(1).dead && GetPlayerById(2).dead)
	{
		//	TEAM 2 WINS
		EndGame(2);
	}
	else if(GetPlayerById(3).dead && GetPlayerById(4).dead)
	{
		//	TEAM 1 WINS
		EndGame(1);
	}
}

function EndGame(winningTeam)
{
	SendToPlayers('game over', winningTeam);

	connectedPlayers = new Array();
	player1 = undefined;
	player2 = undefined;
	player3 = undefined;
	player4 = undefined;
}

function LoadSpells()
{
	var loadedSpellsString = "\nLoaded Spells : ";
	for (var i = 0; i < loadedSpells.length; i++)
	{		
        loadedSpellsString += (loadedSpells[i].name + ", ");
    }
    console.log(loadedSpellsString + "\n");
}

class Spell
{
    constructor(name, type, cost, effect)
    {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.effect = effect;
    }
}
function GetSpell(spellName)
{
	for(var i = 0; i < loadedSpells.length; i++)
	{
		if(loadedSpells[i].name == spellName) return loadedSpells[i];
	}
}

function CoinFlip(chance)
{
	var random = Math.random();
	if(random >= chance) return true;
	return false;
}