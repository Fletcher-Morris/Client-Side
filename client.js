var canvas;
var context;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
var SET_UP = false;
const FPS_LIMIT = 30;

var img = new Image();
img.src = 'images/test_img.png';
var testImage


//  LOADED SPELLS
var attackSpells = [];
var defendSpells = [];
var specialSpells = [];
var evadeSpells = [];


//  UI OBJECTS
var attack_btn;
var attack_icon;
var defend_btn;
var special_btn;
var evade_btn;


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


//  GAME STUFF
var gameState = "CHOOSING_ACTION";
var hoveredButton = attack_btn;


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

    SET_UP = true;

    {
        setInterval(Update, 1000/FPS_LIMIT);
    }

}, false);

function CreateObjects()
{
    testImage = new Renderable("ralsei", new Vector2(50,50), img);

    attack_btn = new Button(new Vector2(0,CANVAS_HEIGHT - 50), 200,50,"ATTACK", 25);
    defend_btn = new Button(new Vector2(200,CANVAS_HEIGHT - 50), 200,50,"DEFEND", 25);
    special_btn = new Button(new Vector2(400,CANVAS_HEIGHT - 50), 200,50,"SPECIAL", 25);
    evade_btn = new Button(new Vector2(600,CANVAS_HEIGHT - 50), 200,50,"EVADE", 25);

    hoveredButton = attack_btn;
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
            console.log("Right Pressed");
        }
        rightPrev = true;
    }

    //  LEFT KEY
    if(e.keyCode == 37 || e.keyCode == 65)
    {
        leftHeld = true;
        if(leftPrev == false)
        {
            leftDown = true;
            console.log("Left Pressed");
        }
        leftPrev = true;
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
            console.log("Right Released");
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
            console.log("Left Released");
        }
        leftPrev = false;
    }
}

function Update()
{
    if(gameState == "CHOOSING_ACTION")
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

        attack_btn.Hover(hoveredButton == attack_btn);
        defend_btn.Hover(hoveredButton == defend_btn);
        special_btn.Hover(hoveredButton == special_btn);
        evade_btn.Hover(hoveredButton == evade_btn);
    }

    testImage.Update();

    attack_btn.Update();
    defend_btn.Update();
    special_btn.Update();
    evade_btn.Update();


    for (var i = 0; i < attackSpells.length; i++) {
        var spellButton = new Button(new Vector2(200, i*50), 150, 50, attackSpells[i].name.toUpperCase(), 20);
        spellButton.Update();
    }
    for (var i = 0; i < defendSpells.length; i++) {
        var spellButton = new Button(new Vector2(350, i*50), 150, 50, defendSpells[i].name.toUpperCase(), 20);
        spellButton.Update();
    }
    for (var i = 0; i < specialSpells.length; i++) {
        var spellButton = new Button(new Vector2(500, i*50), 150, 50, specialSpells[i].name.toUpperCase(), 20);
        spellButton.Update();
    }
    for (var i = 0; i < evadeSpells.length; i++) {
        var spellButton = new Button(new Vector2(650, i*50), 150, 50, evadeSpells[i].name.toUpperCase(), 20);
        spellButton.Update();
    }





    Render();
}
function Render()
{
    context.clearRect(0,0,800,600);

    renderer.Proccess();
    renderer.Flush();
}

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
    }

    Update()
    {

    }
}

class Renderable extends Object
{
    constructor(name, pos, image)
    {
        super(name, pos);
        this.image = image;
    }
    SetScale(width, height)
    {
        this.width = width;
        this.height = height;
        this.customScale = true;
    }

    Update()
    {
        super.Update();

        this.Render();
    }

    Render()
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
}

class Button extends Object
{
    constructor(pos, width, height, text, fontSize)
    {
        super((text) + ("_button"), pos);
        this.width = width;
        this.height = height;
        this.text = text;
        this.fontSize = fontSize;
        rendererButtons.push(this);
    }

    Update()
    {
        super.Update();
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
        this.hovered = hover;
    }

    Render()
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
    }

    Flush()
    {
        //  RENDER STROKES
        for (var i = 0; i < this.batchedStrokes.length; i++)
        {
            context.rect(this.batchedStrokes[i].pos.x,this.batchedStrokes[i].pos.y,this.batchedStrokes[i].width,this.batchedStrokes[i].height);
            context.strokeStyle = this.batchedStrokes[i].strokeColour;
            context.lineWidth = this.batchedStrokes[i].lineWidth;
        }
        context.stroke();
        this.batchedStrokes = [];

        //  RENDER TEXTS
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