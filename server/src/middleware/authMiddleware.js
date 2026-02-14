import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Middleware to verify JWT token from cookies
 * Attaches user info to req.user if valid
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user from database
    const user = await User.findById(decoded.sub).select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    if (!user.isAccountVerified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified. Please verify your account first.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Authentication error",
      error: error.message,
    });
  }
};
