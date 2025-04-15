// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification OTP HYMED",
      html: `
        <h3><b>Your OTP for email verification/Forgot Password</b> of Hymed</h3>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Thankyou for using Hymed.</p>
      `,
    });
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};