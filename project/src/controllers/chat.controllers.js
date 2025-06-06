import { prisma } from "../db/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const createChatMessage = asyncHandler(async (req, res) => {
  const { message, roomId } = req.body;
  const userId = req.user?.id; // assuming you extract user from JWT in middleware

  if (!message || !roomId) {
    throw new ApiError(400, "Message and roomId are required");
  }

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const newChat = await prisma.chat.create({
    data: {
      message,
      roomId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });

  return res.status(201).json(new ApiResponse(201, newChat, "Chat message created"));
});
export const getChats = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit) || 20; // default 20 messages
  const offset = parseInt(req.query.offset) || 0; // default start from 0

  if (!roomId) {
    throw new ApiError(400, "Room ID is required");
  }

  const chats = await prisma.chat.findMany({
    where: { roomId },
    orderBy: { createdAt: "desc" }, // newest first
    skip: offset,
    take: limit,
    include: { user: true }, // include user info, optional
  });

  return res.status(200).json(new ApiResponse(200, chats, "Chats fetched"));
});
