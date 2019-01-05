//  WIZARD WARS, CREATED BY FLETCHER MORRIS

//  NETWORK STUFF
var serverAddress = 'http://localhost';
var serverPort = 5000;
var socket;
var networkState = "OFFLINE";
var connected = false;
var connectedPlayers = 0;
var playerData;


//  CANVAS SUFF
var canvas;
var context;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FPS_LIMIT = 30;
var debugGraphics = false;


//  LOADED SPELLS
var attackSpells = [];
var defendSpells = [];
var specialSpells = [];
var evadeSpells = [];

//  IMAGES
var wizard_img = new Image('images/wizz.png');
wizard_img.src = 'images/wizz.png';
var wizard_highlight_img = new Image();
wizard_highlight_img.src = 'images/wizz_highlight.png';
var wizard_dead_img = new Image();
wizard_dead_img.src = 'images/wizz_dead.png';
var wizard_aim_img = new Image();
wizard_aim_img.src = 'images/wizz_aiming.png';
var epic_0_img = new Image();
epic_0_img.src = 'images/epic_0.png';
var epic_1_img = new Image();
epic_1_img.src = 'images/epic_1.png';
var epic_2_img = new Image();
epic_2_img.src = 'images/epic_2.png';


//  OBJECTS
var all_Objects = [];
var nickname_text;
var submit_name_btn;
var server_text_message;
var epic_sprite_frames;
var epic_sprite;
var vs_text;
var attack_btn;
var attack_icon;
var defend_btn;
var special_btn;
var evade_btn;
var attack_choice_btns = [];
var defend_choice_btns = [];
var special_choice_btns = [];
var player_1_sprite;
var player_2_sprite;
var player_3_sprite;
var player_4_sprite;
var spellDescription;

//  RENDERER STUFF
var renderer;
var rendererButtons;
var rendererImages;
var rendererTexts;


//  INPUT STUFF
var lastLetterKeyDown = "";
var keySetArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", " ", "enter", "esc", "backspace"];
var keyDownArray = [];
var keyHeldArray = [];
var keyPrevArray = [];
var buttonPressedThisFrame = true;


//  GAME STUFF
var gameState = "START";
var changeToState = "START";
var hoveredButton = attack_btn;
var playerName = "";
var timeSinceStart = 0.0;
var timeSinceState = 0.0;
var dotTimer = 0;
var connectionTime;
var hoveredSpell;
var chosenSpell;
var selfPlayer;
var targetPlayer;
var teamPlayers, enemyPlayers;


window.addEventListener("load", function()
{
    document.addEventListener('keydown', KeyDown, false);
    document.addEventListener('keyup', KeyUp, false);
    canvas = document.getElementById('MainCanvas');
    context = canvas.getContext('2d');

    renderer = new Renderer();
    rendererButtons = new Array();
    rendererImages = new Array();
    rendererTexts = new Array();


    keyDownArray = Array(30).fill(false);
    keyHeldArray = Array(30).fill(false);
    keyPrevArray = Array(30).fill(false);

    CreateObjects();
    {
        setInterval(Update, 1000 / FPS_LIMIT);
    }

}, false);

function SetUpNetworking()
{
    socket = io(serverAddress + ":" + serverPort);
    socket.on('marco', function()
    {
        socket.emit('polo', function(data) {});
    });
    socket.on('message', function(data)
    {
        console.log(data);
    });
    socket.on('refuse connection', function(reason)
    {
        console.log("Connection To Server Refused, Reason : " + reason);
        SetGameState("CONNECTION_REFUSED");
    })
    socket.on('spells', function(spellData)
    {
        loadedSpells = spellData;
        LoadSpells();
        CreateSpellButtons();
        socket.emit('spells confirmed');
    });
    socket.on('confirm name', function(id)
    {
        connectionTime = timeSinceStart;
        SetGameState("CHOOSING_NAME");
    });
    socket.on('player count', function(count)
    {
        connectedPlayers = count;
        SetGameState("WAITING_FOR_PLAYERS", true);
    });
    socket.on('queue length', function(count)
    {
        connectedPlayers = count;
        SetGameState("JOINING_QUEUE", true);
    });
    socket.on('initial stats', function(statsArray)
    {
        playerData = new Array();
        selfPlayer = undefined;
        teamPlayers = new Array();
        enemyPlayers = new Array();

        console.log(statsArray);

        playerData.push(new Player(statsArray[0].name, player_1_sprite, player_1_info));
        playerData[0].SetInitialStats(statsArray[0].id, statsArray[0].name, statsArray[0].team);
        playerData.push(new Player(statsArray[1].name, player_2_sprite, player_2_info));
        playerData[1].SetInitialStats(statsArray[1].id, statsArray[1].name, statsArray[1].team);
        playerData.push(new Player(statsArray[2].name, player_3_sprite, player_3_info));
        playerData[2].SetInitialStats(statsArray[2].id, statsArray[2].name, statsArray[2].team);
        playerData.push(new Player(statsArray[3].name, player_4_sprite, player_4_info));
        playerData[3].SetInitialStats(statsArray[3].id, statsArray[3].name, statsArray[3].team);
        UpdatePlayerStatsText();
    });
    socket.on('start game', function(data)
    {
        SetGameState("VS_SCREEN");
    });
    socket.on('player stats', function(data)
    {
        for (var i = 0; i < 4; i++)
        {

            GetPlayerById(data[i].id).SetStats(data[i].health, data[i].mana, data[i].defence);
        }
        UpdatePlayerStatsText();
    });
    socket.on('next round', function(data)
    {
        SetGameState("CHOOSING_ACTION", true);
    });
}

class Player
{
    constructor(name, sprite, stats)
    {
        this.name = name;
        this.sprite = sprite;
        this.stats = stats;
        this.health = 10;
        this.mana = 10;
        this.defence = 0;
        this.stats.SetClearColour("purple");
        this.sprite.SetClearColour("blue");
        console.log("Created Player : " + this.name);
    }

