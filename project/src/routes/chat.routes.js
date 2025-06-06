import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createChatMessage, getChats } from "../controllers/chat.controllers.js";

const router = Router();

router.post("/", verifyJWT, createChatMessage);
router.get("/:roomId", verifyJWT, getChats);

export default router;
