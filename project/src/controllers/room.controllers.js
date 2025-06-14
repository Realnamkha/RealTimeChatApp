import { prisma } from "../db/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;
  if (!name) {
    throw new ApiError(400, "Room name is required");
  }
  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const room = await prisma.room.create({
    data: { name, creatorId: userId },
  });

  return res.status(201).json(new ApiResponse(201, room, "Room created successfully"));
});
export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await prisma.room.findMany();
  return res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});
export const getRoomById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new ApiError(400, "Room id is required");
  }

  const room = await prisma.room.findUnique({
    where: { id }, // use id here, not undefined
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  res.status(200).json(new ApiResponse(200, room, "Room fetched successfully"));
});
export const deleteRoom = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new ApiError(404, "Room not found");

  if (room.creatorId !== userId) {
    throw new ApiError(403, "You are not allowed to delete this room");
  }

  // Delete related room users first
  await prisma.roomUser.deleteMany({ where: { roomId: id } });

  // Now delete the room
  await prisma.room.delete({ where: { id } });

  return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully"));
});

export const getRoomUsers = asyncHandler(async (req, res) => {
  const { id: roomId } = req.params;

  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const usersInRoom = await prisma.roomUser.findMany({
    where: { roomId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
    },
  });

  const users = usersInRoom.map((ru) => ru.user);

  res.status(200).json(new ApiResponse(200, users, "Users in room fetched successfully"));
});
