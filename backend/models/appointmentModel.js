import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  docId: {
    type: String,
    required: true,
  },
  slotDate: {
    type: String,
    required: true,
  },
  slotTime: {
    type: String,
    required: true,
  },
  userData: {
    type: Object,
    required: true,
  },
  docData: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Number,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Add compound index to prevent double booking
appointmentSchema.index(
  { docId: 1, slotDate: 1, slotTime: 1 },
  { unique: true, partialFilterExpression: { cancelled: false } }
);

const appointmentModel =
  mongoose.model.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
