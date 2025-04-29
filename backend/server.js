import express from "express";
import cors from "cors";
import "dotenv/config.js";
import mongoose from 'mongoose';

import { connectDB, closeDB } from "./utils/dbConnection.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import degreeRoute from "./routes/degreeRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Connect to MongoDB with pooling
(async () => {
  try {
    await connectDB();
    connectCloudinary();
    app.listen(port, () => {
      console.log(`Server Started: ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB. Server not started.", err);
    process.exit(1);
  }
})();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/degrees", degreeRoute);

app.get("/", (req, res) => {
  res.send("API WORKING!");
});

app.get('/api/pool-status', (req, res) => {
  res.json({ readyState: mongoose.connection.readyState });
});

// Graceful shutdown
const shutdown = async () => {
  console.log("\nShutting down server...");
  await closeDB();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
