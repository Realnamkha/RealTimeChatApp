import { Router } from "express";
import { getAccessToken, getCurrentUserProfile, loginUser, refreshToken, registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshToken);
router.route("/current-user").get(verifyJWT, getCurrentUserProfile);
router.route("/token").get(verifyJWT, getAccessToken);
export default router;
