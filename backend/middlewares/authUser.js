import jwt from "jsonwebtoken";
import sessionModel from "../models/sessionModel.js";
import userModel from "../models/userModel.js";

// user authentication middleware
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    console.log("[authUser] Incoming token:", token);
    if (!token) {
      console.log("[authUser] No token provided");
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    // Check if session exists and is not expired
    const session = await sessionModel.findOne({ token });
    console.log("[authUser] Session found:", session);
    if (!session) {
      console.log("[authUser] No session found for token");
      return res.json({
        success: false,
        message: "You have been logged out because your account was accessed from another device.",
      });
    }
    if (session.expiresAt < new Date()) {
      // Session expired, remove it
      console.log("[authUser] Session expired for token");
      await sessionModel.deleteOne({ token });
      return res.json({
        success: false,
        message: "It has been 10 minutes, your account is locked. Please login again.",
      });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[authUser] Token decoded:", token_decode);
    req.body.userId = token_decode.id;

    // Check if user account is expired
    const user = await userModel.findById(token_decode.id);
    if (user && (user.isExpired || (user.expiresAt && new Date() < new Date(user.expiresAt)))) {
      // Remove session and force logout
      await sessionModel.deleteOne({ token });
      return res.json({
        success: false,
        message: "Your account has expired. Please login again.",
        expired: true
      });
    }

    next();
  } catch (error) {
    console.log("[authUser] Error:", error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authUser;
