import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { hashPassword, comparePassword } from "../services/passwordService.js";
import { setAuthCookie } from "../utils/setAuthCookie.js";

const signToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

export const registerUser = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password || !role) {
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
      firstName,
      lastName,
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

export const me = async (req, res) => {
  res.json({ success:true, user: req.user }); // req.user set by auth middleware
};
