var canvas;
var context;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

var img = new Image();
img.src = 'images/test_img.png';
var testImage

var attackSpells = [];
var defendSpells = [];
var specialSpells = [];
var evadeSpells = [];


//  UI OBJECTS
var attack_btn;
var defend_btn;
var special_btn;
var evade_btn;

window.addEventListener("load", function()
{
    canvas = document.getElementById('MainCanvas');
    context = canvas.getContext('2d');

    LoadSpells();
    CreateObjects();

    Update();

}, false);

function CreateObjects()
{
    testImage = new Renderable("ralsei", new Vector2(50,50), img);
    attack_btn = new Button(new Vector2(0,CANVAS_HEIGHT - 50), 200,50,"ATTACK", 25);
    defend_btn = new Button(new Vector2(200,CANVAS_HEIGHT - 50), 200,50,"DEFEND", 25);
    special_btn = new Button(new Vector2(400,CANVAS_HEIGHT - 50), 200,50,"SPECIAL", 25);
    evade_btn = new Button(new Vector2(600,CANVAS_HEIGHT - 50), 200,50,"EVADE", 25);
}

function Update()
{
    context.clearRect(0,0,800,600);
    testImage.Update();

    attack_btn.Update();
    defend_btn.Update();
    special_btn.Update();
    evade_btn.Update();


    for (var i = 0; i < attackSpells.length; i++) {
        var spellButton = new Button(new Vector2(200, i*50), 150, 50, attackSpells[i].name, 20);
        spellButton.Update();
    }
    for (var i = 0; i < defendSpells.length; i++) {
        var spellButton = new Button(new Vector2(350, i*50), 150, 50, defendSpells[i].name, 20);
        spellButton.Update();
    }
    for (var i = 0; i < specialSpells.length; i++) {
        var spellButton = new Button(new Vector2(500, i*50), 150, 50, specialSpells[i].name, 20);
        spellButton.Update();
    }
    for (var i = 0; i < evadeSpells.length; i++) {
        var spellButton = new Button(new Vector2(650, i*50), 150, 50, evadeSpells[i].name, 20);
        spellButton.Update();
    }
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

    Update()
    {
        super.Update();

        this.Render();
    }

    Render()
    {
        context.drawImage(this.image, this.pos.x, this.pos.y);
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
    }

    Update()
    {
        super.Update();
        this.Render();
    }

    Render()
    {
        context.rect(this.pos.x,this.pos.y,this.width,this.height);
        context.strokeStyle = "white";
        context.lineWidth = 4;
        context.stroke();
        context.font = (this.fontSize + "px PressStart2P");
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(this.text, this.pos.x + this.width/2, this.pos.y + (this.height/2));
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

        console.log(newSpell);
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