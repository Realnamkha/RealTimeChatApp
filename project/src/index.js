import websocket from "websocket";
import http from "http";
import dotenv from "dotenv";
import { app } from "./app.js";
import { connectToDatabase, prisma } from "./db/prismaClient.js";
import { SupportedMessage, IncomingMessage } from "./Messages/Incomingmessages.js";
import { UserManager } from "./UserManager.js";
import { InMemoryStore } from "./Store/InmemoryStore.js";
import jwt from "jsonwebtoken";
import { createOutgoingAddChatMessage, createOutgoingUpdateChatMessage } from "./Messages/Outgoingmessages.js";
import { PrismaStore } from "./Store/prismaStore.js";
import cookie from "cookie";

// Destructure `server` from the websocket package
const { server: WebSocketServer } = websocket;

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

const prismaStore = new PrismaStore();
const userManager = new UserManager(prismaStore);
// const userManager = new UserManager();
// const store = new InMemoryStore();
// Create the HTTP server
const server = http.createServer(app);
const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});
connectToDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server and WebSocket running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Prisma connection error:", err);
    process.exit(1);
  });
function originIsAllowed(origin) {
  return true;
}

wsServer.on("request", async (request) => {
  // Parse cookies from request headers
  const cookies = cookie.parse(request.httpRequest.headers.cookie || "");
  const token = cookies.accessToken; // get token from cookie named "accessToken"

  console.log("🌐 Incoming WebSocket request");
  console.log("🔐 Extracted token from cookie:", token);

  if (!token) {
    console.warn("❌ No token found in cookies. Rejecting.");
    request.reject(401, "Unauthorized: Token missing");
    return;
  }

  let user;
  try {
    user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("✅ Token verified successfully:", user);
  } catch (err) {
    console.error("❌ JWT verification failed:", err.message);
    request.reject(401, "Unauthorized: Invalid token");
    return;
  }

  const connection = request.accept(null, request.origin);
  console.log(`✅ Connection accepted for user: ${user.username}`);

  connection.user = user;

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      try {
        messageHandler(connection, JSON.parse(message.utf8Data));
      } catch (error) {
        console.error("❌ Failed to parse message:", error.message);
      }
    }
  });
});

// Handles different types of messages
async function messageHandler(websocket, rawMessage) {
  console.log("Received raw message:", rawMessage);

  const result = IncomingMessage.safeParse(rawMessage);

  if (!result.success) {
    console.error("Invalid message received:", result.error);
    return;
  }

  const message = result.data;
  console.log("Parsed message:", message);

  switch (message.type) {
    case SupportedMessage.JoinRoom: {
      const { name, userId, roomId } = message.payload;
      console.log(`JoinRoom message payload: name=${name}, userId=${userId}, roomId=${roomId}`);

      try {
        await userManager.addUser(name, userId, roomId, websocket);
        console.log(`${name} joined room ${roomId}`);
      } catch (e) {
        console.error("Error adding user:", e);
      }
      break;
    }

    case SupportedMessage.SendMessage: {
      console.log("Full incoming message:", message);
      const { userId, roomId, message: text } = message.payload;
      console.log(`SendMessage payload: userId=${userId}, roomId=${roomId}, message=${text}`);

      try {
        const user = userManager.getUser(roomId, userId);
        if (!user) {
          console.error("User not found in db");
          return;
        }
        console.log("User found:", user.name);

        // ✅ FIXED: pass user.name instead of whole user object
        console.log("Calling addChat with:", {
          userId,
          roomId,
          message: text,
        });
        const chat = await prismaStore.addChat(userId, roomId, text);
        if (!chat) {
          console.error("Failed to add chat");
          return;
        }

        console.log(`Chat added:`, chat);

        const outgoingPayload = createOutgoingAddChatMessage({
          chatId: chat.id,
          roomId,
          message: text,
          name: user.name,
          upvotes: 0,
        });

        userManager.broadcast(roomId, userId, outgoingPayload);
        console.log("Broadcasted AddChat message:", outgoingPayload);
      } catch (e) {
        console.error("Error handling SendMessage:", e);
      }
      break;
    }

    case SupportedMessage.UpvoteMessage: {
      const { userId, roomId, chatId } = message.payload;
      console.log(`UpvoteMessage payload: userId=${userId}, roomId=${roomId}, chatId=${chatId}`);

      try {
        const chat = store.upvote(userId, roomId, chatId);

        if (!chat) {
          console.error("Chat not found or upvote failed");
          return;
        }

        console.log("Chat after upvote:", chat);

        const outgoingPayload = createOutgoingUpdateChatMessage({
          chatId,
          roomId,
          upvotes: chat.upvotes,
        });

        userManager.broadcast(roomId, userId, outgoingPayload);
        console.log("Broadcasted UpdateChat message:", outgoingPayload);
      } catch (e) {
        console.error("Error handling UpvoteMessage:", e);
      }
      break;
    }

    default:
      console.warn("Unhandled message type:", message.type);
  }
}
