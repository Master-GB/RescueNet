import { Router } from "express";
import { loginUser, registerUser, logoutUser, resetPassword, verifyResetOtp, sendResetOtp, verifyUserAccount, sendOTP, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { registerSchema, loginSchema, sendOTPSchema, verifyAccountSchema, sendResetOTPSchema, verifyResetOTPSchema, resetPasswordSchema,} from "../validators/auth.schema.js";

const authRouter = Router();

authRouter.post("/register",validateBody(registerSchema), registerUser);
authRouter.post("/login", validateBody(loginSchema), loginUser);
authRouter.post("/logout", logoutUser);
authRouter.post('/send-otp', validateBody(sendOTPSchema), protect,sendOTP);
authRouter.post('/verify-account', validateBody(verifyAccountSchema), protect,verifyUserAccount);
authRouter.post('/send-reset-otp', validateBody(sendResetOTPSchema), sendResetOtp);
authRouter.post('/verify-reset-otp', validateBody(verifyResetOTPSchema), verifyResetOtp);
authRouter.post('/reset-password',  validateBody(resetPasswordSchema), resetPassword);
authRouter.get("/me", protect, me);

export default authRouter;