    SetInitialStats(id, name, team)
    {
        this.id = id;
        this.name = name;
        this.team = team;

        if (selfPlayer == undefined)
        {
            selfPlayer = this;
            teamPlayers.push(this);
        }
        else if (this.team == selfPlayer.team)
        {
            teamPlayers.push(this);
        }
        else if (this.team != selfPlayer)
        {
            enemyPlayers.push(this);
        }
    }

    SetStats(health, mana, defence)
    {
        this.health = health;
        this.mana = mana;
        this.defence = defence;

        if (this.health <= 0)
        {
            this.SetSpriteImage(wizard_dead_img);
        }
    }

    SetSpriteImage(image)
    {
        this.sprite.SetImage(image);
    }

    RedrawSprite()
    {
        this.sprite.Redraw();
    }

    UpdateStatsText()
    {
        var newText = this.name;
        newText += "#hp : " + this.health;
        newText += "#mn : " + this.mana;
        newText += "#df : " + this.defence;
        this.stats.SetText(newText, true);
    }

    Target()
    {
        if (targetPlayer != undefined) targetPlayer.Untarget();
        targetPlayer = this;
        this.SetSpriteImage(wizard_highlight_img);
    }
    Untarget()
    {
        targetPlayer = undefined;
        this.SetSpriteImage(wizard_img);
    }
}

function GetPlayerById(id)
{
    for (var i = 0; i < 4; i++)
    {
        if (playerData[i].id == id) return playerData[i];
    }
}

function CreateObjects()
{
    all_Objects = new Array();

    //  NAME SELECTION PAGE OBJECTS
    server_text_message = new TextObject("server_message", new Vector2(400, 280), 800, 50, "CHOOSE A NAME", 25, "white");
    nickname_text = new TextObject("name_text", new Vector2(400, 320), 400, 40, "", 25, "white");
    nickname_text.SetClearColour("orange");
    submit_name_btn = new ButtonObject(new Vector2(300, 450), 200, 50, "ENTER", 25);
    submit_name_btn.SetFunction("SUBMITNAME");
    submit_name_btn.name = "submit_name_btn";

    epic_sprite = new ImageObject("epic_sprite", new Vector2(350, 0), epic_0_img);
    epic_sprite_frames = new Array();
    epic_sprite_frames.push(epic_0_img);
    epic_sprite_frames.push(epic_1_img);
    epic_sprite_frames.push(epic_2_img);
    epic_sprite.SetAnimationFrames(epic_sprite_frames, 2);
    vs_text = new TextObject("vs_text", new Vector2(400, 300), 80, 40, "VS", 40, "white");

    spellDescription = new TextObject("spell_description", new Vector2(400, 300), 300, 300, "SPELL DESCRIPTION", 15, "white");
    spellDescription.SetSplitter('#', "top");

    player_1_sprite = new ImageObject("player_1", new Vector2(50, 50), wizard_img);
    player_2_sprite = new ImageObject("player_2", new Vector2(50, 300), wizard_img);
    player_3_sprite = new ImageObject("player_3", new Vector2(650, 50), wizard_img);
    player_4_sprite = new ImageObject("player_4", new Vector2(650, 300), wizard_img);
    player_1_info = new TextObject("player_1_info", new Vector2(240, 150), 150, 90, "player 1#hp : 10#mn : 10#df : 0", 15, "white");
    player_1_info.SetSplitter('#', "top");
    player_1_info.SetAlign("left");
    player_2_info = new TextObject("player_2_info", new Vector2(240, 400), 150, 90, "player 2#hp : 10#mn : 10#df : 0", 15, "white");
    player_2_info.SetSplitter('#', "top");
    player_2_info.SetAlign("left");
    player_3_info = new TextObject("player_3_info", new Vector2(560, 150), 150, 90, "player 3#hp : 10#mn : 10#df : 0", 15, "white");
    player_3_info.SetSplitter('#', "top");
    player_3_info.SetAlign("right");
    player_4_info = new TextObject("player_4_info", new Vector2(560, 400), 150, 90, "player 4#hp : 10#mn : 10#df : 0", 15, "white");
    player_4_info.SetSplitter('#', "top");
    player_4_info.SetAlign("right");

    attack_btn = new ButtonObject(new Vector2(0, CANVAS_HEIGHT - 50), 200, 50, "ATTACK", 25);
    attack_btn.SetFunction("CHOOSING_ATTACK");
    defend_btn = new ButtonObject(new Vector2(200, CANVAS_HEIGHT - 50), 200, 50, "DEFEND", 25);
    defend_btn.SetFunction("CHOOSING_DEFEND");
    special_btn = new ButtonObject(new Vector2(400, CANVAS_HEIGHT - 50), 200, 50, "SPECIAL", 25);
    special_btn.SetFunction("CHOOSING_SPECIAL");
    evade_btn = new ButtonObject(new Vector2(600, CANVAS_HEIGHT - 50), 200, 50, "EVADE", 25);
    evade_btn.SetFunction("ACTION_evade");

    hoveredButton = attack_btn;
}

function CreateSpellButtons()
{
    for (var i = 0; i < attackSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(0, CANVAS_HEIGHT - 100 - (i * 50)), 200, 50, attackSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + attackSpells[i].name);
        attack_choice_btns.push(spellButton);
        spellButton.Enable(false);
    }
    for (var i = 0; i < defendSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(200, CANVAS_HEIGHT - 100 - (i * 50)), 200, 50, defendSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + defendSpells[i].name);
        defend_choice_btns.push(spellButton);
        spellButton.Enable(false);
    }
    for (var i = 0; i < specialSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(400, CANVAS_HEIGHT - 100 - (i * 50)), 200, 50, specialSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + specialSpells[i].name);
        special_choice_btns.push(spellButton);
        spellButton.Enable(false);
    }
}

