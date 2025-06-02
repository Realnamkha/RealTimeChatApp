import { Store } from "./Store.js";
let globalChatId = 0;

export class InMemoryStore extends Store {
  constructor() {
    super();
    this.rooms = new Map();
  }

  initRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { roomId, chats: [] });
    }
  }

  getChats(roomId, limit, offset) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const chats = [...room.chats].reverse();
    return chats.slice(offset, offset + limit);
  }

  addChat(userId, name, roomId, message) {
    if (!this.rooms.has(roomId)) {
      this.initRoom(roomId);
    }
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const chat = {
      id: (globalChatId++).toString(),
      userId,
      name,
      message,
      upvotes: [],
    };

    room.chats.push(chat);
    return chat;
  }

  upvote(userId, roomId, chatId) {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const chat = room.chats.find((chat) => chat.id === chatId);

    if (chat) {
      if (chat.upvotes.find((x) => x === userId)) {
        return chat;
      }
      chat.upvotes.push(userId);
    }
    return chat;
  }
}
