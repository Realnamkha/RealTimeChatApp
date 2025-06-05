import { prisma } from "../db/prismaClient";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password) {
    throw new apiError(400, "All fields are required");
  }

  // Check if user exists by email or username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    },
  });

  if (existingUser) {
    throw new apiError(409, "User already exists with email or username");
  }

  // Create user
  const newUser = await prisma.user.create({
    data: {
      fullname,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
    },
    select: {
      id: true,
      fullname: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User registered successfully"));
});