function FindObject(name)
{
    for (var i = 0; i < all_Objects.length; i++)
    {
        if (all_Objects[i].name == name) return all_Objects[i];
    }

    console.log("Cannot Find Object '" + name + "'");
    return undefined;
}

function UpdatePlayerStatsText()
{
    for (var i = 0; i < 4; i++)
    {
        playerData[i].UpdateStatsText();
    }
}

//  HANDLE KEY-DOWN EVENTS
function KeyDown(e)
{
    ManageKey(e, true);
}
//  HANDLE KEY-UP EVENTS
function KeyUp(e)
{
    ManageKey(e, false);
}

function ManageKey(e, down)
{
    //console.log(down);
    var keyId = GetKeyId(e.key.toLowerCase());
    if (e.keyCode == 32) keyId = 26;

    keyHeldArray[keyId] = down;

    if (down)
    {
        if (keyPrevArray[keyId] == false)
        {
            keyDownArray[keyId] = true;
            if (keySetArray[keyId] != "enter")
            {
                if (keySetArray[keyId] != "esc")
                {
                    lastLetterKeyDown = keySetArray[keyId];
                }
            }
            //console.log("KEY " + keySetArray[keyId] + " : DOWN");
            keyPrevArray[keyId] = true;
        }
    }
    else
    {
        if (keyPrevArray[keyId] == true)
        {
            keyDownArray[keyId] = false;
            keyPrevArray[keyId] = false;
        }
    }
}

function GetKeyId(keyCode)
{
    var keyId = 0;
    //console.log(keyCode);
    if (keyCode == "arrowright") keyCode = "d";
    else if (keyCode == "arrowleft") keyCode = "a";
    else if (keyCode == "arrowup") keyCode = "w";
    else if (keyCode == "arrowdown") keyCode = "s";
    if (keyCode == "a")
    {
        keyId = 0;
    }
    else if (keyCode == "b")
    {
        keyId = 1;
    }
    else if (keyCode == "c")
    {
        keyId = 2;
    }
    else if (keyCode == "d")
    {
        keyId = 3;
    }
    else if (keyCode == "e")
    {
        keyId = 4;
    }
    else if (keyCode == "f")
    {
        keyId = 5;
    }
    else if (keyCode == "g")
    {
        keyId = 6;
    }
    else if (keyCode == "h")
    {
        keyId = 7;
    }
    else if (keyCode == "i")
    {
        keyId = 8;
    }
    else if (keyCode == "j")
    {
        keyId = 9;
    }
    else if (keyCode == "k")
    {
        keyId = 10;
    }
    else if (keyCode == "l")
    {
        keyId = 11;
    }
    else if (keyCode == "m")
    {
        keyId = 12;
    }
    else if (keyCode == "n")
    {
        keyId = 13;
    }
    else if (keyCode == "o")
    {
        keyId = 14;
    }
    else if (keyCode == "p")
    {
        keyId = 15;
    }
    else if (keyCode == "q")
    {
        keyId = 16;
    }
    else if (keyCode == "r")
    {
        keyId = 17;
    }
    else if (keyCode == "s")
    {
        keyId = 18;
    }
    else if (keyCode == "t")
    {
        keyId = 19;
    }
    else if (keyCode == "u")
    {
        keyId = 20;
    }
    else if (keyCode == "v")
    {
        keyId = 21;
    }
    else if (keyCode == "w")
    {
        keyId = 22;
    }
    else if (keyCode == "x")
    {
        keyId = 23;
    }
    else if (keyCode == "y")
    {
        keyId = 24;
    }
    else if (keyCode == "z")
    {
        keyId = 25;
    }
    else if (keyCode == "enter")
    {
        keyId = 27;
    }
    else if (keyCode == "esc")
    {
        keyId = 28;
    }
    else if (keyCode == "backspace")
    {
        keyId = 29;
    }
    return keyId;
}

function GetKeyDown(keyCode)
{
    var keyId = GetKeyId(keyCode);
    if (keyDownArray[keyId] == undefined)
    {
        return false;
    }
    return keyDownArray[keyId];
}

function GetLastLetterKeyDown(reset)
{
    var key = lastLetterKeyDown;
    if (reset) lastLetterKeyDown = "";
    return key;
}

function AppendStringWithInput(text, max)
{
    var newText = text;
    var newLetter = GetLastLetterKeyDown(true);
    if (newLetter == "backspace")
    {
        newText = newText.slice(0, -1);
    }
    else
    {
        if (newText.length < max)
        {
            newText += newLetter;
        }
    }
    return newText;
}

