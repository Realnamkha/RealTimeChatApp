import { Store } from "./Store";
import { chat } from "./Store";
let globalChatId = "0";
export const Room = {
  roomId: "room1",
  chats: [chat],
};

export class InmemoryStore {
  constructor() {
    this.store = new Map();
  }
  initRoom(roomId) {
    this.store.set(roomId, {
      roomId,
      chats: [],
    });
  }

  // last 50 chats - limit 50 offset-0
  getChats(roomId, limit, offset) {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    return room.chats
      .reverse()
      .slice(0, offset)
      .slice(-1 * limit);
  }
  addChat(userId, name, roomId, message) {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    const chat = {
      id: (globalChatId++).toString(),
      userId: userId,
      name: name,
      message: message,
      upvotes: [],
    };
    room.chats.push(chat);
    return chat;
  }
  upvote(userId, roomId, chatId) {
    const room = this.store.get(roomId);
    if (!room) {
      return;
    }
    const chat = room.chats.find(({ id }) => id === chatId);
    if (chat) {
      chat.upvotes.push(userId);
    }
    return chat;
  }
}
