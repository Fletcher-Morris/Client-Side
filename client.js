var canvas;
var context;

window.addEventListener("load", function()
{
    canvas = document.getElementById('MainCanvas');
    context = canvas.getContext("2d");

}, false);


var renderQueue = [];

function Render()
{
    context.clearRect(0,0,800,600);
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
    constructor(name, position)
    {
        this.name = name;
        this.position = position;
        this.renderable = false;
    }
}