//  UPDATE OBJECTS IN THE SCENE
function Update()
{
    EnterGameState(changeToState);

    timeSinceStart += 1.0 / FPS_LIMIT;
    timeSinceState += 1.0 / FPS_LIMIT;

    buttonPressedThisFrame = false;

    if(GetKeyDown("u")) debugGraphics = !debugGraphics;

    if (gameState == "START")
    {
        SetGameState("CONNECTING_TO_SERVER");
    }
    else if (gameState == "CONNECTING_TO_SERVER")
    {
        dotTimer += 2.0 / FPS_LIMIT;
        var txt;
        if (dotTimer <= 1.0)
        {
            txt = "- CONNECTING TO SERVER |";
        }
        else if (dotTimer <= 2.0)
        {
            txt = "\\ CONNECTING TO SERVER /";
        }
        else if (dotTimer <= 3.0)
        {
            txt = "| CONNECTING TO SERVER -";
        }
        else if (dotTimer <= 4.0)
        {
            txt = "/ CONNECTING TO SERVER \\";
        }
        else
        {
            dotTimer = 0.0;
            txt = "- CONNECTING TO SERVER |";
        }
        server_text_message.SetText(txt);
    }
    else if (gameState == "CHOOSING_NAME")
    {
        playerName = AppendStringWithInput(playerName, 10);
        nickname_text.SetText(playerName);
        if (playerName.length >= 1) submit_name_btn.Enable(true);
        else submit_name_btn.Enable(false);
        submit_name_btn.Hover(true);

        if (timeSinceStart >= connectionTime + 20.0)
        {
            //  KICK FOR INACTIVITY
        }
    }
    else if (gameState == "WAITING_FOR_PLAYERS")
    {
        dotTimer += 2.0 / FPS_LIMIT;
        var txt;
        if (dotTimer <= 1.0)
        {
            txt = "- WAITING FOR PLAYERS (" + connectedPlayers + "/4) |";
        }
        else if (dotTimer <= 2.0)
        {
            txt = "\\ WAITING FOR PLAYERS (" + connectedPlayers + "/4) /";
        }
        else if (dotTimer <= 3.0)
        {
            txt = "| WAITING FOR PLAYERS (" + connectedPlayers + "/4) -";
        }
        else if (dotTimer <= 4.0)
        {
            txt = "/ WAITING FOR PLAYERS (" + connectedPlayers + "/4) \\";
        }
        else
        {
            dotTimer = 0.0;
            txt = "- WAITING FOR PLAYERS (" + connectedPlayers + "/4) |";
        }
        server_text_message.SetText(txt);
    }
    else if (gameState == "CHOOSING_ACTION")
    {
        if ((hoveredButton != attack_btn) && (hoveredButton != defend_btn) && (hoveredButton != special_btn) && (hoveredButton != evade_btn))
        {
            attack_btn.Hover(true);
        }

        if (GetKeyDown("arrowright"))
        {
            if (hoveredButton == attack_btn) SetGameState("CHOOSING_DEFEND");
        }
        else if (GetKeyDown("arrowleft"))
        {
            if (hoveredButton == attack_btn) SetGameState("CHOOSING_EVADE");
        }

        RedrawPlayerSprites();
    }
    else if(gameState == "VS_SCREEN")
    {
        if(timeSinceState >= 6.0)
        {
            epic_sprite.Enable(false);
            SetGameState("CHOOSING_ATTACK");
        }
        if(timeSinceState >= 4.0)
        {
            for(var i = 0; i < 2; i ++)
            {
                enemyPlayers[i].sprite.Enable(true);
                enemyPlayers[i].stats.Enable(true);
            }
        }
        if(timeSinceState >= 2.0)
        {
            vs_text.Enable(true);
        }
        for(var i = 0; i < 2; i ++)
        {
            teamPlayers[i].sprite.Enable(true);
            teamPlayers[i].stats.Enable(true);
        }
    }
    else if (gameState == "CHOOSING_ATTACK")
    {
        var b = 0;
        for (var i = 0; i < attack_choice_btns.length; i++)
        {
            if (attack_choice_btns[i] == hoveredButton) b = i;
        }

        hoveredSpell = GetSpell(attack_choice_btns[b].text);
        var spellText = "";
        spellText += (hoveredSpell.name.toUpperCase() + "#");
        spellText += ("COST : " + hoveredSpell.cost + "#");
        spellText += ("DAMAGE : " + hoveredSpell.effect + "#");
        spellText += (hoveredSpell.desc);
        spellDescription.SetText(spellText);
        UpdatePlayerStatsText();

        if (GetKeyDown("arrowup"))
        {
            b++;
            if (b >= attack_choice_btns.length) b = 0;
            attack_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowdown"))
        {
            b--;
            if (b < 0) b = attack_choice_btns.length - 1;
            attack_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowright"))
        {
            defend_btn.Hover(true);
            defend_btn.Press();
        }
        else if (GetKeyDown("arrowleft"))
        {
            SetGameState("CHOOSING_EVADE");
        }

        RedrawPlayerSprites();
    }
    else if (gameState == "CHOOSING_DEFEND")
    {
        var b = 0;
        for (var i = 0; i < defend_choice_btns.length; i++)
        {
            if (defend_choice_btns[i] == hoveredButton) b = i;
        }

        hoveredSpell = GetSpell(defend_choice_btns[b].text);
        var spellText = "";
        spellText += (hoveredSpell.name.toUpperCase() + "#");
        spellText += ("COST : " + hoveredSpell.cost + "#");
        spellText += ("DEFENCE : +" + hoveredSpell.effect + "#");
        spellText += (hoveredSpell.desc);
        spellDescription.SetText(spellText);
        UpdatePlayerStatsText();

        if (GetKeyDown("arrowup"))
        {
            b++;
            if (b >= defend_choice_btns.length) b = 0;
            defend_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowdown"))
        {
            b--;
            if (b < 0) b = defend_choice_btns.length - 1;
            defend_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowright"))
        {
            special_btn.Press();
        }
        else if (GetKeyDown("arrowleft"))
        {
            attack_btn.Press();
        }

        RedrawPlayerSprites();
    }
    else if (gameState == "CHOOSING_SPECIAL")
    {
        var b = 0;
        for (var i = 0; i < special_choice_btns.length; i++)
        {
            if (special_choice_btns[i] == hoveredButton) b = i;
        }

        hoveredSpell = GetSpell(special_choice_btns[b].text);
        var spellText = "";
        spellText += (hoveredSpell.name.toUpperCase() + "#");
        spellText += ("COST : " + hoveredSpell.cost + "#");
        if (hoveredSpell.name == "heal")
        {
            spellText += ("EFFECT : +" + hoveredSpell.effect + "#");
        }
        else
        {
            spellText += ("EFFECT : +" + hoveredSpell.effect + "#");
        }
        spellText += (hoveredSpell.desc);
        spellDescription.SetText(spellText);
        UpdatePlayerStatsText();

        if (GetKeyDown("arrowup"))
        {
            b++;
            if (b >= special_choice_btns.length) b = 0;
            special_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowdown"))
        {
            b--;
            if (b < 0) b = special_choice_btns.length - 1;
            special_choice_btns[b].Hover(true);
        }
        else if (GetKeyDown("arrowright"))
        {
            SetGameState("CHOOSING_EVADE");
        }
        else if (GetKeyDown("arrowleft"))
        {
            defend_btn.Press();
        }

        RedrawPlayerSprites();
    }
    else if (gameState == "CHOOSING_EVADE")
    {
        hoveredSpell = GetSpell("evade");
        var spellText = "";
        spellText += (hoveredSpell.name.toUpperCase() + "#");
        spellText += ("COST : " + hoveredSpell.cost + "#");
        spellText += ("CHANCE : " + (1.0 / hoveredSpell.effect) + "#");
        spellText += (hoveredSpell.desc);
        spellDescription.SetText(spellText);
        UpdatePlayerStatsText();

        if (GetKeyDown("arrowright"))
        {
            attack_btn.Press();
        }
        else if (GetKeyDown("arrowleft"))
        {
            special_btn.Press();
        }

        RedrawPlayerSprites();
    }
    else if (gameState == "CHOOSING_TARGET")
    {
        if (GetKeyDown("arrowright"))
        {
            FindNextTarget(chosenSpell).Target();
        }
        else if (GetKeyDown("arrowleft"))
        {
            FindNextTarget(chosenSpell).Target();
        }
        else if (GetKeyDown("arrowup"))
        {
            FindNextTarget(chosenSpell).Target();
        }
        else if (GetKeyDown("arrowdown"))
        {
            FindNextTarget(chosenSpell).Target();
        }
        else if (GetKeyDown("esc"))
        {
            SetGameState("CHOOSING_ACTION");
        }
        else if (GetKeyDown("backspace"))
        {
            SetGameState("CHOOSING_ACTION");
        }
        else if (GetKeyDown("enter"))
        {
            SubmitSpell(targetPlayer, chosenSpell);
        }

        RedrawPlayerSprites();
    }

    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].Update();
    }
    Render();
    FixInput();
}

function SetGameState(state)
{
    changeToState = state;
}

function EnterGameState(force)
{
    if (changeToState == undefined) return;
    if (changeToState == gameState && force !== true) return;
    var isState = true;
    timeSinceState = 0;

    ClearCanvas();

    if (changeToState == "CONNECTING_TO_SERVER")
    {
        DisableActiveObjects();
        server_text_message.Enable(true);
        SetUpNetworking();
    }
    else if (changeToState == "CHOOSING_NAME")
    {
        DisableActiveObjects();
        server_text_message.text = "CHOOSE A NAME";
        server_text_message.Enable(true);
        nickname_text.Enable(true);
    }
    else if (changeToState == "JOINING_QUEUE")
    {
        DisableActiveObjects();
        ClearAll();
        server_text_message.text = "SERVER FULL (" + (connectedPlayers) + " IN QUEUE)";
        server_text_message.Enable(true);
    }
    else if (changeToState == "WAITING_FOR_PLAYERS")
    {
        DisableActiveObjects();
        ClearAll();
        server_text_message.text = "WAITING FOR PLAYERS (" + connectedPlayers + "/4)";
        server_text_message.Enable(true);
    }
    else if (changeToState == "CONNECTION_REFUSED")
    {
        EnableAllObjects(false);
        ClearAll();
        server_text_message.text = "CONNECTION REFUSED";
        server_text_message.Enable(true);
    }
    else if (changeToState == "VS_SCREEN")
    {
        EnableAllObjects(false);
        ClearAll();
        epic_sprite.Enable(true);
    }
    else if (changeToState == "CHOOSING_ACTION")
    {
        DisableActiveObjects();
        ClearAll();
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        hoveredSpell = undefined;
        chosenSpell = undefined;
        EnableActionButtons(true);
        SetAvailableSpells();
    }
    else if (changeToState == "CHOOSING_ATTACK")
    {
        EnableAttackOptionObjects(true);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(false);
        EnableActionButtons(true);
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        hoveredSpell = undefined;
        chosenSpell = undefined;
        if (targetPlayer != undefined) targetPlayer.Untarget();
        attack_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if (changeToState == "CHOOSING_DEFEND")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(true);
        EnableSpecialOptionObjects(false);
        EnableActionButtons(true);
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        hoveredSpell = undefined;
        chosenSpell = undefined;
        defend_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if (changeToState == "CHOOSING_SPECIAL")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(true);
        EnableActionButtons(true);
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        hoveredSpell = undefined;
        chosenSpell = undefined;
        special_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if (changeToState == "CHOOSING_EVADE")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(false);
        EnableActionButtons(true);
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        hoveredSpell = GetSpell("evade");
        chosenSpell = undefined;
        evade_btn.Hover(true);
        spellDescription.Enable(true);
    }
    else if (changeToState == "CHOOSING_TARGET")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(false);
        EnablePlayerSprites(true);
        EnablePlayerStats(true);
        FindNextTarget(chosenSpell).Target();
    }
    else
    {
        isState = false;
    }

    if (isState)
    {
        gameState = changeToState;
        changeToState = undefined;
        console.log(("ENTERED GAME STATE : ") + gameState);
    }
    else
    {
        console.log("'" + changeToState + "' IS NOT A STATE");
    }
}

function EnableAllObjects(enable)
{
    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].Enable(enable);
    }
}

