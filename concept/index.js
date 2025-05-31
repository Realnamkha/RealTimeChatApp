import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();

// Optional: simple HTTP route
app.get("/", (req, res) => {
  res.send("Hello world");
});

// 🔧 Create raw HTTP server
const server = http.createServer(app);

// 🔌 Create WebSocket server attached to the HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ Client connected!");

  ws.on("message", (message) => {
    console.log("📩 Received:", message.toString());
    ws.send("Echo: " + message.toString());
  });

  ws.send("👋 Welcome to the WebSocket server!");
});

// 🟢 Start the server
server.listen(8080, () => {
  console.log("Server is listening on http://localhost:8080");
});
