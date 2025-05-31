export const chat = {
  id: 123,
  userId: "abc123",
  name: "Namkha",
  message: "Hey there!",
  upvotes: ["xyz456"],
};

export class Store {
  constructor() {}
  initRoom(roomId) {}
  getChats(roomId, limit, offset) {}
  addChat(userId, name, roomId, message) {}
  upvote(userId, name, roomId) {}
}
