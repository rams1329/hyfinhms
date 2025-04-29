import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

// Deprecated: Use utils/dbConnection.js for connection pooling and management
throw new Error("Deprecated: Use utils/dbConnection.js for MongoDB connection management.");

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database connected"));

  await mongoose.connect(`${process.env.MONGODB_URI}/prescripto`);
};

export default connectDB;
