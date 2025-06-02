export class UserManager {
  constructor() {
    this.rooms = new Map();
  }

  addUser(name, userId, roomId, socket) {
    const idStr = userId.toString();

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { users: [] });
    }

    this.rooms.get(roomId).users.push({
      id: idStr,
      name,
      conn: socket,
    });

    socket.on("close", () => {
      this.removeUser(roomId, idStr);
    });
  }

  removeUser(roomId, userId) {
    const idStr = userId.toString();
    const users = this.rooms.get(roomId)?.users;
    if (users) {
      this.rooms.get(roomId).users = users.filter(({ id }) => id !== idStr);
      if (this.rooms.get(roomId).users.length === 0) {
        this.rooms.delete(roomId); // Optional: clean up empty rooms
      }
    }
    console.log(`Removed user ${idStr} from room ${roomId}`);
  }

  getUser(roomId, userId) {
    const idStr = userId.toString();
    return this.rooms.get(roomId)?.users.find(({ id }) => id === idStr) ?? null;
  }

  broadcast(roomId, senderUserId, message) {
    const idStr = senderUserId.toString();
    const room = this.rooms.get(roomId);
    if (!room) {
      console.log("Room not found for broadcast");
      return;
    }

    room.users.forEach(({ conn }) => {
      console.log("broadcast to everone");
      conn.sendUTF(JSON.stringify(message));
    });
  }
}
