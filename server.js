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
		if(CheckBannedNames(name) == false)
		{
			GetPlayerBySocket(socket).name = name;
			console.log("PLAYER " + GetPlayerBySocket(socket).id + "'s NAME IS : " + name + ".");
			SendToPlayers('player count', connectedPlayers);
			if(connectedPlayers == 4)
			{
				waitingForPlayers = false;
				StartGame();
			}
		}
		else
		{
			//	BANNED NAME
			RefuseConnection(socket, "Banned Name");
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
		RefuseConnection(socket, "Server Full");
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
			socket.emit('confirm name', connectedAsPlayer);
		}
		else
		{
			//	SOMETHING IS NOT RIGHT
			RefuseConnection(socket, "Server Error");
		}
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
function SendToPlayers(command, message)
{
	var players = ConnectedPlayers();
	for(var i = 0; i < players.length; i++)
	{
		GetPlayerById(i + 1).socket.emit(command, message);
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
	constructor(socket, id)
	{
		this.name = "";
		this.health = 100;
		this.mana = 100;
		this.socket = socket;
		this.id = id;
		this.timeout = 5;

		this.dead = false;
		this.defence = 0;
		this.evadedNothing = true;
	}

	Polo()
	{
		this.timeout = 5;
	}

	SetAction(act)
	{
		this.action = act;
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
	}
}

var waitingForPlayers = true;
var connectedPlayers = 0;
var player1; //	TEAM A
var player2; // TEAM B
var player3; // TEAM A
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
	var executionOrder;
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
		if(caster.dead == false && target.dead == false)
		{
			caster = executionOrder[i];
			target = GetPlayerById(caster.action.target);
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
					console.log(caster.name + " increased their defence by" + spell.effect + " points!");
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