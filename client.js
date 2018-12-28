

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
var wizard_1_img = new Image();
wizard_1_img.src = 'images/wizz.png';
var wizard_2_img = new Image();
wizard_2_img.src = 'images/wizard_2_img.png';
var wizard_3_img = new Image();
wizard_3_img.src = 'images/wizard_3_img.png';
var wizard_4_img = new Image();
wizard_4_img.src = 'images/wizard_4_img.png';
var wizard_5_img = new Image();
wizard_5_img.src = 'images/wizard_5_img.png';
var wizard_6_img = new Image();
wizard_6_img.src = 'images/wizard_6_img.png';
var wizard_7_img = new Image();
wizard_7_img.src = 'images/wizard_7_img.png';
var wizard_8_img = new Image();
wizard_8_img.src = 'images/wizard_8_img.png';

//  OBJECTS
var all_Objects = [];
var nickname_text;
var submit_name_btn;
var server_text_message;
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
var keySetArray = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"," ","enter","esc","backspace"];
var keyDownArray = [];
var keyHeldArray = [];
var keyPrevArray = [];
var buttonPressedThisFrame = true;


//  GAME STUFF
var gameState = "START";
var hoveredButton = attack_btn;
var playerName = "";
var timeSinceStart = 0.0;
var dotTimer = 0;
var connectionTime;


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

    LoadSpells();
    CreateObjects();
    {
        setInterval(Update, 1000/FPS_LIMIT);
    }

}, false);

function SetUpNetworking()
{
    socket = io(serverAddress + ":" + serverPort);
    socket.on('marco', function() {socket.emit('polo', function(data){});});
    socket.on('message', function(data) {console.log(data);});
    socket.on('refuse connection', function(reason)
    {
        console.log("Connection To Server Refused, Reason : " + reason);
        EnterGameState("CONNECTION_REFUSED");
    })
    socket.on('confirm name', function(id)
    {
        connectionTime = timeSinceStart;
        EnterGameState("CHOOSING_NAME");
    });
    socket.on('player count', function(count)
    {
        connectedPlayers = count;
        EnterGameState("WAITING_FOR_PLAYERS", true);
    });
    socket.on('queue length', function(count)
    {
        connectedPlayers = count;
        EnterGameState("JOINING_QUEUE", true);
    });
    socket.on('player names', function(nameString)
    {
        var names = nameString.split("_");
        playerData = new Array();
        playerData.push(new Player(names[0]));
        playerData.push(new Player(names[1]));
        playerData.push(new Player(names[2]));
        playerData.push(new Player(names[3]));
    });
    socket.on('start game', function(data)
    {
        EnterGameState("CHOOSING_ACTION");
    });
}

class Player
{
    constructor(name)
    {
        this.name = name;
        console.log("Created Player : " + this.name);
    }
}

