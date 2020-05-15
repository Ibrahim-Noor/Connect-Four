const fs = require('fs')
const http = require ('http')
const WebSocket = require('ws')
const fetch = require('node-fetch')

const readFile = f => new Promise((res, rej) => fs.readFile(f, 'utf8', (e, data) => e?rej(e):res(data)))

var sockets=[]
var players=0;

const game = (one, two) =>
{
 	one.send(JSON.stringify({type:"playerid", id: 1, turn: "Your Turn"}))
 	two.send(JSON.stringify({type:"playerid", id: 2, turn: "Opponent's Turn"}))
 	one.on('message', msg => 
 	{
 		console.log("received this: ", (JSON.parse(msg))," from player 1");
		if((JSON.parse(msg)).type=="myindex")
		{
			two.send(JSON.stringify({type:"other's index", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
		else if ((JSON.parse(msg)).type=="winner")
		{
			two.send(JSON.stringify({type:"otherwin", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
		else if ((JSON.parse(msg)).type=="Draw")
		{
			two.send(JSON.stringify({type:"Draw", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
	})
	two.on('message', msg => 
	{
		console.log("received this: ", (JSON.parse(msg))," from player 2");
		if((JSON.parse(msg)).type=="myindex")
		{
			one.send(JSON.stringify({type:"other's index", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
		else if ((JSON.parse(msg)).type=="winner")
		{
			one.send(JSON.stringify({type:"otherwin", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
		else if ((JSON.parse(msg)).type=="Draw")
		{
			one.send(JSON.stringify({type:"Draw", row:(JSON.parse(msg)).row, col:JSON.parse(msg).col}));
		}
	})
}

const server = http.createServer(async (req, resp) => 
{
    // console.log((new Date()) + ' Received request for ' + req.url);
    if (req.url == '/') 
    {
        resp.end(await readFile('index.html'))
    } 
    else if (req.url === '/app.js') 
    {
        resp.end(await readFile('app.js'))
    } 
    else if (req.url == '/vue.js') 
    {
        resp.end(await readFile('vue.js'))
    } 
    else 
    {
        resp.end()
    }
}).listen(8000);

const wss = new WebSocket.Server({ server });
console.log("waiting for clients")
wss.on('connection', ws => {
	sockets.push(ws);
	players++;
	if(players%2==0)
  	{
  		game(sockets[players-2], sockets[players-1]);
  	}
})