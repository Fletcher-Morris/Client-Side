var canvas;
var context;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

var img = new Image();
img.src = 'images/test_img.png';
var testImage


//  UI OBJECTS
var attack_btn;
var defend_btn;
var special_btn;
var evade_btn;

window.addEventListener("load", function()
{
    canvas = document.getElementById('MainCanvas');
    context = canvas.getContext('2d');

    CreateObjects();

    Update();

}, false);

function CreateObjects()
{
    testImage = new Renderable("ralsei", new Vector2(50,50), img);
    attack_btn = new Button(attack_btn, new Vector2(0,CANVAS_HEIGHT - 50), 200,50,"ATTACK", 40);
    defend_btn = new Button(attack_btn, new Vector2(200,CANVAS_HEIGHT - 50), 200,50,"DEFEND", 40);
    special_btn = new Button(attack_btn, new Vector2(400,CANVAS_HEIGHT - 50), 200,50,"SPECIAL", 40);
    evade_btn = new Button(attack_btn, new Vector2(600,CANVAS_HEIGHT - 50), 200,50,"EVADE", 40);
}

function Update()
{
    context.clearRect(0,0,800,600);
    testImage.Update();

    attack_btn.Update();
    defend_btn.Update();
    special_btn.Update();
    evade_btn.Update();
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
    constructor(name, pos, width, height, text, fontSize)
    {
        super(name, pos);
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
        context.font = (this.fontSize + "px Arial");
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "white";
        context.fillText(this.text, this.pos.x + this.width/2, this.pos.y + (this.height/2));
    }
}