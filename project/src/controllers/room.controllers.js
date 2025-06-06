import { prisma } from "../db/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const createRoom = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Room name is required");
  }

  const room = await prisma.room.create({
    data: { name },
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
  await prisma.room.delete({ where: { id } });
  return res.status(200).json(new ApiResponse(200, null, "Room deleted successfully"));
});
