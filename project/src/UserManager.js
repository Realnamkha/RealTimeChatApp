import { PrismaStore } from "./Store/prismaStore.js";

export class UserManager {
  constructor(prismaStore) {
    this.prismaStore = prismaStore;
    this.rooms = new Map(); // { roomId: { users: [{ id, name, conn }] } }
  }

  async addUser(name, userId, roomId, socket) {
    const idStr = userId.toString();

    // Add user to DB relation
    try {
      await this.prismaStore.addUserToRoom(userId, roomId);
    } catch (err) {
      console.error(`Failed to add user ${userId} to room ${roomId} in DB:`, err);
    }

    // Initialize room if it doesn't exist in memory
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { users: [] });
    }

    // Add user to room in memory
    this.rooms.get(roomId).users.push({
      id: idStr,
      name,
      conn: socket,
    });

    console.log(`User ${name} (${idStr}) joined room ${roomId}`);

    // Handle socket close (user disconnect)
    socket.on("close", () => {
      this.removeUser(roomId, idStr);
    });
  }

  removeUser(roomId, userId) {
    const idStr = userId.toString();
    const room = this.rooms.get(roomId);

    if (!room) return;

    room.users = room.users.filter(({ id }) => id !== idStr);

    if (room.users.length === 0) {
      this.rooms.delete(roomId); // Optional: clean up empty room
      console.log(`Room ${roomId} cleaned up (no more users).`);
    }

    console.log(`Removed user ${idStr} from room ${roomId}`);
  }

  getUser(roomId, userId) {
    const idStr = userId.toString();
    const room = this.rooms.get(roomId);
    return room?.users.find(({ id }) => id === idStr) ?? null;
  }

  broadcast(roomId, userId, message) {
    const room = this.rooms.get(roomId);

    if (!room) {
      console.error(`Room ${roomId} not found in memory`);
      return;
    }

    room.users.forEach(({ conn, id }) => {
      if (id === userId) return; // Skip sender

      try {
        conn.sendUTF(JSON.stringify(message));
        console.log(`Sent message to user ${id} in room ${roomId}`);
      } catch (err) {
        console.error(`Failed to send message to user ${id}:`, err);
      }
    });
  }
}
