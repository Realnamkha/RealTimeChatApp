import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middlewares
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure css and static pictures
app.use(cookieParser());

//import routes
import heathcheckrouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";

//routes
app.use("/api/v1/healthcheck", heathcheckrouter);
app.use("/api/v1/users", userRouter);

export { app };
