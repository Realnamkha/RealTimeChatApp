export const chat = {
  id: 123,
  userId: "abc123",
  name: "Namkha",
  message: "Hey there!",
  upvotes: ["xyz456"],
};

export class Store {
  initRoom(roomId) {
    throw new Error("Not implemented");
  }
  getChats(roomId, limit, offset) {
    throw new Error("Not implemented");
  }
  addChat(userId, name, roomId, message) {
    throw new Error("Not implemented");
  }
  upvote(userId, roomId, chatId) {
    throw new Error("Not implemented");
  }
}
