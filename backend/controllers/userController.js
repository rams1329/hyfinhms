import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import razorpay from "razorpay";
import otpGenerator from "otp-generator";

import { sendOTPEmail } from "../utils/sendEmail.js";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";


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

    // Calculate OTP expiration (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with OTP
    await userModel.updateOne(
      { email },
      {
        otp,
        otpExpires,
      }
    );

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
    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

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

    // Validate password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a strong password",
      });
    }

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

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Calculate OTP expiration (10 minutes from now)
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update or create user with OTP
    if (existingUser) {
      await userModel.updateOne(
        { email },
        {
          name,
          password: hashedPassword,
          otp,
          otpExpires,
          isVerified: false,
        }
      );
    } else {
      await userModel.create({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpires,
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

    if (user.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < new Date()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET
    );

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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET
    );

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
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a strong password",
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

// // API for user login
// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await userModel.findOne({ email });

//     if (!user) {
//       return res.json({
//         success: false,
//         message: "User does not exist",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (isMatch) {
//       const token = jwt.sign(
//         {
//           id: user._id,
//         },
//         process.env.JWT_SECRET
//       );

//       return res.json({
//         success: true,
//         token,
//       });
//     } else {
//       return res.json({
//         success: false,
//         message: "Invalid Credentials",
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

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const userData = await userModel.findById(userId).select("-password");

    res.json({
      success: true,
      userData,
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

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, {
        image: imageURL,
      });
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

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor not available",
      });
    }

    let slots_booked = docData.slots_booked;

    // checking for slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, {
      slots_booked,
    });

    res.json({
      success: true,
      message: "Appointment Booked",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
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
const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
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

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
};