function CreateObjects()
{
    all_Objects = new Array();

    //  NAME SELECTION PAGE OBJECTS
    server_text_message = new TextObject("server_message", new Vector2(400,280), 800, 50,"CHOOSE A NAME", 25, "white");
    nickname_text = new TextObject("name_text", new Vector2(400,320), 400,40,"", 25, "white");
    submit_name_btn = new ButtonObject(new Vector2(300,450), 200,50,"ENTER", 25);
    submit_name_btn.SetFunction("SUBMITNAME");
    submit_name_btn.name = "submit_name_btn";

    spellDescription = new TextObject("spell_description", new Vector2(400, 200), 500, 200, "SPELL DESCRIPTION", 20, "white");
    spellDescription.SetSplitter('#');
    player_1_btn = new ButtonObject(new Vector2(50,50), 100, 200, "1", 25);
    player_2_btn = new ButtonObject(new Vector2(50,250), 100, 200, "1", 25);
    player_3_btn = new ButtonObject(new Vector2(650,50), 100, 200, "1", 25);
    player_4_btn = new ButtonObject(new Vector2(650,250), 100, 200, "1", 25);
    player_1_sprite = new ImageObject("player_1", new Vector2(50,50), wizard_1_img);
    player_2_sprite = new ImageObject("player_2", new Vector2(50,250), wizard_1_img);
    player_3_sprite = new ImageObject("player_3", new Vector2(650,50), wizard_1_img);
    player_4_sprite = new ImageObject("player_4", new Vector2(650,250), wizard_1_img);
    attack_btn = new ButtonObject(new Vector2(0,CANVAS_HEIGHT - 50), 200,50,"ATTACK", 25);
    attack_btn.SetFunction("CHOOSING_ATTACK");
    defend_btn = new ButtonObject(new Vector2(200,CANVAS_HEIGHT - 50), 200,50,"DEFEND", 25);
    defend_btn.SetFunction("CHOOSING_DEFEND");
    special_btn = new ButtonObject(new Vector2(400,CANVAS_HEIGHT - 50), 200,50,"SPECIAL", 25);
    special_btn.SetFunction("CHOOSING_SPECIAL");
    evade_btn = new ButtonObject(new Vector2(600,CANVAS_HEIGHT - 50), 200,50,"EVADE", 25);
    evade_btn.SetFunction("ACTION_evade");

    hoveredButton = attack_btn;

    for (var i = 0; i < attackSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(0,CANVAS_HEIGHT - 100 - (i * 50)), 150, 50, attackSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + attackSpells[i].name);
        attack_choice_btns.push(spellButton);
        spellButton.Enable(false);
    }
    for (var i = 0; i < defendSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(200,CANVAS_HEIGHT - 100 - (i * 50)), 150, 50, defendSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + defendSpells[i].name);
        defend_choice_btns.push(spellButton);
        spellButton.Enable(false);
    }
    for (var i = 0; i < specialSpells.length; i++)
    {
        var spellButton = new ButtonObject(new Vector2(400,CANVAS_HEIGHT - 100 - (i * 50)), 150, 50, specialSpells[i].name.toUpperCase(), 20);
        spellButton.SetFunction("ACTION_" + specialSpells[i].name);
        special_choice_btns.push(spellButton);
        spellButton.Enable(false);
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
    if(e.keyCode == 32) keyId = 26;

    keyHeldArray[keyId] = down;
    
    if(down)
    {
        if(keyPrevArray[keyId] == false)
        {
           keyDownArray[keyId] = true;
           if(keySetArray[keyId] != "enter")
            {
                if(keySetArray[keyId] != "esc")
                {
                    lastLetterKeyDown = keySetArray[keyId];
                }
            }
            console.log("KEY " + keySetArray[keyId] + " : DOWN");
            keyPrevArray[keyId] = true;
        }
    }
    else
    {
        if(keyPrevArray[keyId] == true)
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
    if(keyCode == "arrowright")keyCode = "d";
    else if(keyCode == "arrowleft")keyCode = "a";
    else if(keyCode == "arrowup")keyCode = "w";
    else if(keyCode == "arrowdown")keyCode = "s";
    if(keyCode == "a"){keyId = 0;}
    else if(keyCode == "b"){keyId = 1;}
    else if(keyCode == "c"){keyId = 2;}
    else if(keyCode == "d"){keyId = 3;}
    else if(keyCode == "e"){keyId = 4;}
    else if(keyCode == "f"){keyId = 5;}
    else if(keyCode == "g"){keyId = 6;}
    else if(keyCode == "h"){keyId = 7;}
    else if(keyCode == "i"){keyId = 8;}
    else if(keyCode == "j"){keyId = 9;}
    else if(keyCode == "k"){keyId = 10;}
    else if(keyCode == "l"){keyId = 11;}
    else if(keyCode == "m"){keyId = 12;}
    else if(keyCode == "n"){keyId = 13;}
    else if(keyCode == "o"){keyId = 14;}
    else if(keyCode == "p"){keyId = 15;}
    else if(keyCode == "q"){keyId = 16;}
    else if(keyCode == "r"){keyId = 17;}
    else if(keyCode == "s"){keyId = 18;}
    else if(keyCode == "t"){keyId = 19;}
    else if(keyCode == "u"){keyId = 20;}
    else if(keyCode == "v"){keyId = 21;}
    else if(keyCode == "w"){keyId = 22;}
    else if(keyCode == "x"){keyId = 23;}
    else if(keyCode == "y"){keyId = 24;}
    else if(keyCode == "z"){keyId = 25;}
    else if(keyCode == "enter"){keyId = 27;}
    else if(keyCode == "esc"){keyId = 28;}
    else if(keyCode == "backspace"){keyId = 29;}
    return keyId;
}
function GetKeyDown(keyCode)
{
    var keyId = GetKeyId(keyCode);
    if(keyDownArray[keyId] == undefined)
    {
        return false;
    }
    return keyDownArray[keyId];
}
function GetLastLetterKeyDown(reset)
{
    var key = lastLetterKeyDown;
    if(reset) lastLetterKeyDown = "";
    return key;
}
function AppendStringWithInput(text, max)
{
    var newText = text;
    var newLetter = GetLastLetterKeyDown(true);
    if(newLetter == "backspace")
    {
        newText = newText.slice(0,-1);
    }
    else
    {
        if(newText.length < max)
        {
            newText += newLetter;
        }
    }
    return newText;
}

//  UPDATE OBJECTS IN THE SCENE
function Update()
{
    timeSinceStart += 1.0/FPS_LIMIT;

    buttonPressedThisFrame = false;

    if(gameState == "START")
    {
        EnterGameState("CONNECTING_TO_SERVER");
    }
    else if(gameState == "CONNECTING_TO_SERVER")
    {
        dotTimer += 2.0/FPS_LIMIT;
        var txt;
        if(dotTimer <= 1.0)
        {
            txt = "- CONNECTING TO SERVER |";
        }
        else if(dotTimer <= 2.0)
        {
            txt = "\\ CONNECTING TO SERVER /";
        }
        else if(dotTimer <= 3.0)
        {
            txt = "| CONNECTING TO SERVER -";
        }
        else if(dotTimer <= 4.0)
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
    else if(gameState == "CHOOSING_NAME")
    {
        playerName = AppendStringWithInput(playerName, 10);
        nickname_text.SetText(playerName);
        if(playerName.length >= 1) submit_name_btn.Enable(true);
        else submit_name_btn.Enable(false);
        submit_name_btn.Hover(true);

        if(timeSinceStart >= connectionTime + 20.0)
        {
            //  KICK FOR INACTIVITY
        }       
    }
    else if(gameState == "WAITING_FOR_PLAYERS")
    {
        dotTimer += 2.0/FPS_LIMIT;
        var txt;
        if(dotTimer <= 1.0)
        {
            txt = "- WAITING FOR PLAYERS (" + connectedPlayers + "/4) |";
        }
        else if(dotTimer <= 2.0)
        {
            txt = "\\ WAITING FOR PLAYERS (" + connectedPlayers + "/4) /";
        }
        else if(dotTimer <= 3.0)
        {
            txt = "| WAITING FOR PLAYERS (" + connectedPlayers + "/4) -";
        }
        else if(dotTimer <= 4.0)
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
    else if(gameState == "CHOOSING_ACTION")
    {
        //console.log(submit_name_btn.enabled + " , " + submit_name_btn.draw + " , " + submit_name_btn.clear)
        if((hoveredButton != attack_btn) && (hoveredButton != defend_btn) && (hoveredButton != special_btn) && (hoveredButton != evade_btn))
        {
            attack_btn.Hover(true);
        }

        if(GetKeyDown("arrowright"))
        {
            if(hoveredButton == attack_btn) hoveredButton = defend_btn;
            else if(hoveredButton == defend_btn) hoveredButton = special_btn;
            else if(hoveredButton == special_btn) hoveredButton = evade_btn;
            else if(hoveredButton == evade_btn) hoveredButton = attack_btn;
        }
        else if(GetKeyDown("arrowleft"))
        {
            if(hoveredButton == attack_btn) hoveredButton = evade_btn;
            else if(hoveredButton == defend_btn) hoveredButton = attack_btn;
            else if(hoveredButton == special_btn) hoveredButton = defend_btn;
            else if(hoveredButton == evade_btn) hoveredButton = special_btn;
        }

        attack_btn.Hover(hoveredButton == attack_btn);
        defend_btn.Hover(hoveredButton == defend_btn);
        special_btn.Hover(hoveredButton == special_btn);
        evade_btn.Hover(hoveredButton == evade_btn);
    }
    else if(gameState == "CHOOSING_ATTACK")
    {
        var b = 0;
        for(var i = 0; i < attack_choice_btns.length; i++)
        {
            if(attack_choice_btns[i] == hoveredButton) b = i;
        }

        spellDescription.SetText(GetSpell(attack_choice_btns[b].text).desc);

        if(GetKeyDown("arrowup"))
        {
            b++;
            if(b >= attack_choice_btns.length) b = 0;
            attack_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowdown"))
        {
            b--;
            if(b < 0) b = attack_choice_btns.length - 1;
            attack_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowright"))
        {
            defend_btn.Hover(true);
            defend_btn.Press();
        }
        else if(GetKeyDown("arrowleft"))
        {
            evade_btn.Hover(true);
            evade_btn.Press();
        }
    }
    else if(gameState == "CHOOSING_DEFEND")
    {
        var b = 0;
        for(var i = 0; i < defend_choice_btns.length; i++)
        {
            if(defend_choice_btns[i] == hoveredButton) b = i;
        }

        spellDescription.SetText(GetSpell(defend_choice_btns[b].text).desc);

        if(GetKeyDown("arrowup"))
        {
            b++;
            if(b >= defend_choice_btns.length) b = 0;
            defend_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowdown"))
        {
            b--;
            if(b < 0) b = defend_choice_btns.length - 1;
            defend_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowright"))
        {
            special_btn.Press();
        }
        else if(GetKeyDown("arrowleft"))
        {
            attack_btn.Press();
        }
    }
    else if(gameState == "CHOOSING_SPECIAL")
    {
        var b = 0;
        for(var i = 0; i < special_choice_btns.length; i++)
        {
            if(special_choice_btns[i] == hoveredButton) b = i;
        }

        spellDescription.SetText(GetSpell(special_choice_btns[b].text).desc);

        if(GetKeyDown("arrowup"))
        {
            b++;
            if(b >= special_choice_btns.length) b = 0;
            special_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowdown"))
        {
            b--;
            if(b < 0) b = special_choice_btns.length - 1;
            special_choice_btns[b].Hover(true);
        }
        else if(GetKeyDown("arrowright"))
        {
            evade_btn.Press();
        }
        else if(GetKeyDown("arrowleft"))
        {
            defend_btn.Press();
        }
    }
    
    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].Update();
    }
    Render();
    FixInput();
}

function EnterGameState(state, force)
{
    if(state == gameState && force !== true)
    {
        console.log("GAMESTATE IS ALREADY '" + state + "'");
        return;
    }
    var isState = true;

    if(state == "CONNECTING_TO_SERVER")
    {
        DisableActiveObjects();
        server_text_message.Enable(true);
        SetUpNetworking();
    }
    else if(state == "CHOOSING_NAME")
    {
        DisableActiveObjects();
        server_text_message.text = "CHOOSE A NAME";
        server_text_message.Enable(true);
        nickname_text.Enable(true);
    }
    else if(state == "JOINING_QUEUE")
    {
        DisableActiveObjects();
        ClearAll();
        server_text_message.text = "SERVER FULL (" + (connectedPlayers) + " IN QUEUE)";
        server_text_message.Enable(true);
    }
    else if(state == "WAITING_FOR_PLAYERS")
    {
        DisableActiveObjects();
        ClearAll();
        server_text_message.text = "WAITING FOR PLAYERS (" + connectedPlayers + "/4)";
        server_text_message.Enable(true);
    }
    else if(state == "CONNECTION_REFUSED")
    {
        EnableAllObjects(false);
        ClearAll();
        server_text_message.text = "CONNECTION REFUSED";
        server_text_message.Enable(true); 
    }
    else if(state == "CHOOSING_ACTION")
    {
        DisableActiveObjects();
        ClearAll();
        EnablePlayerSprites(true);
        attack_btn.Enable(true);
        defend_btn.Enable(true);
        special_btn.Enable(true);
        evade_btn.Enable(true);
        attack_btn.Hover(true);
    }
    else if(state == "CHOOSING_ATTACK")
    {
        EnableAttackOptionObjects(true);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(false);
        EnablePlayerSprites(true);
        attack_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if(state == "CHOOSING_DEFEND")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(true);
        EnableSpecialOptionObjects(false);
        EnablePlayerSprites(true);
        defend_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if(state == "CHOOSING_SPECIAL")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(true);
        EnablePlayerSprites(true);
        special_choice_btns[0].Hover(true);
        spellDescription.Enable(true);
    }
    else if(state == "CHOOSING_TARGET")
    {
        EnableAttackOptionObjects(false);
        EnableDefendOptionObjects(false);
        EnableSpecialOptionObjects(false);
        EnablePlayerSprites(true);
    }
    else
    {
        isState = false;
    }

    if(isState)
    {
        gameState = state;
        console.log(("ENTERED GAME STATE : ") + gameState);
    }
    else
    {
        console.log("'" + state + "' IS NOT A STATE");
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
    player_1_btn.Enable(true);
    player_2_btn.Enable(true);
    player_3_btn.Enable(true);
    player_4_btn.Enable(true);
    player_1_sprite.Enable(enable);
    player_2_sprite.Enable(enable);
    player_3_sprite.Enable(enable);
    player_4_sprite.Enable(enable);
}

//  RENDER THE SCENE
function Render()
{ 
    renderer.Proccess();
    renderer.Flush();
}

//  RESET INPUTS TO FALSE
function FixInput() {keyDownArray = Array(30).fill(false);}

//  A SIMPLE CLASS FOR STORING POSITIONS
class Vector2
{
    constructor(x,y)
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
        all_Objects.push(this);
    }

    Enable(enable)
    {
        this.enabled = enable;
        this.clear = true;
        this.draw = enable;

        if(this.enabled == enable) return;
        if(enable == true)
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
        if(this.enabled)
        {

        }
    }

    SetPosition(x, y)
    {
        this.pos.x = x;
        this.pos.y = y;
        this.clear = true;
        if(this.enabled) this.draw = true;
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
    }
    SetScale(width, height)
    {
        this.width = width;
        this.height = height;
        this.customScale = true;
    }
    Enable(enable)
    {
        if(this.enabled == enable) return;
        super.Enable(enable);
        this.draw = enable;
    }

    Update()
    {
        if(this.enabled)
        {
            super.Update();
        }
    }

    Render()
    {
        if(this.draw)
        {
            if(this.customScale)
            {
                context.clearRect(this.pos.x,this.pos.y,this.pos.x+this.width,this.pos.y-this.height);
            }
            
            if(this.enabled)
            {
                if(this.customScale)
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
        rendererButtons.push(this);
        this.draw = true;
    }

    Enable(enable)
    {
        if(enable == true)
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
        if(this.enabled)
        {
            super.Update();

            if(this.hovered)
            {
                if(GetKeyDown("enter") && buttonPressedThisFrame == false)
                {
                    this.Press();
                }
            }
        }
    }

    Hover(hover)
    {
        if(hover)
        {
            if(hoveredButton != this)
            {
                hoveredButton.Hover(false);
            }
            hoveredButton = this;
        }
        if(hover != this.hovered)
        {
            if(this.enabled)
            {
                this.draw = true;
                this.clear = true;
            }
            else
            {
                this.draw = false;
                this.clear = true;
            }
        }
        this.hovered = hover;
    }

    Press()
    {
        buttonPressedThisFrame = true;
        CallButtonFunction(this.functionString);
    }

    SetFunction(functionString)
    {
        this.functionString = functionString;
        console.log("Set Button " + this.name + " Function : " + this.functionString);
    }

    Render()
    {
        if(this.clear)
        {
            context.clearRect(this.pos.x - 4, this.pos.y - 4, this.width + 8, this.height + 8);
            if(debugGraphics == true)
            {
                context.fillStyle = "green";
                context.fillRect(this.pos.x - 4, this.pos.y - 4, this.width + 8, this.height + 8);
                info += "</br>" + this.name;
            }
            this.clear = false;
        }
        if(this.draw == true)
            {
                renderer.SubmitStroke(new RendererStroke(new Vector2(this.pos.x,this.pos.y),this.width,this.height,4,"white"));
                if(this.hovered)
                {
                    renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width/2, this.pos.y + (this.height/2), "center", "yellow", this.fontSize));
                }
                else
                {
                    renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width/2, this.pos.y + (this.height/2), "center", "white", this.fontSize));
                }

                this.draw = false;
            }
    }
}

function CallButtonFunction(functionString)
{
    console.log("Trying to call function '" + functionString + "'");
    if(functionString == "SUBMITNAME")
    {
        socket.emit('name is', playerName);
    }
    else if(functionString == "CHOOSING_ATTACK")
    {
        EnterGameState("CHOOSING_ATTACK");
    }
    else if(functionString == "CHOOSING_DEFEND")
    {
        EnterGameState("CHOOSING_DEFEND");
    }
    else if(functionString == "CHOOSING_SPECIAL")
    {
        EnterGameState("CHOOSING_SPECIAL");
    }
    else if(functionString == "CHOOSING_EVADE")
    {

    }
    else if(functionString.includes("ACTION_"))
    {
        var act = functionString.split('_')[1];
        console.log(act);
        SubmitSpell(act);
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
        this.colour = colour;
        this.clear = true;
        this.draw = true;
        rendererTexts.push(this);
    }

    Enable(enable)
    {
        super.Enable(enable);
        if(enable == false)
        {
            this.clear = true;
        }
    }

    SetText(text)
    {
        if(text != this.text)
        {
            this.text = text;
            this.clear = true;
            this.draw = true;
        }
    }

    SetSplitter(splitter)
    {
        if(splitter != undefined)
        {
            this.lineSplitter = splitter;
            this.multiline = true;
        }
        else
        {
            this.multiline = false;
        }
    }

    Update()
    {
        if(this.enabled)
        {
            super.Update();
        }
    }

    Render()
    {
        if(this.clear)
        {
            context.clearRect(this.pos.x - (this.width / 2), this.pos.y  - (this.height / 2), this.width, this.height);
            this.clear = false;
        }
        if(this.draw)
        {
            if(this.enabled && this.text != "")
            {
                if(this.multiline)
                {
                    var textArray = new Array();
                    textArray = this.text.split(this.lineSplitter);
                    var lineCount = textArray.length;
                    for(var l = 0; l < lineCount; l++)
                    {
                        var line = textArray[l].toString();
                        renderer.SubmitText(new RendererText(line, this.pos.x, this.pos.y + ((1.5 * this.fontSize) * (l - lineCount/2.0)), "center", this.colour, this.fontSize));
                    }
                }
                else
                {
                    renderer.SubmitText(new RendererText(this.text, this.pos.x, this.pos.y, "center", this.colour, this.fontSize));
                }
            }

            this.draw = false;
        }
    }
}

function LoadSpells()
{
    loadedSpells = JSON.parse(JSON.stringify(spellJson));

    for (var i = 0; i < loadedSpells.length; i++) {

        var newSpell = loadedSpells[i];

        if (newSpell.type == "attack")
        {
            attackSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc));
        }
        else if (newSpell.type == "defend")
        {
            defendSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc));
        }
        else if (newSpell.type == "evade")
        {
            evadeSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc));
        }
        else
        {
            specialSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect, newSpell.desc));
        }

        console.log(newSpell);
    }
}