function DisableActiveObjects()
{
    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].Enable(false);
    }
}

function ClearAll()
{
    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].clear = true;
    }
}
function ClearCanvas()
{
    context.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
}

function EnableActionButtons(enable)
{
    attack_btn.Enable(enable);
    defend_btn.Enable(enable);
    special_btn.Enable(enable);
    evade_btn.Enable(enable);
}

function EnableAttackOptionObjects(enable)
{
    for (var i = 0; i < attack_choice_btns.length; i++)
    {
        attack_choice_btns[i].Enable(enable);
    }
}

function EnableDefendOptionObjects(enable)
{
    for (var i = 0; i < defend_choice_btns.length; i++)
    {
        defend_choice_btns[i].Enable(enable);
    }
}

function EnableSpecialOptionObjects(enable)
{
    for (var i = 0; i < special_choice_btns.length; i++)
    {
        special_choice_btns[i].Enable(enable);
    }
}

function EnablePlayerSprites(enable)
{
    player_1_sprite.Enable(enable);
    player_2_sprite.Enable(enable);
    player_3_sprite.Enable(enable);
    player_4_sprite.Enable(enable);
}

function RedrawPlayerSprites()
{
    for (var i = 0; i < 4; i++)
    {
        playerData[i].RedrawSprite();
    }
}

