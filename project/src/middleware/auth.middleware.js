import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { prisma } from "../db/prismaClient.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  console.log("Verify JWT");
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token retrieved:", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Prisma lookup by ID
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id }, // note: use id, not _id
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        // exclude password and refreshToken by not selecting them here
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
