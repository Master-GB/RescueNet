import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string().max(60).required(),
  lastName: Joi.string().max(60).required(),
  email: Joi.string().email().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).required(),
  password: Joi.string().min(8).max(64).required(),
  role: Joi.string().valid("ADMIN", "VOLUNTEER", "NGO", "CITIZEN").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const sendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyAccountSchema = Joi.object({
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

export const sendResetOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const verifyResetOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});