function EnablePlayerStats(enable)
{
    UpdatePlayerStatsText();
    player_1_info.Enable(enable);
    player_2_info.Enable(enable);
    player_3_info.Enable(enable);
    player_4_info.Enable(enable);
}

function FindNextTarget(spell)
{
    var availableTargets = new Array();
    if (spell.targets == "enemies")
    {
        availableTargets = GetLivingEnemies();
        if (availableTargets.length == 1) return availableTargets[0];
        for (var i = 0; i < availableTargets.length; i++)
        {
            if (availableTargets[i] != targetPlayer) return availableTargets[i];
        }
    }
    else if (spell.targets == "team")
    {
        availableTargets = GetLivingTeam();
        if (availableTargets.length == 1) return availableTargets[0];
        for (var i = 0; i < availableTargets.length; i++)
        {
            if (availableTargets[i] != targetPlayer) return availableTargets[i];
        }
    }
    else if (spell.targets == "ally")
    {
        if (teamPlayers[1].health >= 1) return teamPlayers[1];
        else return undefined;
    }
    else if (spell.targets == "self")
    {
        return selfPlayer;
    }
    else
    {
        console.log("COULD NOT IDENTIFY SPELL TATGET TYPE : " + spell.targets);
        return undefined;
    }
    console.log("No targets available for spell '" + spell + "'");
    return undefined;
}

function GetLivingEnemies()
{
    var result = new Array();
    for (var i = 0; i < 2; i++)
    {
        if (enemyPlayers[i].health >= 1) result.push(enemyPlayers[i]);
    }
    return result;
}

function GetLivingTeam()
{
    var result = new Array();
    for (var i = 0; i < 2; i++)
    {
        if (teamPlayers[i].health >= 1) result.push(teamPlayers[i]);
    }
    return result;
}

//  RENDER THE SCENE
function Render()
{
    renderer.Proccess();
    renderer.Flush();
}

//  RESET INPUTS TO FALSE
function FixInput()
{
    keyDownArray = Array(30).fill(false);
}

//  A SIMPLE CLASS FOR STORING POSITIONS
class Vector2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

class Object
{
    constructor(name, pos)
    {
        this.name = name;
        this.pos = pos;
        this.parent = parent;
        this.renderable = false;
        this.Enable(false);
        this.clearColour = "green";
        all_Objects.push(this);
    }

    Enable(enable)
    {
        this.enabled = enable;
        this.clear = true;
        this.draw = enable;

        if (this.enabled == enable) return;
        if (enable == true)
        {
            console.log("Enabled Object : " + this.name);
        }
        else
        {
            console.log("Disabled Object : " + this.name);
        }
    }

    Update()
    {
        if (this.enabled)
        {

        }
        else
        {
            this.draw = false;
        }
    }

    SetPosition(x, y)
    {
        this.pos.x = x;
        this.pos.y = y;
        this.clear = true;
        if (this.enabled) this.draw = true;
    }

    SetClearColour(colour)
    {
        this.clearColour = colour;
    }
}

class ImageObject extends Object
{
    constructor(name, pos, image)
    {
        super(name, pos);
        rendererImages.push(this);
        this.image = image;
        this.draw = true;
        this.animated = false;
    }
    SetScale(width, height)
    {
        this.width = width;
        this.height = height;
        this.customScale = true;
    }
    SetImage(image)
    {
        if (this.image != image)
            this.Redraw();
        this.image = image;
    }

    Enable(enable)
    {
        if (this.enabled == enable) return;
        super.Enable(enable);
        this.draw = enable;
    }

    Redraw()
    {
        this.draw = true;
    }

    SetAnimationFrames(framesArray, interval)
    {
        this.animated = true;
        this.animFrames = framesArray;
        if (interval != undefined) this.SetAnimationSpeed(interval);
    }
    SetAnimationSpeed(interval)
    {
        this.animInterval = interval;
        this.animFrameCounter = 0;
        this.currentFrame = 0;
        this.SetImage(this.animFrames[0]);
    }

    Update()
    {
        if (this.enabled)
        {
            super.Update();

            if (this.animated)
            {
                this.animFrameCounter++;
                if (this.animFrameCounter >= this.animInterval)
                {
                    this.currentFrame++;
                    if (this.currentFrame >= this.animFrames.length) this.currentFrame = 0;
                    this.SetImage(this.animFrames[this.currentFrame]);
                    this.animFrameCounter = 0;
                }
            }
        }
        else
        {
            this.draw = false;
        }
    }

    Render()
    {
        if (this.draw)
        {
            if (this.customScale)
            {
                context.clearRect(this.pos.x, this.pos.y, this.pos.x + this.width, this.pos.y - this.height);
            }

            if (this.enabled)
            {
                if (this.customScale)
                {
                    context.drawImage(this.image, this.pos.x, this.pos.y, this.width, this.height);
                }
                else
                {
                    context.drawImage(this.image, this.pos.x, this.pos.y);
                }
            }

            this.draw = false;
        }
    }
}

