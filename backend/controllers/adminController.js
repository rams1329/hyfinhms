import validator from "validator";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";

import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import sessionModel from "../models/sessionModel.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address),
      date: Date.now(),
    };

    const newDoctor = new doctorModel(doctorData);

    await newDoctor.save();

    res.json({
      success: true,
      message: "Doctor Added",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API for admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Super admin login
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.json({
        success: true,
        token,
      });
    }

    // Doctor admin login
    const doctor = await doctorModel.findOne({ email });
    if (doctor && doctor.role === "admin") {
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (isMatch) {
        const token = jwt.sign(
          { id: doctor._id, role: "admin" },
          process.env.JWT_SECRET
        );
        return res.json({
          success: true,
          token,
        });
      }
    }

    // If neither, invalid credentials
    return res.json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const docData = await doctorModel.findById(docId);

    let slots_booked = docData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked: slots_booked,
    });

    res.json({
      success: true,
      message: "Appointment Cancelled",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({
      success: true,
      dashData,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to promote doctor to admin
const promoteDoctorToAdmin = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }
    if (doctor.role === 'admin') {
      return res.json({ success: false, message: 'Doctor is already an admin' });
    }
    doctor.role = 'admin';
    await doctor.save();
    res.json({ success: true, message: 'Doctor promoted to admin' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to demote admin to doctor
const demoteDoctorToDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.json({ success: false, message: 'Doctor not found' });
    }
    if (doctor.role === 'doctor') {
      return res.json({ success: false, message: 'Doctor is already a doctor' });
    }
    doctor.role = 'doctor';
    await doctor.save();
    res.json({ success: true, message: 'Doctor demoted to doctor' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};



// Set account expiry
const setAccountExpiry = async (req, res) => {
  try {
    const { userId, minutes = 0, hours = 0, days = 0 } = req.body;
    
    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Validate at least one time unit is provided
    if (minutes === 0 && hours === 0 && days === 0) {
      return res.json({
        success: false,
        message: "Please specify a valid expiry duration"
      });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }
    
    // Calculate expiry time
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 
      minutes * 60 * 1000 + 
      hours * 60 * 60 * 1000 + 
      days * 24 * 60 * 60 * 1000
    );
    
    // Update user
    user.expiresAt = expiresAt;
    user.isExpired = true; // Set expired flag
    await user.save();
    
    // Format expiry time for response
    const formattedExpiry = expiresAt.toLocaleString();
    
    res.json({
      success: true,
      message: `Account suspended until ${formattedExpiry}`,
      expiresAt: expiresAt
    });
  } catch (error) {
    console.error("Set account expiry error:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Unexpire account
const unexpireAccount = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }
    
    // Remove expiry
    user.expiresAt = null;
    user.isExpired = false;
    await user.save();
    
    res.json({
      success: true,
      message: "Account has been reactivated successfully"
    });
  } catch (error) {
    console.error("Unexpire account error:", error);
    res.json({
      success: false,
      message: error.message
    });
  }
};


// Make sure to include these in your exports
export {
  addDoctor,
  loginAdmin,
  allDoctors,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  promoteDoctorToAdmin,
  demoteDoctorToDoctor,
  setAccountExpiry,
  unexpireAccount
};
