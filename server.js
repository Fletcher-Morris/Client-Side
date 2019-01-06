//  WIZARD WARS, CREATED BY FLETCHER MORRIS

//Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var spellsJson = require('./spells.json');
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
	SendSpellsToSocket(socket);

	socket.on('disconnect', function()
	{
		HandleDisconnect(socket);
	});

	socket.on('spells confirmed', function(success)
	{
		if(success == false) SendSpellsToSocket(socket);
		else socket.emit('confirm name');
	});

	socket.on('name is', function(name)
	{
		ConfirmWizard(socket, name);
	});

	socket.on('action', function(action)
	{
		PlayerBySocketId(socket.id).SetAction(action);
	});

});

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
	ResetGame();
}

function SendSpellsToSocket(socket)
{
	socket.emit('spells', loadedSpells);
}
function ConfirmWizard(socket, name)
{
	if(CheckBannedNames(name) == false)
	{
		var p = new Player(socket.id, 0, name)
		queuedPlayers.push(p);
		console.log("\n" + p.name + " joined the queue");
		TryStartGame();
	}
	else
	{
		//	BANNED NAME
		RefuseConnection(socket, "Banned Name");
	}
}

function SendStatsToPlayers()
{
	var players = ConnectedPlayers();
	var statsArray = new Array();
	for(var i = 0; i < players.length; i++)
	{
		statsArray.push(players[i].GetStats());
	}
	SendToPlayers('player stats', statsArray);
}

function TryStartGame()
{
	if(gameInProgress == true)
	{
		SendToQueue('queue length', queuedPlayers.length);
	}
	else if(queuedPlayers.length <= 3)
	{
		SendToQueue('player count', queuedPlayers.length);
	}
	if (queuedPlayers.length >= 4 && gameInProgress == false)
	{
		StartGame();
	}
}

function CreatePlayer(player)
{
	var connectedAsPlayer = 0;
	if(player1 === undefined)
	{
		connectedAsPlayer = 1;
		player1 = new Player(player.socketId, connectedAsPlayer, player.name);
	}
	else if(player2 === undefined)
	{
		connectedAsPlayer = 2;
		player2 = new Player(player.socketId, connectedAsPlayer, player.name);
	}
	else if(player3 === undefined)
	{
		connectedAsPlayer = 3;
		player3 = new Player(player.socketId, connectedAsPlayer, player.name);
	}
	else if(player4 === undefined)
	{
		connectedAsPlayer = 4;
		player4 = new Player(player.socketId, connectedAsPlayer, player.name);
	}

	if(connectedAsPlayer != 0)
	{
		//	SUCCESS!
	}
}
function RefuseConnection(socket, reason)
{
	socket.emit('refuse connection', reason);
	console.log("\nRefused connection to player, reason : " + reason + ".");
}

