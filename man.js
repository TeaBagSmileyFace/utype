const express = require("express")
const cors = require("cors")
const bodyParser = require('body-parser')
const ws = require("ws");
const { WebSocketServer } = ws;

const { promises: fs } = require("fs");
const path = require("path")

const app = express()

const wsConnections = []
const fileMessages = path.join(__dirname,"messages.json")

app.use(cors())

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/' ,(req,res) => {
    res.sendFile(path.join(__dirname,"index.html"))
})

app.post("/sendMessage", async (req,res) => {
    const { username, message } = req.body;

    const data = JSON.parse(await fs.readFile(fileMessages, "utf-8"))

    data["messages"].push({username, message})

    await fs.writeFile(fileMessages, JSON.stringify(data), "utf-8")

    wsConnections.forEach(ws => ws.send("new message"))

    res.send("ok")
})

app.get("/getMessages", async (req,res) => {
    const data = JSON.parse(await fs.readFile(fileMessages, "utf-8"))

    res.send(data)
})

async function startHttpServer() {
    app.listen(8080, () => {
        console.log("[express] Htpp server started on port 8080")
    })
}

async function startWsServer() {
    const wss = new WebSocketServer({ port: 8081 }, () => {
        console.log("[wss] WebSocker server started on port 8081")
    });

    wss.on('connection', function connection(ws) {
        wsConnections.push(ws)

        ws.on('message', function message(data) {
            console.log('received: %s', data);
          });

          ws.send('something');
    });
}

async function main() {
    await startHttpServer();
    await startWsServer();
}

main();