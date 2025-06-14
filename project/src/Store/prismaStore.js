import { Store } from "./Store.js";
import { prisma } from "../db/prismaClient.js";

export class PrismaStore extends Store {
  async initRoom(roomId) {
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      await prisma.room.create({ data: { id: roomId, name: roomId } });
    }
  }

  async getChats(roomId, limit = 20, offset = 0) {
    const chats = await prisma.chat.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
      skip: offset,
      take: limit,
    });

    return chats.map((chat) => ({
      id: chat.id,
      userId: chat.userId,
      name: chat.user.username,
      message: chat.message,
      upvotes: chat.upvotes,
    }));
  }

  async addChat(userId, roomId, message) {
    const chat = await prisma.chat.create({
      data: {
        userId,
        roomId,
        message,
      },
      include: {
        user: true,
      },
    });

    return {
      id: chat.id,
      userId: chat.userId,
      name: chat.user.username,
      message: chat.message,
      upvotes: chat.upvotes,
    };
  }

  async upvote(userId, roomId, chatId) {
    // Just increment upvotes count by 1, no duplicate checks
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: { upvotes: { increment: 1 } },
    });

    return updatedChat;
  }

  async addUserToRoom(userId, roomId) {
    await prisma.roomUser.upsert({
      where: {
        userId_roomId: { userId, roomId },
      },
      update: {}, // do nothing if exists
      create: {
        userId,
        roomId,
      },
    });
  }
}
