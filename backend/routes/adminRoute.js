import express from "express";

import {
  addDoctor,
  allDoctors,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  promoteDoctorToAdmin,
  demoteDoctorToDoctor,
  setAccountExpiry,
  unexpireAccount
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";
import userModel from '../models/userModel.js';
import { getActivityLogs } from "../controllers/activityLogController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.put("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.post("/promote-doctor", authAdmin, promoteDoctorToAdmin);
adminRouter.post("/demote-doctor", authAdmin, demoteDoctorToDoctor);
// In adminRoute.js
adminRouter.post("/set-account-expiry", authAdmin, setAccountExpiry);
adminRouter.post("/unexpire-account", authAdmin, unexpireAccount);
adminRouter.get("/activity-logs", authAdmin, getActivityLogs);


adminRouter.get("/users", authAdmin, async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
});


export default adminRouter;

