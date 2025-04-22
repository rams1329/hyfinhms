import jwt from "jsonwebtoken";
import doctorModel from "../models/doctorModel.js";

// admin authentication middleware
const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;
    if (!atoken) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

    // Super admin
    if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      return next();
    }

    // Doctor admin
    if (typeof token_decode === "object" && token_decode.id && token_decode.role === "admin") {
      const doctor = await doctorModel.findById(token_decode.id);
      if (doctor && doctor.role === "admin") {
        return next();
      }
    }

    return res.json({
      success: false,
      message: "Not Authorized Login Again",
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authAdmin;
