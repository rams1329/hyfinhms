import express from "express";
import cors from "cors";
import "dotenv/config.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import responseInterceptor from "./middlewares/responseInterceptor.js";
import { sessionTimeout } from "./middlewares/sessionTimeout.js";
import mongoSanitize from "express-mongo-sanitize";

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json({ limit: "8mb" }));
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(mongoSanitize());
app.use(responseInterceptor);
app.use(sessionTimeout);

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API WORKING!");
});

app.listen(port, () => {
  console.log(`Server Started: ${port}`);
});
