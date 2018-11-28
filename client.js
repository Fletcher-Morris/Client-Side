var canvas;
var context;

var img = new Image();
img.src = 'images/test_img.png';
var testImage

window.addEventListener("load", function()
{
    canvas = document.getElementById('MainCanvas');
    context = canvas.getContext('2d');
    
    
    testImage = new Renderable("ralsei", new Vector2(50,50), img);

    Update();

}, false);

function Update()
{
    context.clearRect(0,0,800,600);
    context.font = "30px Arial";
    context.fillText("Hello World", 10, 50);
    testImage.Update();
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
        console.log("Rendered Ralsei");
    }
}