function PlayerBySocketId(socketId)
{
	if(gameInProgress == true)
	{
		if(player1 != undefined)
		{
			if(player1.socketId == socketId)
			{
				return player1;
			}
		}
		if(player2 != undefined)
		{
			if(player2.socketId == socketId)
			{
				return player2;
			}
		}
		if(player3 != undefined)
		{
			if(player3.socketId == socketId)
			{
				return player3;
			}
		}
		if(player4 != undefined)
		{
			if(player4.socketId == socketId)
			{
				return player4;
			}
		}
	}

	for(var i = 0; i < queuedPlayers.length; i++)
	{
		if(queuedPlayers[i].socketId == socketId) return queuedPlayers[i];
	}
}
function PlayerByPlayerId(id)
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
	else
	{
		console.log("Can not find player with id '" + id + "'");
	}
}
function RemovePlayerFromQueue(player)
{
	for(var i = 0; i < queuedPlayers.length; i++)
	{
		if(queuedPlayers[i] == player) queuedPlayers.splice(i,1);
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
		PlayerByPlayerId(i + 1).Send(command, message);
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

function GetSocketById(id)
{
	return io.sockets.connected[id];
}


//	GAME STUFF
class Player
{
	constructor(socketId, id, name)
	{
		this.name = name;
		this.health = serverSettings.playerHealth;
		this.mana = serverSettings.playerMana;
		this.socketId = socketId;
		this.id = id;
		this.timeout = 5;
		this.dead = false;
		this.inGame = false;
		this.connected = true;
		this.defence = 0;
		this.evadedNothing = true;
		this.multiplier = 1.0;

		if(this.id == 1 || this.id == 2)
		{
			this.team = "A";
		}
		else if(this.id == 3 || this.id == 4)
		{
			this.team = "B";
		}

		
	}

	GetSocket()
	{
		return GetSocketById(this.socketId);
	}

	EnterGame()
	{
		this.inGame = true;
	}

	Send(command, message)
	{
		if(this.connected == false) return;
		this.GetSocket().emit(command, message);
	}

	SendInitialPlayerData()
	{
		var str = "";
		var players = ConnectedPlayers();
		var statsArray = new Array();
		statsArray.push(this.GetStats());
		for(var i = 0; i < players.length; i++)
		{
			if(players[i].id != this.id)
			{
				if(players[i].team == this.team)
				{
					statsArray.push(players[i].GetStats());
				}
			}
		}
		for(var i = 0; i < players.length; i++)
		{
			if(players[i].id != this.id)
			{
				if(players[i].team != this.team)
				{
					statsArray.push(players[i].GetStats());
				}
			}
		}
		this.Send('initial stats', statsArray);
	}

	SetAction(act)
	{
		this.action = act;
		this.action.spell = GetSpell(act.spell);		
		console.log(this.name + " targeted " + PlayerByPlayerId(this.action.target).name + " with the '" + act.spell.name + "' spell");
		ProccessRound();
	}

	Heal(amount)
	{
		this.health += amount;
		if(this.health >= serverSettings.playerHealth) this.health = serverSettings.playerHealth;
	}

	DrainMana(amount)
	{
		this.mana -= amount;
		if(this.mana <= 0) this.mana = 0;
		if(this.mana >= serverSettings.playerMana) this.mana = serverSettings.playerMana;
	}

	Damage(amount)
	{
		this.health -= amount;
	}

	Defend(amount)
	{
		this.defence += amount;
	}

	Boost(amount)
	{
		this.multiplier += amount;
	}

	Death()
	{
		this.health = 0;
		this.dead = true;
		console.log(this.name + " HAS RETIRED FROM WIZARDING");
		HandlePlayerDeath();
	}

	DeathCheck()
	{
		if(this.health <= 0) this.Death();
	}

	GetStats()
	{
		return new SimpleStats (this.id, this.name, this.team, this.health, this.mana, this.defence);
	}
}

class SimpleStats
{
	constructor(id, name, team, health, mana, defence)
	{
		this.id = id;
		this.name = name;
		this.team = team;
		this.health = health;
		this.mana = mana;
		this.defence = defence;
	}
}

var gameInProgress = false;
var connectedPlayers = 0;
var player1; //	TEAM A
var player2; // TEAM A
var player3; // TEAM B
var player4; // TEAM B
var gameRound = 1;
var winningTeam = undefined;

function ConnectedPlayers()
{
	var result = [];
	if(player1 != undefined) {if(player1.connected == true) result.push(player1);}
	if(player2 != undefined) {if(player2.connected == true) result.push(player2);}
	if(player3 != undefined) {if(player3.connected == true) result.push(player3);}
	if(player4 != undefined) {if(player4.connected == true) result.push(player4);}
	return result;
}

function SendInitialStats()
{
	player1.SendInitialPlayerData();
	player2.SendInitialPlayerData();
	player3.SendInitialPlayerData();
	player4.SendInitialPlayerData();
}

function StartGame()
{
	gameInProgress = true;
	gameRound = 1;

	for(var i = 0; i < 4; i++){CreatePlayer(queuedPlayers.shift());}
	SendToQueue('player count', queuedPlayers.length);

	var nameString = "";
	nameString += PlayerByPlayerId(1).name + " and ";
	nameString += PlayerByPlayerId(2).name + " VS ";
	nameString += PlayerByPlayerId(3).name + " and ";
	nameString += PlayerByPlayerId(4).name;
	for(var i = 0; i < 4; i++)
	{
		PlayerByPlayerId(i + 1).EnterGame();
	}

	console.log("\nGAME STARTED! { " + nameString + " }");
	//	SEND THE PLAYERS' NAMES TO EACH PLAYER
	SendInitialStats();
	SendToPlayers('start game');	
}

function ProccessRound()
{
	//	CKECK ALL PLAYERS HAVE AN ACTION
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		if(PlayerByPlayerId(i + 1).action == undefined) return;
	}

	var executionOrder = new Array();
	var caster;
	var target;
	var spell;

	var results;

	//	Check for boost spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = PlayerByPlayerId(i + 1);
		spell = caster.action.spell;
		if(spell.name == "boost")
		{
			executionOrder.push(caster);
		}
	}
	//	Check for heal spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = PlayerByPlayerId(i + 1);
		spell = caster.action.spell;
		if(spell.name == "heal")
		{
			executionOrder.push(caster);
		}
	}
	//	Check for defence spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = PlayerByPlayerId(i + 1);
		spell = caster.action.spell;
		if(spell.type == "defend")
		{
			executionOrder.push(caster);
		}
	}
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = PlayerByPlayerId(i + 1);
		spell = caster.action.spell;
		if(spell.type == "attack")
		{
			executionOrder.push(caster);
		}
	}
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = PlayerByPlayerId(i + 1);
		spell = caster.action.spell;
		if(spell.type == "evade")
		{
			executionOrder.push(caster);
		}
	}

	console.log("\nROUND " + gameRound + " STATS:");

	for(var i = 0; i < executionOrder.length; i++)
	{
		caster = executionOrder[i];
		target = PlayerByPlayerId(caster.action.target);
		var multiplier = 1.0;
		if(caster.dead == false && target.dead == false && winningTeam == undefined)
		{
			spell = caster.action.spell;
			if(spell.type == "special")
			{
				if(spell.name == "boost")
				{
					//	Boost the target
					target.Boost(1.0);
					console.log(caster.name + " boosted " + target.name + "'s spell!");
				}
				if(spell.name == "heal")
				{
					//	Heal the target
					target.Heal(caster.action.spell.effect * caster.multiplier);
					if(caster == target)
					{
						console.log(caster.name + " healed themselves by " + (caster.action.spell.effect * caster.multiplier) + " points!");
					}
					else
					{
						console.log(caster.name + " healed " + target.name + " by " + (caster.action.spell.effect * caster.multiplier) + " points!");
					}
				}
			}
			if(spell.type == "defend")
			{
				target.Defend(spell.effect * caster.multiplier);
				if(caster == target)
				{
					console.log(caster.name + " increased their defence by " + (spell.effect * caster.multiplier) + " points!");
				}
				else
				{
					console.log(caster.name + " increased " + target.name + "'s defence by " + (spell.effect * caster.multiplier) + " points!");
				}
			}
			else if(spell.type == "attack")
			{
				if(target.action.spell.type == "evade")
				{
					if(CoinFlip(1.0 / target.action.spell.effect))
					{
						//	Evade fails
						target.Damage(spell.effect * caster.multiplier);
						console.log(target.name + " tried to evade " + caster.name + "'s spell but failed!");
						console.log(caster.name + " used '" + spell.name + "' and damaged " + target.name + " " + (spell.effect * caster.multiplier) + " points!");
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
					var differenceValue = target.defence - (spell.effect * caster.multiplier);
					if(differenceValue >= 1)
					{
						//	Reflect
						if(differenceValue >= (spell.effect * caster.multiplier)) differenceValue = (spell.effect * caster.multiplier);
						console.log(target.name + "'s defence overpowered " + caster.name + "'s '" + spell.name + "' spell, deflecting " + differenceValue + " back towards them!");
						caster.Damage(differenceValue);
					}
					else if (differenceValue <= -1)
					{
						target.Damage(-differenceValue);
						console.log(target.name + "'s defence absorbed " + (-differenceValue) + " damage from " + caster.name + "'s '" + spell.name + "' spell!");
					}
					else
					{
						console.log(target.name + "'s defence protected them from " + caster.name + "'s '" + spell.name + "' spell!");
					}
					target.defence -= (spell.effect * caster.multiplier);
				}
				else
				{
					target.Damage(spell.effect * caster.multiplier);
						console.log(caster.name + " used '" + spell.name + "' and damaged " + target.name + " " + (spell.effect * caster.multiplier) + " points!");
				}

				target.DeathCheck();
				if(target != caster) caster.DeathCheck();
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

			if(target.defence < 0) target.defence = 0;
			if(caster.defence < 0) caster.defence = 0;
		}
	}

	//	SHOW REOUND STATS
	for(var i = 1; i < ConnectedPlayers().length + 1; i++)
	{
		var p = PlayerByPlayerId(i);
		p.defence = 0;
		p.multiplier = 1.0;
		p.action = undefined;
		console.log(p.name + " { Health: " + p.health + ", Mana: " + p.mana + ", Defence: " + p.defence + " }");
	}

	SendStatsToPlayers();
	gameRound ++;
	SendToPlayers('next round');
	console.log("\n");
}

function HandleDisconnect(socket)
{
	var player = PlayerBySocketId(socket.id);

	//	Check if the player actally exists
	if(player == undefined)
	{
		console.log("Can not find player with socket id '" + socket.id + "'");
	}
	else
	{
		if(player.connected == false)
		{
			console.log(player.name + " is allready disconnected");
		}
		else
		{
			player.connected = false;
			if(player.inGame == true)
			{
				//	Handle a player in the current game
				console.log(player.name + " has left the game");
				player.Death();
				SendStatsToPlayers();
			}
			else if (player.inGame == false)
			{
				//	Handle a queueing player
				console.log(player.name + " has left the queue");
				RemovePlayerFromQueue(player);
				TryStartGame();
			}
		}
	}
}

function SendRoundResultsToClients(results)
{

}

function HandlePlayerDeath(player)
{
	if(((player1 == undefined)||(player1.dead == true)) && ((player2 == undefined)||(player2.dead == true)))
	{
		//	TEAM B WINS
		winningTeam = "B";
		EndGame(winningTeam);
	}
	else if(((player3 == undefined)||(player3.dead == true)) && ((player4 == undefined)||(player4.dead == true)))
	{
		//	TEAM A WINS
		winningTeam = "A";
		EndGame(winningTeam);
	}
}

function EndGame(winners)
{
	SendToPlayers('game over', winners);
	console.log("TEAM " + winners + " WINS!");

	var players = ConnectedPlayers();
	for(var i = 0; i < players.length; i++)
	{
		queuedPlayers.push(players[i]);
	}

	ResetGame();
}
function ResetGame()
{
	winningTeam = undefined;connectedPlayers = new Array();
	player1 = undefined;
	player2 = undefined;
	player3 = undefined;
	player4 = undefined;
	gameInProgress = false;
	TryStartGame();
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