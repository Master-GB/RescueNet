import { Router } from "express";
import { loginUser, registerUser, logoutUser, resetPassword, verifyResetOtp, sendResetOtp, verifyUserAccount, sendOTP, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post('/send-otp',protect,sendOTP);
authRouter.post('/verify-account',protect,verifyUserAccount);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/verify-reset-otp',verifyResetOtp);
authRouter.post('/reset-password',resetPassword);
authRouter.get("/me", protect, me);

export default authRouter;
