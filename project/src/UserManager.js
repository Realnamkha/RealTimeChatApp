export class UserManager {
  constructor() {
    this.rooms = new Map();
  }

  addUser(name, userId, roomId, socket) {
    if (!this.rooms.get(roomId)) {
      this.rooms.set(roomId, { users: [] });
    }

    this.rooms.get(roomId).users.push({
      id: userId,
      name,
      conn: socket,
    });
  }

  removeUser(roomId, userId) {
    const users = this.rooms.get(roomId)?.users;
    if (users) {
      this.rooms.get(roomId).users = users.filter(({ id }) => id !== userId);
    }
  }

  getUser(roomId, userId) {
    return (
      this.rooms.get(roomId)?.users.find(({ id }) => id === userId) ?? null
    );
  }

  broadcast(roomId, userId, message) {
    const user = this.getUser(roomId, userId);
    if (!user) {
      console.log("User not found in db");
      return;
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      console.log("Room not found");
      return;
    }

    room.users.forEach(({ conn, id }) => {
      if (id !== userId) {
        console.log("outgoing message " + JSON.stringify(message));
        conn.sendUTF(JSON.stringify(message));
      }
    });
  }
}
