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
var rightDown = false;
var rightHeld = false;
var rightPrev = false;
var leftDown = false;
var leftHeld = false;
var leftPrev = false;
var upDown = false;
var upHeld = false;
var upPrev = false;
var downDown = false;
var downHeld = false;
var downPrev = false;
var submitDown = false;
var submitHeld = false;
var submitPrev = false;


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
    choose_nickname_text = new TextObject(new Vector2(400,300), 0,0,"CHOOSE A NAME", 25, "white");

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
    //  RIGHT KEY
    if(e.keyCode == 39 || e.keyCode == 68)
    {
        rightHeld = true;
        if(rightPrev == false)
        {
            rightDown = true;
        }
        rightPrev = true;
    }
    //  LEFT KEY
    if(e.keyCode == 65 || e.keyCode == 37)
    {
        leftHeld = true;
        if(leftPrev == false)
        {
            leftDown = true;
        }
        leftPrev = true;
    }
    //  UP KEY
    if(e.keyCode == 38 || e.keyCode == 87)
    {
        upHeld = true;
        if(upPrev == false)
        {
            upDown = true;
        }
        upPrev = true;
    }
    //  DOWN KEY
    if(e.keyCode == 40 || e.keyCode == 83)
    {
        downHeld = true;
        if(downPrev == false)
        {
            downDown = true;
        }
        downPrev = true;
    }
    //  SUBMIT KEY
    if(e.keyCode == 32 || e.keyCode == 13)
    {
        submitHeld = true;
        if(submitPrev == false)
        {
            submitDown = true;
        }
        submitPrev = true;
    }
}
//  HANDLE KEY-UP EVENTS
function KeyUp(e)
{
    //  RIGHT KEY
    if(e.keyCode == 39 || e.keyCode == 68)
    {
        rightHeld = false;
        if(rightPrev == true)
        {
            rightDown = false;
        }
        rightPrev = false;
    }
    //  LEFT KEY
    if(e.keyCode == 37 || e.keyCode == 65)
    {
        leftHeld = false;
        if(leftPrev == true)
        {
            leftDown = false;
        }
        leftPrev = false;
    }
    //  UP KEY
    if(e.keyCode == 38 || e.keyCode == 87)
    {
        uptHeld = false;
        if(upPrev == true)
        {
            upDown = false;
        }
        upPrev = false;
    }
    //  DOWN KEY
    if(e.keyCode == 40 || e.keyCode == 83)
    {
        downHeld = false;
        if(downPrev == true)
        {
            downDown = false;
        }
        downPrev = false;
    }
    //  SUBMIT KEY
    if(e.keyCode == 32 || e.keyCode == 13)
    {
        submitHeld = false;
        if(submitPrev == true)
        {
            submitDown = false;
        }
        submitPrev = false;
    }
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
        //EnterGameState("CHOOSING_ACTION");
    }
    else if(gameState == "CHOOSING_ACTION")
    {
        if((hoveredButton != attack_btn) && (hoveredButton != defend_btn) && (hoveredButton != special_btn) && (hoveredButton != evade_btn))
        {
            console.log(hoveredButton);
            attack_btn.Hover(true);
        }

        if(rightDown)
        {
            if(hoveredButton == attack_btn) hoveredButton = defend_btn;
            else if(hoveredButton == defend_btn) hoveredButton = special_btn;
            else if(hoveredButton == special_btn) hoveredButton = evade_btn;
            else if(hoveredButton == evade_btn) hoveredButton = attack_btn;
        }
        else if(leftDown)
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

    }
    else if(state == "CHOOSING_ACTION")
    {
        EnableAllObjects(false);
        attack_btn.Enable(true);
        defend_btn.Enable(true);
        specia.Enable(true);
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
        this.draw = enable;
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

    Render()
    {
        if(this.draw)
        {
            context.clearRect(this.pos.x,this.pos.y,this.width,this.height);

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