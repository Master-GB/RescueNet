import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { hashPassword, comparePassword } from "../services/passwordService.js";
import { setAuthCookie } from "../utils/setAuthCookie.js";
import {sendOTPTemplate, verifyAccountTemplate, sendResetOTPTemplate} from "../templates/emailTemplates.js";
import { sendEmail } from "../config/nodeMailer.js";
import CitizenProfile from "../models/userProfileModel/CitizenProfile.js";
import VolunteerProfile from "../models/userProfileModel/VolunteerProfile.js";
import NgoProfile from "../models/userProfileModel/NgoProfile.js";

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), name: user.name, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );


export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({
        success: false,
        message: "Email already exists",
        isUserExists: true,
      });

    const user = await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: role || "CITIZEN",
    });

    const token = signToken(user);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Successfully Registered",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registeration failed",
      error: error.message,
    });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Sign In failed:Missing Details" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials:please Enter Valid Credintials ",
      });

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid)
      return res.status(401).json({
        success: false,
        message: "Invalid Credintials:please Enter Valid Credintials",
      });

    if (!user.isAccountVerified) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Sign In failed:Account not verified",
        });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    return res
      .status(200)
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Login failed:please try again",
        error: error.message,
      });
  }
};

export const logoutUser = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";

  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Logout failed", error: error.message });
  }
};

export const sendOTP = async (req, res) => {
  const id = req.user._id;

  try {

    const user = await User.findById(id);

    if (user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Account already verified" 
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = Date.now() + 3 * 60 * 1000; //3 minutes

    user.verifyOtp = otp;
    user.verifyOtpExpiry = otpExpiry;
    const verifyUrl = "google.com";

    await user.save();

    const htmlMessage = sendOTPTemplate(user.name, otp, verifyUrl);
    sendEmail(user.email, "Verify Account", htmlMessage);
    console.log("Verification email sent");
     return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully" 
    });
  } catch (error) {
    console.log("Error in account verification:", error.message);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to send OTP", 
      error: error.message 
    });
  }
};


export const verifyUserAccount = async (req, res) => {
  const { otp } = req.body;
  const id = req.user._id;

  if (!id || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    if (user.verifyOtp !== otp || user.verifyOtp === "") {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();

    const htmlMessage = verifyAccountTemplate(user.name);
    sendEmail(user.email, "Welcome to RescueNet", htmlMessage);
    return res
      .status(200)
      .json({ success: true, message: "Account verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Verification failed",
        error: error.message,
      });
  }
};

export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "OTP sending failed,User not found" });
    }

    const passOtp = String(Math.floor(100000 + Math.random() * 900000));
    const passOtpExpiry = Date.now() + 3 * 60 * 1000; //3 minutes

    user.resetOtp = passOtp;
    user.resetOtpExpiry = passOtpExpiry;
    await user.save();

    const resetUrl = "google.com";

    const htmlMessage = sendResetOTPTemplate(user.name, passOtp, resetUrl);
    sendEmail(user.email, "Password Reset OTP", htmlMessage);
    return res
      .status(200)
      .json({ success: true, message: "Password reset OTP sent to email" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Password reset request failed",
        error: error.message,
      });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Email verification failed,Missing Details" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Email verification failed,User not found" });
    }

    if (user.resetOtp !== code || user.resetOtp === "") {
      return res.status(400).json({ success: false, message: "Email verification failed,Invalid OTP" });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Email verification failed,OTP Expired" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "OTP verification failed",
        error: error.message,
      });
  }
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password Reset failed,Missing Details" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Password Reset failed,User not found" });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.passwordHash = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiry = 0;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Password reset failed",
        error: error.message,
      });
  }
};

export const me = async (req, res) => {
  try {
    const user = req.user;

    let profile = null;

    if (user.role === "CITIZEN") {
      profile = await CitizenProfile.findOne({ userId: user._id });
    } else if (user.role === "VOLUNTEER") {
      profile = await VolunteerProfile.findOne({ userId: user._id });
    } else if (user.role === "NGO") {
      profile = await NgoProfile.findOne({ userId: user._id });
    }

    return res.status(200).json({ success: true, user, profile });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
