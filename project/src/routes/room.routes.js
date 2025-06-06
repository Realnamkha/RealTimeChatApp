import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { createRoom, deleteRoom, getRoomById, getRooms } from "../controllers/room.controllers.js";

const router = Router();

router.post("/", verifyJWT, createRoom); // create room
router.get("/", verifyJWT, getRooms); // get all rooms
router.get("/:id", verifyJWT, getRoomById); // get room by id
router.delete("/:id", verifyJWT, deleteRoom); // delete room by id

export default router;
