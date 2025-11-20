import express from "express";
import http from "http";
import ws from "ws";

const PORT = 8080;

const app = express();
app.use(express.json());
const server = http.createServer(app);

const wss = new ws.Server({ server });

server.listen(PORT, () => {
    console.log(`HTTP & WebSocket server running on http://localhost:${PORT}`);
});

wss.on("connection", (socket) => {
    console.log("Client connected!");

    socket.on("message", (message) => {
        console.log("Received from client: ", message);
    })

    broadcast({
        type: "Welcome",
        message: "Hello! You are connected to the WebSocket server."
    })
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === ws.OPEN) {
            client.send(JSON.stringify(data));
        }
    })
}

app.post("/send", (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    console.log("message received: ", message)

    broadcast({
        message,
        time: new Date().toISOString()
    });

    res.json({ status: "Message broadcasted" });
});