class Spell
{
    constructor(name, type, cost, effect, desc)
    {
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.effect = effect;
        this.desc = desc;
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

function SubmitSpell(spell)
{
    socket.emit('action', new Action(1, GetSpell(spell).name));
}

function GetSpell(spellName)
{
    spellName = spellName.toString().toLowerCase();
    for(var i = 0; i < attackSpells.length; i++)
    {
        if(attackSpells[i].name == spellName) return attackSpells[i];
    }
    for(var i = 0; i < defendSpells.length; i++)
    {
        if(defendSpells[i].name == spellName) return defendSpells[i];
    }
    for(var i = 0; i < specialSpells.length; i++)
    {
        if(specialSpells[i].name == spellName) return specialSpells[i];
    }
    for(var i = 0; i < evadeSpells.length; i++)
    {
        if(evadeSpells[i].name == spellName) return evadeSpells[i];
    }
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
        //context.clearRect(0, 0, 800, 600);
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
        if(this.batchedStrokes.length >= 1)
        {
            context.beginPath();
            for (var i = 0; i < this.batchedStrokes.length; i++)
            {
                context.rect(this.batchedStrokes[i].pos.x,this.batchedStrokes[i].pos.y,this.batchedStrokes[i].width,this.batchedStrokes[i].height);
                context.strokeStyle = this.batchedStrokes[i].strokeColour;
                context.lineWidth = this.batchedStrokes[i].strokeWidth;
            }
            context.stroke();
            context.closePath();
            this.batchedStrokes = [];
        }

        //  RENDER TEXTS
        if(this.batchedTexts.length >= 1)
        {
            context.textBaseline = "middle";
            context.textAlign = this.batchedTexts[0].align;
            for (var i = 0; i < this.batchedTexts.length; i++)
            {
                context.font = (this.batchedTexts[i].size + "px PressStart2P");
                context.fillStyle = this.batchedTexts[i].colour;
                context.fillText(this.batchedTexts[i].text, this.batchedTexts[i].x, this.batchedTexts[i].y);
            }
            this.batchedTexts = [];
        }


        if(debugGraphics == true)
        {
            document.getElementById("info").innerHTML = info;
            info = "Clearing :";
        }
    }
}

var info = "Clearing :";