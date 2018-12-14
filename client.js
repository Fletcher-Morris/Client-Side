var canvas;
var context;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const FPS_LIMIT = 30;

var img = new Image();
img.src = 'images/test_img.png';
var testImage


//  LOADED SPELLS
var attackSpells = [];
var defendSpells = [];
var specialSpells = [];
var evadeSpells = [];

//  IMAGES
var wizard_1_img = new Image();
wizard_1_img.src = 'images/wizard_1_img.png';
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
var choose_nickname_text;
var nickname_text;
var submit_name_btn;
var attack_btn;
var attack_icon;
var defend_btn;
var special_btn;
var evade_btn;
var player_1_sprite;
var player_2_sprite;
var player_3_sprite;
var player_4_sprite;

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


//  GAME STUFF
var gameState = "START";
var hoveredButton = attack_btn;
var playerName = "";


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

function CreateObjects()
{
    all_Objects = new Array();

    //  CONNECTION PAGE OBJECTS
    choose_nickname_text = new TextObject(new Vector2(400,280), 0,0,"CHOOSE A NAME", 25, "white");
    nickname_text = new TextObject(new Vector2(0,320), 800,40,"", 25, "white");
    submit_name_btn = new ButtonObject(new Vector2(300,450), 200,50,"ENTER", 25);
    submit_name_btn.SetFunction("SUBMITNAME");

    player_1_sprite = new ImageObject("player_1", new Vector2(50,50), wizard_1_img);
    player_2_sprite = new ImageObject("player_2", new Vector2(50,250), wizard_2_img);
    player_3_sprite = new ImageObject("player_3", new Vector2(650,50), wizard_3_img);
    player_4_sprite = new ImageObject("player_4", new Vector2(650,250), wizard_4_img);
    attack_btn = new ButtonObject(new Vector2(0,CANVAS_HEIGHT - 50), 200,50,"ATTACK", 25);
    defend_btn = new ButtonObject(new Vector2(200,CANVAS_HEIGHT - 50), 200,50,"DEFEND", 25);
    special_btn = new ButtonObject(new Vector2(400,CANVAS_HEIGHT - 50), 200,50,"SPECIAL", 25);
    evade_btn = new ButtonObject(new Vector2(600,CANVAS_HEIGHT - 50), 200,50,"EVADE", 25);
    hoveredButton = attack_btn;

    /*
    for (var i = 0; i < attackSpells.length; i++) {
        var spellButton = new Button(new Vector2(200, i*50), 150, 50, attackSpells[i].name.toUpperCase(), 20);
    }
    for (var i = 0; i < defendSpells.length; i++) {
        var spellButton = new Button(new Vector2(350, i*50), 150, 50, defendSpells[i].name.toUpperCase(), 20);
    }
    for (var i = 0; i < specialSpells.length; i++) {
        var spellButton = new Button(new Vector2(500, i*50), 150, 50, specialSpells[i].name.toUpperCase(), 20);
    }
    for (var i = 0; i < evadeSpells.length; i++) {
        var spellButton = new Button(new Vector2(650, i*50), 150, 50, evadeSpells[i].name.toUpperCase(), 20);
    }
    */
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
           keyDownArray[keyId] = false;
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
        else
        {
            //console.log(keyPrevArray[keyId]);
        }
    }
    else
    {
        if(keyPrevArray[keyId] == true)
        {
            keyDownArray[keyId] = false;
            keyDownArray[keyId] = true;
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
    console.log(keyDownArray[keyId]);
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
    if(gameState == "START")
    {
        EnterGameState("CHOOSING_NAME");
    }
    else if(gameState == "CHOOSING_NAME")
    {
        playerName = AppendStringWithInput(playerName, 10);
        nickname_text.SetText(playerName);
        if(playerName.length >= 1) submit_name_btn.Enable(true);
        else submit_name_btn.Enable(false);
        submit_name_btn.Hover(true);        
    }
    else if(gameState == "CHOOSING_ACTION")
    {
        if((hoveredButton != attack_btn) && (hoveredButton != defend_btn) && (hoveredButton != special_btn) && (hoveredButton != evade_btn))
        {
            console.log(hoveredButton);
            attack_btn.Hover(true);
        }

        if(GetKeyDown("d"))
        {
            if(hoveredButton == attack_btn) hoveredButton = defend_btn;
            else if(hoveredButton == defend_btn) hoveredButton = special_btn;
            else if(hoveredButton == special_btn) hoveredButton = evade_btn;
            else if(hoveredButton == evade_btn) hoveredButton = attack_btn;
        }
        else if(GetKeyDown("a"))
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
    
    for (var i = 0; i < all_Objects.length; i++)
    {
        all_Objects[i].Update();
    }
    Render();
    FixInput();
}

function EnterGameState(state)
{
    if(state == gameState) return;

    if(state == "CHOOSING_NAME")
    {
        EnableAllObjects(false);
        choose_nickname_text.Enable(true);
        nickname_text.Enable(true);
    }
    else if(state == "CHOOSING_ACTION")
    {
        EnableAllObjects(false);
        attack_btn.Enable(true);
        defend_btn.Enable(true);
        special_btn.Enable(true);
        evade_btn.Enable(true);
    }

    gameState = state;
    console.log(("ENTERED GAME STATE : ") + gameState);
}

function EnableAllObjects(enable)
{
    for (var i = 0; i < all_Objects.length; i++) {
        all_Objects[i].Enable(enable);
    }
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
    rightDown = false;
    leftDown = false;
    upDown = false;
    downDown = false;
    submitDown = false;
}

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
    }

    Update()
    {
        if(this.enabled)
        {

        }
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
        this.SetScale(100,150);
    }
    SetScale(width, height)
    {
        this.width = width;
        this.height = height;
        this.customScale = true;
    }
    Enable(enable)
    {
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
        super.Enable(enable);
        this.draw = true;
        if(enable)
        {
            if(hoveredButton.enabled == false)
            {
                this.Hover();
            }
        }
    }

    Update()
    {
        if(this.enabled)
        {
            super.Update();

            if(this.hovered)
            {
                if(GetKeyDown("enter"))
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
            this.draw = true;
        }
        this.hovered = hover;
    }

    Press()
    {
        CallButtonFunction(this.functionString);
    }

    SetFunction(functionString)
    {
        this.functionString = functionString;
        console.log("Set Button " + this.name + " Function : " + this.functionString);
    }

    Render()
    {
        if(this.draw)
        {
            context.clearRect(this.pos.x - 2, this.pos.y - 2,this.width + 4,this.height + 4);

            if(this.enabled)
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
            }

            this.draw = false;
        }
    }
}