class ButtonObject extends Object
{
    constructor(pos, width, height, text, fontSize)
    {
        super((text) + ("_button"), pos);
        this.width = width;
        this.height = height;
        this.text = text;
        this.fontSize = fontSize;
        this.grey = false;
        rendererButtons.push(this);
        this.draw = true;
        this.hoverClear = false;
    }

    Enable(enable)
    {
        if (enable == true)
        {
            this.draw = true;
        }
        else
        {
            this.draw = false;
            this.clear = true;
            this.Hover(false);
        }
        this.enabled = enable;
    }

    Update()
    {
        if (this.enabled)
        {
            super.Update();

            if (this.hovered)
            {
                if (GetKeyDown("enter") && buttonPressedThisFrame == false)
                {
                    this.Press();
                }
            }
        }
        else
        {
            this.draw = false;
        }
    }

    Hover(hover, force)
    {
        if (hover)
        {
            if (this.grey == false || force == true)
            {
                if (hoveredButton != this)
                {
                    hoveredButton.Hover(false);
                }
                hoveredButton = this;
            }
        }
        if (hover != this.hovered)
        {
            if (this.enabled)
            {
                this.draw = true;
                this.hoverClear = true;
            }
            else
            {
                this.draw = false;
                this.clear = true;
            }
        }
        this.hovered = hover;
    }

    GreyOut(makeGrey)
    {
        if (makeGrey)
        {
            this.grey = makeGrey;
        }
        if (makeGrey != this.grey)
        {
            if (this.enabled)
            {
                this.draw = true;
                this.clear = true;
            }
        }
    }

    Press()
    {
        if (this.grey) return;
        buttonPressedThisFrame = true;
        CallButtonFunction(this.functionString);
    }

    SetFunction(functionString)
    {
        this.functionString = functionString;
    }

    Render()
    {
        if (this.clear)
        {
            context.clearRect(this.pos.x - 4, this.pos.y - 4, this.width + 8, this.height + 8);
            if (debugGraphics == true)
            {
                context.fillStyle = this.clearColour;
                context.fillRect(this.pos.x - 4, this.pos.y - 4, this.width + 8, this.height + 8);
                info += "</br>" + this.name;
            }
            this.clear = false;
        }
        else if(this.hoverClear == true)
        {
            context.clearRect(this.pos.x, this.pos.y, this.width, this.height);
            if (debugGraphics == true)
            {
                context.fillStyle = this.clearColour;
                context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
                info += "</br>" + this.name;
            }
            this.hoverClear = false;
        }
        if (this.draw == true)
        {
            renderer.SubmitStroke(new RendererStroke(new Vector2(this.pos.x, this.pos.y), this.width, this.height, 4, "white"));
            if (this.grey)
            {
                renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width / 2, this.pos.y + (this.height / 2), "center", "grey", this.fontSize));
            }
            else if (this.hovered)
            {
                renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width / 2, this.pos.y + (this.height / 2), "center", "yellow", this.fontSize));
            }
            else
            {
                renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width / 2, this.pos.y + (this.height / 2), "center", "white", this.fontSize));
            }

            this.draw = false;
        }
    }
}

function CallButtonFunction(functionString)
{
    //console.log("Trying to call function '" + functionString + "'");
    if (functionString == "SUBMITNAME")
    {
        socket.emit('name is', playerName);
    }
    else if (functionString == "CHOOSING_ATTACK")
    {
        SetGameState("CHOOSING_ATTACK");
    }
    else if (functionString == "CHOOSING_DEFEND")
    {
        SetGameState("CHOOSING_DEFEND");
    }
    else if (functionString == "CHOOSING_SPECIAL")
    {
        SetGameState("CHOOSING_SPECIAL");
    }
    else if (functionString == "CHOOSING_EVADE")
    {

    }
    else if (functionString.includes("ACTION_"))
    {
        chosenSpell = GetSpell(functionString.split('_')[1]);
        SetGameState("CHOOSING_TARGET");
    }
}

class TextObject extends Object
{
    constructor(name, pos, width, height, text, fontSize, colour)
    {
        super(name, pos);
        this.width = width;
        this.height = height;
        this.text = text;
        this.fontSize = fontSize;
        this.SetAlign("center");
        this.colour = colour;
        this.clear = true;
        this.draw = true;
        this.yOffset = 0;
        rendererTexts.push(this);
    }

    Enable(enable)
    {
        super.Enable(enable);
        if (enable == false)
        {
            this.clear = true;
        }
    }

    SetText(text, force)
    {
        if (text != this.text || force == true)
        {
            this.text = text;
            this.clear = true;
            this.draw = true;
        }
    }

    SetSplitter(splitter, anchor)
    {
        if (splitter != undefined)
        {
            this.lineSplitter = splitter;
            this.multiline = true;
            this.lineAnchor = anchor;
            if(anchor == "top")
            {
                this.yOffset = -(this.height / 2.0);
            }
            else if(anchor == "center")
            {
                this.yOffset = 0;
            }
        }
        else
        {
            this.multiline = false;
        }
    }

    SetAlign(align)
    {
        this.textAlign = align;
        if(align == "left")
        {
            this.xOffset = -(this.width / 2.0);
        }
        else if(align == "right")
        {
            this.xOffset = (this.width / 2.0);
        }
        else if(align == "center")
        {
            this.xOffset = 0;
        }
    }

    Update()
    {
        if (this.enabled)
        {
            super.Update();
        }
    }

