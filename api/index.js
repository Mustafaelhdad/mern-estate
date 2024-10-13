import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user-route.js";
import authRouter from "./routes/auth.route.js";
import listingRouter from "./routes/listing.route.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then((res) => console.log("connected to MongoDB"))
  .catch((err) => console.log(err));

const app = express();
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.listen(3000, () => {
  console.log("server is running on port 3000");
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
