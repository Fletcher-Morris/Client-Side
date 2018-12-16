//	NETWORKING STUFF

const http = require("http");
const address = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) =>
{
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");
	res.end("Hello World\n");
});

server.listen(port, address, () =>
{
	console.log("Server running at http://" + address + ":" + port + "\n");
});

function SendMessageToPlayer(player, message)
{

}
function SendMessageToAll(message)
{
	for(int i = 0; i < connectedPlayers.length; i++)
	{
		SendMessageToPlayer(connectedPlayers[i], message);
	}
}



//	GAME DATA STUFF
var connectedPlayers = [];



class Player
{
	constructor(address, name, wizard)
	{
		this.address = address;
		this.name = name;
		this.wizard = wizard;
	}
}