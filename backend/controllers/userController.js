import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import razorpay from "razorpay";
import otpGenerator from "otp-generator";
import mongoose from "mongoose";

import { sendOTPEmail } from "../utils/sendEmail.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import activityLogModel from "../models/activityLogModel.js";
import appointmentModel from "../models/appointmentModel.js";
import sessionModel from "../models/sessionModel.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { setOTP, getOTP, clearOTP } from "../utils/otpStore.js";
import { logActivity } from "../controllers/activityLogController.js";

// In-memory cache for patient list
let patientCache = null;
let patientCacheTime = 0;
const PATIENT_CACHE_TTL = 60 * 1000; // 60 seconds

// Password strength validation helper
function isStrongPassword(password) {
  // At least 8 chars, one uppercase, one lowercase, one digit, one special char
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  return strongRegex.test(password);
}

// API to send OTP for forgot password
export const sendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // TEMP: Log OTP for debugging
    console.log(`OTP for ${email}: ${otp}`);

    // Store OTP transiently
    setOTP(email, otp, 600); // 10 min

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to verify OTP and reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return res.json({
        success: false,
        message: "Password did not meet the requirements.",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Check OTP from transient store
    const storedOtp = getOTP(email);
    if (!storedOtp || storedOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();
    clearOTP(email);
    
    // Log the password reset activity
    try {
      await activityLogModel.create({
        userId: user._id,
        userName: user.name,
        action: 'PASSWORD_RESET',
        details: {
          resetTime: new Date(),
          ipAddress: req.ip || 'unknown',
          method: 'OTP verification'
        }
      });
    } catch (logError) {
      console.error("Error logging password reset activity:", logError);
      // Continue with password reset even if logging fails
    }

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// export const resetPassword = async (req, res) => {
//   try {
//     const { email, otp, newPassword } = req.body;

//     if (!email || !otp || !newPassword) {
//       return res.json({
//         success: false,
//         message: "Email, OTP, and new password are required",
//       });
//     }

//     // Validate password strength
//     if (!isStrongPassword(newPassword)) {
//       return res.json({
//         success: false,
//         message: "Password did not meet the requirements.",
//       });
//     }

//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Check OTP from transient store
//     const storedOtp = getOTP(email);
//     if (!storedOtp || storedOtp !== otp) {
//       return res.json({
//         success: false,
//         message: "Invalid or expired OTP",
//       });
//     }

//     // Hash new password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(newPassword, salt);

//     // Update password
//     user.password = hashedPassword;
//     await user.save();
//     clearOTP(email);

//     res.json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// API to send OTP
export const sendOTP = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email",
      });
    }

    // Debug log before password validation
    console.log("[sendOTP] Validating password strength for:", email, password);

    // Validate password strength
    if (!isStrongPassword(password)) {
      console.log("[sendOTP] Weak password detected, returning error.");
      return res.json({
        success: false,
        message: "Password did not meet the requirements.",
      });
    }

    // Debug log after password validation
    console.log("[sendOTP] Password is strong, proceeding with OTP flow for:", email);

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // TEMP: Log OTP for debugging
    console.log(`OTP for ${email}: ${otp}`);

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store OTP transiently
    setOTP(email, otp, 600); // 10 min

    // Update or create user (without OTP in DB)
    if (existingUser) {
      await userModel.updateOne(
        { email },
        {
          name,
          password: hashedPassword,
          isVerified: false,
        }
      );
    } else {
      await userModel.create({
        name,
        email,
        password: hashedPassword,
        isVerified: false,
      });
    }

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to verify OTP and complete registration
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Email already verified",
      });
    }

    // Check OTP from transient store
    const storedOtp = getOTP(email);
    if (!storedOtp || storedOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();
    clearOTP(email);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Create a session for the user (auto-login after OTP)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
    await sessionModel.create({
      userId: user._id,
      token,
      expiresAt,
    });
    await userModel.updateOne({ _id: user._id }, { isLoggedIn: true });

    res.json({
      success: true,
      token,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Logout logic for session collection
const logoutUser = async (req, res) => {
  try {
    // Get token from headers
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "No token provided" });
    }
    
    // Remove the session for this token
    const session = await sessionModel.findOneAndDelete({ token });
    if (session) {
      // Get user info for logging
      const user = await userModel.findById(session.userId);
      
      // Set isLoggedIn to false for the user
      await userModel.updateOne({ _id: session.userId }, { isLoggedIn: false });
      
      // Log the logout activity
      try {
        await activityLogModel.create({
          userId: session.userId,
          userName: user ? user.name : "Unknown User",
          action: 'USER_LOGOUT',
          details: {
            logoutTime: new Date(),
            ipAddress: req.ip || 'unknown',
            sessionDuration: session.createdAt ? 
              `${Math.round((new Date() - new Date(session.createdAt)) / (1000 * 60))} minutes` : 
              'Unknown'
          }
        });
      } catch (logError) {
        console.error("Error logging logout activity:", logError);
        // Continue with logout even if logging fails
      }
    }
    
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// const logoutUser = async (req, res) => {
//   try {
//     // Get token from headers
//     const { token } = req.headers;
//     if (!token) {
//       return res.json({ success: false, message: "No token provided" });
//     }
//     // Remove the session for this token
//     const session = await sessionModel.findOneAndDelete({ token });
//     if (session) {
//       // Set isLoggedIn to false for the user
//       await userModel.updateOne({ _id: session.userId }, { isLoggedIn: false });
//     }
//     return res.json({ success: true, message: "Logged out successfully" });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

//API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({
        success: false,
        message: "Missing Details",
      });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email",
      });
    }

    // validating strong password
    if (!isStrongPassword(password)) {
      return res.json({
        success: false,
        message: "Password did not meet the requirements.",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET
    );

    // Create a session for the new user (auto-login)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
    await sessionModel.create({
      userId: user._id,
      token,
      expiresAt,
    });
    await userModel.updateOne({ _id: user._id }, { isLoggedIn: true });
    
    // Log the account creation activity
    try {
      await activityLogModel.create({
        userId: user._id,
        userName: user.name,
        action: 'ACCOUNT_CREATED',
        details: {
          registrationTime: new Date(),
          ipAddress: req.ip || 'unknown',
          email: user.email
        }
      });
    } catch (logError) {
      console.error("Error logging account creation activity:", logError);
      // Continue with registration even if logging fails
    }

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !password || !email) {
//       return res.json({
//         success: false,
//         message: "Missing Details",
//       });
//     }

//     // validating email format
//     if (!validator.isEmail(email)) {
//       return res.json({
//         success: false,
//         message: "Enter a valid email",
//       });
//     }

//     // validating strong password
//     if (!isStrongPassword(password)) {
//       return res.json({
//         success: false,
//         message: "Password did not meet the requirements.",
//       });
//     }

//     // hashing user password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const userData = {
//       name,
//       email,
//       password: hashedPassword,
//     };

//     const newUser = new userModel(userData);
//     const user = await newUser.save();

//     const token = jwt.sign(
//       {
//         id: user._id,
//       },
//       process.env.JWT_SECRET
//     );

//     // Create a session for the new user (auto-login)
//     const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes expiry
//     await sessionModel.create({
//       userId: user._id,
//       token,
//       expiresAt,
//     });
//     await userModel.updateOne({ _id: user._id }, { isLoggedIn: true });

//     res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");

    // Decrypt and mask phone number
    let maskedPhone = userData.phone;
    try {
      const decryptedPhone = decrypt(userData.phone);
      if (decryptedPhone && decryptedPhone.length >= 6) {
        maskedPhone = decryptedPhone.slice(0, 2) + "####" + decryptedPhone.slice(-4);
      } else {
        maskedPhone = decryptedPhone;
      }
    } catch (e) {
      // fallback: show as is if decryption fails
    }
    const userDataObj = userData.toObject();
    userDataObj.phone = maskedPhone;

    res.json({
      success: true,
      userData: userDataObj,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;

    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({
        success: false,
        message: "Data Missing",
      });
    }

    // Get original user data to track changes
    const originalUser = await userModel.findById(userId);
    if (!originalUser) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Encrypt phone before saving
    const encryptedPhone = encrypt(phone);

    // Track which fields were updated
    const updatedFields = [];
    if (name !== originalUser.name) updatedFields.push('name');
    if (phone !== decrypt(originalUser.phone)) updatedFields.push('phone');
    if (JSON.stringify(JSON.parse(address)) !== JSON.stringify(originalUser.address)) updatedFields.push('address');
    if (dob !== originalUser.dob) updatedFields.push('dob');
    if (gender !== originalUser.gender) updatedFields.push('gender');
    if (imageFile) updatedFields.push('profile image');

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone: encryptedPhone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    let imageURL = originalUser.image;
    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {
        image: imageURL,
      });
    }
    
    // Log the profile update activity
    try {
      await activityLogModel.create({
        userId: userId,
        userName: name, // Use the updated name
        action: 'PROFILE_UPDATED',
        details: {
          updateTime: new Date(),
          fieldsUpdated: updatedFields,
          ipAddress: req.ip || 'unknown'
        }
      });
    } catch (logError) {
      console.error("Error logging profile update activity:", logError);
      // Continue with profile update even if logging fails
    }

    res.json({
      success: true,
      message: "Profile Updated",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// const updateProfile = async (req, res) => {
//   try {
//     const { userId, name, phone, address, dob, gender } = req.body;

//     const imageFile = req.file;

//     if (!name || !phone || !dob || !gender) {
//       return res.json({
//         success: false,
//         message: "Data Missing",
//       });
//     }

//     // Encrypt phone before saving
//     const encryptedPhone = encrypt(phone);

//     await userModel.findByIdAndUpdate(userId, {
//       name,
//       phone: encryptedPhone,
//       address: JSON.parse(address),
//       dob,
//       gender,
//     });

//     if (imageFile) {
//       // upload image to cloudinary
//       const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
//         resource_type: "image",
//       });
//       const imageURL = imageUpload.secure_url;

//       await userModel.findByIdAndUpdate(userId, {
//         image: imageURL,
//       });
//     }

//     res.json({
//       success: true,
//       message: "Profile Updated",
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

//API to book appointment
const bookAppointment = async (req, res) => {
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, docId, slotDate } = req.body;
    let slotTime = req.body.slotTime;

    // Normalize slotTime to uppercase and trimmed
    slotTime = slotTime.trim().toUpperCase();

    console.log(`Attempting to book appointment for user ${userId} with doctor ${docId} on ${slotDate} at ${slotTime}`);

    // Lock the doctor document for update
    const docData = await doctorModel.findById(docId)
      .select("-password")
      .session(session);

    if (!docData) {
      console.log("Doctor not found");
      await session.abortTransaction();
      return res.json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!docData.available) {
      console.log("Doctor not available");
      await session.abortTransaction();
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slots_booked = docData.slots_booked;

    // Check for slot availability
    if (slots_booked[slotDate]?.map(t => t.trim().toUpperCase()).includes(slotTime)) {
      console.log("Slot not available in slots_booked");
      await session.abortTransaction();
        return res.json({
          success: false,
          message: "Slot not available",
        });
    }

    // Check for existing non-cancelled appointment
    const existingAppointment = await appointmentModel.findOne({
      docId,
      slotDate,
      slotTime,
      cancelled: false
    }).session(session);

    if (existingAppointment) {
      console.log("Slot already booked in database");
      await session.abortTransaction();
      return res.json({
        success: false,
        message: "Slot already booked",
      });
    }

    // Update slots_booked
    if (!slots_booked[slotDate]) {
      slots_booked[slotDate] = [];
    }
      slots_booked[slotDate].push(slotTime);

    const userData = await userModel.findById(userId)
      .select("-password")
      .session(session);

    if (!userData) {
      console.log("User not found");
      await session.abortTransaction();
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: {
        ...docData.toObject(),
        slots_booked: undefined // Remove slots_booked from docData
      },
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    // Create and save new appointment
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save({ session });

    // Update doctor's slots
    await doctorModel.findByIdAndUpdate(
      docId,
      { slots_booked },
      { session, new: true }
    );

    const user = await userModel.findById(userId);
    await activityLogModel.create({
      userId: userId,
      userName: user.name,
      action: 'APPOINTMENT_BOOKED',
      details: {
        doctorId: docId,
        doctorName: docData.name,
        appointmentDate: slotDate,
        appointmentTime: slotTime,
        fees: docData.fees
      }
    });

    // Commit the transaction
    await session.commitTransaction();

    console.log("Appointment booked successfully");
    res.json({
      success: true,
      message: "Appointment Booked Successfully",
    });
  } catch (error) {
    // If any error occurs, abort transaction
    await session.abortTransaction();
    console.log("Error during booking:", error);

    // Check if it's a duplicate key error (concurrent booking attempt)
    if (error.code === 11000) {
      console.log("Duplicate key error: This slot was just booked by someone else");
      return res.json({
        success: false,
        message: "This slot was just booked by someone else",
      });
    }

    res.json({
      success: false,
      message: error.message || "Failed to book appointment",
    });
  } finally {
    session.endSession();
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;

    const appointments = await appointmentModel.find({
      userId,
    });

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

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    // verify appointment user
    if (appointmentData.userId !== userId) {
      return res.json({
        success: false,
        message: "Unauthorized action",
      });
    }

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

    // Log the cancellation activity
    const user = await userModel.findById(userId);
    await activityLogModel.create({
      userId: userId,
      userName: user.name,
      action: 'APPOINTMENT_CANCELLED',
      details: {
        appointmentId: appointmentId,
        doctorId: docId,
        doctorName: docData.name,
        appointmentDate: slotDate,
        appointmentTime: slotTime,
        reason: req.body.reason || 'Not specified'
      }
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

// const cancelAppointment = async (req, res) => {
//   try {
//     const { userId, appointmentId } = req.body;

//     const appointmentData = await appointmentModel.findById(appointmentId);

//     // verify appointment user
//     if (appointmentData.userId !== userId) {
//       return res.json({
//         success: false,
//         message: "Unauthorized action",
//       });
//     }

//     await appointmentModel.findByIdAndUpdate(appointmentId, {
//       cancelled: true,
//     });

//     // Releasing doctor slot
//     const { docId, slotDate, slotTime } = appointmentData;

//     const docData = await doctorModel.findById(docId);

//     let slots_booked = docData.slots_booked;

//     slots_booked[slotDate] = slots_booked[slotDate].filter(
//       (e) => e !== slotTime
//     );

//     await doctorModel.findByIdAndUpdate(docId, {
//       slots_booked: slots_booked,
//     });

//     res.json({
//       success: true,
//       message: "Appointment Cancelled",
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData || appointmentData.cancelled) {
      return res.json({
        success: false,
        message: "Appointment Cancelled or not found",
      });
    }

    // creating options for razorpay payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    // creation of an order
    const order = await razorpayInstance.orders.create(options);

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// API to verify payment of razorpay
// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      const appointmentId = orderInfo.receipt;
      const appointment = await appointmentModel.findById(appointmentId);
      
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        payment: true,
      });
      
      // Log the payment activity
      const user = await userModel.findById(appointment.userId);
      const doctor = await doctorModel.findById(appointment.docId);
      
      await activityLogModel.create({
        userId: appointment.userId,
        userName: user.name,
        action: 'PAYMENT_MADE',
        details: {
          appointmentId: appointmentId,
          doctorId: appointment.docId,
          doctorName: doctor.name,
          amount: orderInfo.amount / 100, // Convert from paisa to rupees
          paymentId: req.body.razorpay_payment_id,
          transactionDate: new Date(),
          appointmentDate: appointment.slotDate,
          appointmentTime: appointment.slotTime
        }
      });
      
      res.json({
        success: true,
        message: "Payment Successful",
      });
    } else {
      res.json({
        success: false,
        message: "Payment Failed",
      });
    }
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// const verifyRazorpay = async (req, res) => {
//   try {
//     const { razorpay_order_id } = req.body;

//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

//     if (orderInfo.status === "paid") {
//       await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
//         payment: true,
//       });
//       res.json({
//         success: true,
//         message: "Payment Successful",
//       });
//     } else {
//       res.json({
//         success: false,
//         message: "Payment Failed",
//       });
//     }
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist"
      });
    }

    // Prevent login if user is not verified
    if (!user.isVerified) {
      return res.json({
        success: false,
        message: "Please verify your email before logging in."
      });
    }

    // Check if account is expired
    if (user.expiresAt && new Date() < new Date(user.expiresAt)) {
      // Account is still under suspension period
      // Calculate remaining time
      const remainingMs = new Date(user.expiresAt) - new Date();
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      
      return res.json({
        success: false,
        message: `Your account is temporarily suspended. Please try again in ${remainingMinutes} minute(s).`,
        expired: true,
        expiresAt: user.expiresAt
      });
    }
    
    // If account was expired but expiry time has passed, reset the expired flag
    if (user.isExpired && (!user.expiresAt || new Date() >= new Date(user.expiresAt))) {
      user.isExpired = false;
      user.expiresAt = null;
      await user.save();
    }

    // Check if user is already logged in
    if (user.isLoggedIn) {
      // Check if there is a valid session for this user
      const activeSession = await sessionModel.findOne({ userId: user._id, expiresAt: { $gt: new Date() } });
      if (activeSession) {
        return res.json({
          success: false,
          message: "User is already logged in from another device or browser. Please logout first."
        });
      } else {
        // Session expired, reset isLoggedIn
        await userModel.updateOne({ _id: user._id }, { isLoggedIn: false });
        user.isLoggedIn = false;
      }
    }

    // Check if account is locked
    if (user.isLocked()) {
      const timeLeft = Math.ceil((user.lockUntil - new Date()) / 1000 / 60); // minutes left
      return res.json({
        success: false,
        message: "Account is locked",
        timeLeft: timeLeft
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await user.incrementLoginAttempts();

      if (user.loginAttempts + 1 >= 5) {
        return res.json({
          success: false,
          message: "Account locked due to too many failed attempts",
          timeLeft: 10
        });
      }

      return res.json({
        success: false,
        message: "Invalid Credentials",
        attemptsLeft: 5 - (user.loginAttempts + 1)
      });
    }

    // Reset login attempts on successful login
    await user.updateOne({
      $set: {
        loginAttempts: 0,
        lockUntil: null
      }
    });

    // Remove any existing session for this user (single session per user)
    await sessionModel.deleteMany({ userId: user._id });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Create a new session with expiry (30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await sessionModel.create({
      userId: user._id,
      token,
      expiresAt,
    });

    // Set isLoggedIn to true
    await userModel.updateOne({ _id: user._id }, { isLoggedIn: true });

    // Log the login activity
    try {
      await activityLogModel.create({
        userId: user._id,
        userName: user.name,
        action: 'USER_LOGIN',
        details: {
          loginTime: new Date(),
          ipAddress: req.ip || 'unknown',
          device: req.headers['user-agent'] || 'unknown'
        }
      });
    } catch (logError) {
      console.log("Error logging activity:", logError);
      // Continue with login even if logging fails
    }

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User does not exist"
//       });
//     }

//     // Prevent login if user is not verified
//     if (!user.isVerified) {
//       return res.json({
//         success: false,
//         message: "Please verify your email before logging in."
//       });
//     }

//     // Check if account is expired
//     if (user.expiresAt && new Date() < new Date(user.expiresAt)) {
//       // Calculate remaining time
//       const remainingMs = new Date(user.expiresAt) - new Date();
//       const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      
//       return res.json({
//         success: false,
//         message: `Your account is temporarily suspended. Please try again in ${remainingMinutes} minute(s).`,
//         expired: true,
//         expiresAt: user.expiresAt
//       });
//     }
    
//     // If account was expired but expiry time has passed, reset the expired flag
//     if (user.isExpired && (!user.expiresAt || new Date() >= new Date(user.expiresAt))) {
//       user.isExpired = false;
//       user.expiresAt = null;
//       await user.save();
//     }

//     // Check if user is already logged in
//     if (user.isLoggedIn) {
//       // Check if there is a valid session for this user
//       const activeSession = await sessionModel.findOne({ userId: user._id, expiresAt: { $gt: new Date() } });
//       if (activeSession) {
//         return res.json({
//           success: false,
//           message: "User is already logged in from another device or browser. Please logout first."
//         });
//       } else {
//         // Session expired, reset isLoggedIn
//         await userModel.updateOne({ _id: user._id }, { isLoggedIn: false });
//         user.isLoggedIn = false;
//       }
//     }

//     // Check if account is locked
//     if (user.isLocked()) {
//       const timeLeft = Math.ceil((user.lockUntil - new Date()) / 1000 / 60); // minutes left
//       return res.json({
//         success: false,
//         message: "Account is locked",
//         timeLeft: timeLeft
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       await user.incrementLoginAttempts();

//       if (user.loginAttempts + 1 >= 5) {
//         return res.json({
//           success: false,
//           message: "Account locked due to too many failed attempts",
//           timeLeft: 10
//         });
//       }

//       return res.json({
//         success: false,
//         message: "Invalid Credentials",
//         attemptsLeft: 5 - (user.loginAttempts + 1)
//       });
//     }

//     // Reset login attempts on successful login
//     await user.updateOne({
//       $set: {
//         loginAttempts: 0,
//         lockUntil: null
//       }
//     });

//     // Remove any existing session for this user (single session per user)
//     await sessionModel.deleteMany({ userId: user._id });

//     // Generate JWT token
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "30m" }
//     );

//     // Create a new session with expiry (30 minutes)
//     const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
//     await sessionModel.create({
//       userId: user._id,
//       token,
//       expiresAt,
//     });

//     // Set isLoggedIn to true
//     await userModel.updateOne({ _id: user._id }, { isLoggedIn: true });

//     return res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.log(error);
//     res.json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// API to get patient list with caching
const getPatientList = async (req, res) => {
  try {
    const now = Date.now();
    if (patientCache && now - patientCacheTime < PATIENT_CACHE_TTL) {
      return res.json({ success: true, patients: patientCache, cached: true });
      console.log(patientCache);
    }
    // You can filter by role if needed, e.g. { role: 'patient' }
    const patients = await userModel.find({}).select('-password');
    patientCache = patients;
    patientCacheTime = now;
    return res.json({ success: true, patients, cached: false });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  getPatientList
};
