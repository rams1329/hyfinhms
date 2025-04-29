// backend/models/activityLogModel.js
import mongoose from "mongoose";

// In activityLogModel.js
const activityLogSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN', 
        'USER_LOGOUT', 
        'PASSWORD_RESET', 
        'ACCOUNT_CREATED', 
        'PROFILE_UPDATED',
        'APPOINTMENT_BOOKED', 
        'APPOINTMENT_CANCELLED', 
        'PAYMENT_MADE'
      ]
    },
    details: {
      type: Object,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  }, { timestamps: true });
  
export default mongoose.model("ActivityLog", activityLogSchema);
