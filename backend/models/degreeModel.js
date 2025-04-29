// backend/models/degreeModel.js
import mongoose from "mongoose";

const degreeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Degree", degreeSchema);
