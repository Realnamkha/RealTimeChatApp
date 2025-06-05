import { prisma } from "../db/prismaClient.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { hashPassword, comparePassword, generateAccessToken, generateRefreshToken } from "../utils/auth.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, fullname: true },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token to DB
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
    });

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update refresh token in DB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    // Send new tokens
    return res
      .status(200)
      .cookie("accessToken", accessToken, {
        ...options,
        maxAge: 15 * 60 * 1000,
      }) // 15 mins
      .cookie("refreshToken", newRefreshToken, {
        ...options,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }) // 7 days
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Something went wrong while refreshing token");
  }
});

export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user exists by email or username
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
    },
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists with email or username");
  }

  // Hash the password before saving
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await prisma.user.create({
    data: {
      name: fullname,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      createdAt: true,
    },
  });

  // Generate tokens
  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: newUser,
        tokens: { accessToken, refreshToken },
      },
      "User registered successfully"
    )
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email or username and password are required");
  }

  // Find user by email or username
  const user = await prisma.user.findFirst({
    where: {
      OR: [email ? { email: email.toLowerCase() } : undefined, username ? { username: username.toLowerCase() } : undefined].filter(Boolean),
    },
  });

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  // Check password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set true in production
    sameSite: "Strict", // adjust if needed
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, match refresh token expiry
  };

  // Send tokens as cookies & user data in JSON
  res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes for access token
    })
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
          },
        },
        "User logged in successfully"
      )
    );
});
export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  // req.user is set by verifyJWT middleware
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        // other public fields you want to expose
      },
      "User profile fetched successfully"
    )
  );
});