    Render()
    {
        if (this.clear)
        {
            context.clearRect(this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
            if (debugGraphics == true)
            {
                context.fillStyle = this.clearColour;
                context.fillRect(this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
                info += "</br>" + this.name;
            }
            this.clear = false;
        }
        if (this.draw)
        {
            if (this.enabled && this.text != "")
            {
                if (this.multiline)
                {
                    var textArray = new Array();
                    textArray = this.text.split(this.lineSplitter);
                    var lineCount = textArray.length;
                    var anchor = 0;
                    for (var l = 0; l < lineCount; l++)
                    {
                        if (this.lineAnchor == "center") anchor = (l + lineCount / 2.0);
                        if (this.lineAnchor == "top") anchor = (l + 0.5);
                        var line = textArray[l].toString();
                        renderer.SubmitText(new RendererText(line, this.pos.x + this.xOffset, this.pos.y + ((1.5 * this.fontSize) * anchor) + this.yOffset, this.textAlign, this.colour, this.fontSize));
                    }
                }
                else
                {
                    renderer.SubmitText(new RendererText(this.text, this.pos.x + this.xOffset, this.pos.y + this.yOffset, this.textAlign, this.colour, this.fontSize));
                }
            }

            this.draw = false;
        }
    }
}

function LoadSpells()
{
    attackSpells = new Array();
    defendSpells = new Array();
    specialSpells = new Array();
    evadeSpells = new Array();

    for (var i = 0; i < loadedSpells.length; i++)
    {
        var newSpell = loadedSpells[i];
        if(GetSpell(newSpell.name) == undefined)
        {
            if (newSpell.type == "attack")
            {
                attackSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc, newSpell.targets));
            }
            else if (newSpell.type == "defend")
            {
                defendSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc, newSpell.targets));
            }
            else if (newSpell.type == "special")
            {
                specialSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc, newSpell.targets));
            }
            else if (newSpell.type == "evade")
            {
                evadeSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc, newSpell.targets));
            }
        }
    }

    console.log("Loaded Spells :");
    console.log(loadedSpells);
}

class Spell
{
    constructor(name, type, cost, effect, desc, targets)
    {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.effect = effect;
        this.desc = desc;
        this.targets = targets;
    }
}

class Action
{
    constructor(target, spell)
    {
        this.target = target;
        this.spell = spell;
    }
}

function SetAvailableSpells()
{
    for (var i = 0; i < loadedSpells.length; i++)
    {
        if (loadedSpells[i].cost > selfPlayer.mana || FindNextTarget(loadedSpells[i]) == undefined)
        {
            FindObject((loadedSpells[i].name.toUpperCase() + "_button")).GreyOut(true);
        }
    }
}

function SubmitSpell(target, spell)
{
    var act = new Action(target.id, spell.name);
    socket.emit('action', act);
}

function GetSpell(spellName)
{
    spellName = spellName.toString().toLowerCase();
    var returnSpell;
    for (var i = 0; i < attackSpells.length; i++)
    {
        if (attackSpells[i].name == spellName) returnSpell = attackSpells[i];
    }
    for (var i = 0; i < defendSpells.length; i++)
    {
        if (defendSpells[i].name == spellName) returnSpell = defendSpells[i];
    }
    for (var i = 0; i < specialSpells.length; i++)
    {
        if (specialSpells[i].name == spellName) returnSpell = specialSpells[i];
    }
    for (var i = 0; i < evadeSpells.length; i++)
    {
        if (evadeSpells[i].name == spellName) returnSpell = evadeSpells[i];
    }

    return returnSpell;
}

class RendererStroke
{
    constructor(pos, width, height, strokeWidth, strokeColour)
    {
        this.pos = pos;
        this.width = width;
        this.height = height;
        this.strokeWidth = strokeWidth;
        this.strokeColour = strokeColour;
    }
}
class RendererText
{
    constructor(text, x, y, align, colour, size)
    {
        this.text = text;
        this.x = x;
        this.y = y;
        this.align = align;
        this.colour = colour;
        this.size = size;
    }
}

class Renderer
{
    constructor()
    {
        this.batchedStrokes = [];
        this.batchedTexts = [];
    }

    SubmitImage(image)
    {
        this.batchedImages.push(image);
    }

    SubmitStroke(stroke)
    {
        this.batchedStrokes.push(stroke);
    }

    SubmitText(text)
    {
        this.batchedTexts.push(text);
    }

    Proccess()
    {
        for (var i = 0; i < rendererTexts.length; i++)
        {
            rendererTexts[i].Render();
        }
        for (var i = 0; i < rendererButtons.length; i++)
        {
            rendererButtons[i].Render();
        }
    }

    Flush()
    {
        //  RENDER IMAGES
        for (var i = 0; i < rendererImages.length; i++)
        {
            rendererImages[i].Render();
        }

        //  RENDER STROKES
        if (this.batchedStrokes.length >= 1)
        {
            context.beginPath();
            for (var i = 0; i < this.batchedStrokes.length; i++)
            {
                context.rect(this.batchedStrokes[i].pos.x, this.batchedStrokes[i].pos.y, this.batchedStrokes[i].width, this.batchedStrokes[i].height);
                context.strokeStyle = this.batchedStrokes[i].strokeColour;
                context.lineWidth = this.batchedStrokes[i].strokeWidth;
            }
            context.stroke();
            context.closePath();
            this.batchedStrokes = [];
        }

        //  RENDER TEXTS
        if (this.batchedTexts.length >= 1)
        {
            context.textBaseline = "middle";
            for (var i = 0; i < this.batchedTexts.length; i++)
            {
                context.textAlign = this.batchedTexts[i].align;
                context.font = (this.batchedTexts[i].size + "px PressStart2P");
                context.fillStyle = this.batchedTexts[i].colour;
                context.fillText(this.batchedTexts[i].text, this.batchedTexts[i].x, this.batchedTexts[i].y);
            }
            this.batchedTexts = [];
        }


        if (debugGraphics == true)
        {
            document.getElementById("info").innerHTML = info;
            info = "Clearing :";
        }
    }
}

var info = "Clearing :";