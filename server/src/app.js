import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import env from "./config/env.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { errorHandler } from "../src/middleware/arror.middleware.js";

const app = express();

/* -------------------- MIDDLEWARE -------------------- */

// CORS
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// Parse JSON
app.use(express.json());

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Read cookies
app.use(cookieParser());


/* -------------------- TEST ROUTE -------------------- */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat API is running",
  });
});


/* -------------------- API ROUTES -------------------- */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/chats", chatRoutes);


/* -------------------- ERROR HANDLER -------------------- */

app.use(errorHandler);


export default app;