function CallButtonFunction(functionString)
{
    console.log(this.functionString);
    if(functionString == "SUBMITNAME")
    {
        EnterGameState("CHOOSING_ACTION");
    }
}

class TextObject extends Object
{
    constructor(pos, width, height, text, fontSize, colour)
    {
        super(text, pos);
        this.width = width;
        this.height = height;
        this.text = text;
        this.fontSize = fontSize;
        this.colour = colour;
        this.draw = true;
        rendererTexts.push(this);
    }

    Enable(enable)
    {
        super.Enable(enable);
        this.draw = true;
    }

    SetText(text)
    {
        if(text != this.text)
        {
            this.text = text;
            this.draw = true;
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
        if(this.draw)
        {
            context.clearRect(this.pos.x,this.pos.y,this.width,this.height);
            if(this.enabled)
            {
                renderer.SubmitText(new RendererText(this.text, this.pos.x + this.width/2, this.pos.y + (this.height/2), "center", this.colour, this.fontSize));
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
            attackSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect));
        }
        else if (newSpell.type == "defend")
        {
            defendSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect));
        }
        else if (newSpell.type == "evade")
        {
            evadeSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect));
        }
        else
        {
            specialSpells.push(new Spell(newSpell.name, newSpell.type, newSpell.cost, newSpell.effect));
        }

        //console.log(newSpell);
    }
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
        for (var i = 0; i < rendererButtons.length; i++)
        {
            rendererButtons[i].Render();
        }

        for (var i = 0; i < rendererTexts.length; i++)
        {
            rendererTexts[i].Render();
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
            for (var i = 0; i < this.batchedStrokes.length; i++)
            {
                context.rect(this.batchedStrokes[i].pos.x,this.batchedStrokes[i].pos.y,this.batchedStrokes[i].width,this.batchedStrokes[i].height);
                context.strokeStyle = this.batchedStrokes[i].strokeColour;
                context.lineWidth = this.batchedStrokes[i].strokeWidth;
            }
            context.stroke();
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
    }
}