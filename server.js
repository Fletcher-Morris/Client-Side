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
		console.log("\n" + name + " joined the queue");
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
	}
}
function RefuseConnection(socket, reason)
{
	socket.emit('refuse connection', reason);
	console.log("\nRefused connection to player, reason : " + reason + ".");
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
		this.health = serverSettings.playerHealth;
		this.mana = serverSettings.playerMana;
		this.socket = socket;
		this.id = id;
		this.timeout = 5;
		this.dead = false;
		this.inGame = false;
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

	EnterGame()
	{
		this.socket.on('disconnect', function()
		{
			console.log(this.id.toString() + " DISCONNECTED!");
		});
	}

	Send(command, message)
	{
		this.socket.emit(command, message);
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
		console.log(this.name + " targeted " + GetPlayerById(this.action.target).name + " with the '" + act.spell.name + "' spell");
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
var winningTeam = 0;

function ConnectedPlayers()
{
	var result = [];
	if(player1 != undefined) result.push(player1);
	if(player2 != undefined) result.push(player2);
	if(player3 != undefined) result.push(player3);
	if(player4 != undefined) result.push(player4);
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
	for(var i = 0; i < 4; i++)
	{
		nameString += GetPlayerById(i + 1).name;
		if(i < 3) nameString += ", ";
		GetPlayerById(i + 1).EnterGame();
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
		if(GetPlayerById(i + 1).action == undefined) return;
	}

	var executionOrder = new Array();
	var caster;
	var target;
	var spell;

	//	Check for boost spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.name == "boost")
		{
			executionOrder.push(caster);
		}
	}
	//	Check for heal spells
	for(var i = 0; i < ConnectedPlayers().length; i++)
	{
		caster = GetPlayerById(i + 1);
		spell = caster.action.spell;
		if(spell.name == "heal")
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

	console.log("\nROUND " + gameRound + " STATS:");

	for(var i = 0; i < executionOrder.length; i++)
	{
		caster = executionOrder[i];
		target = GetPlayerById(caster.action.target);
		var multiplier = 1.0;
		if(caster.dead == false && target.dead == false && winningTeam == 0)
		{
			spell = caster.action.spell;
			if(spell.type == "special")
			{
				if(spell.name == "boost")
				{
					//	Boost the target
					target.Boost(1.0);
					console.log(caster.name + " boosted " + target.name + "'s' spell!");
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
						if(serverSettings.limitReflectedDamage != false && differenceValue >= (spell.effect * caster.multiplier)) differenceValue = (spell.effect * caster.multiplier);
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
		var p = GetPlayerById(i);
		if(serverSettings.resetDefence != false) p.defence = 0;
		if(serverSettings.resetBoost != false) p.multiplier = 1.0;
		p.action = undefined;
		console.log(p.name + " { Health: " + p.health + ", Mana: " + p.mana + ", Defence: " + p.defence + " }");
	}

	SendStatsToPlayers();
	gameRound ++;

	console.log("\n");
}

function HandlePlayerDeath(player)
{
	if(player1.dead == true && player2.dead == true)
	{
		//	TEAM 2 WINS
		winningTeam = 2;
		EndGame(winningTeam);
	}
	else if(player3.dead == true && player4.dead == true)
	{
		//	TEAM 1 WINS
		winningTeam = 1;
		EndGame(winningTeam);
	}
}

function EndGame(winners)
{
	SendToPlayers('game over', winners);
	winningTeam = 0;

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