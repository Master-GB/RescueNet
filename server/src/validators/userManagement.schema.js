import Joi from "joi";

export const citizenCreateSchema = Joi.object({
  phone: Joi.string().max(20).required().pattern(/^\+?[0-9\s\-]+$/),
 address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    province: Joi.string().required(),
  }).required(),
  location: Joi.string().max(60).optional(),
  emergencyContactName: Joi.string().max(80).required(),
  emergencyContactPhone: Joi.string().max(20).required(),
  savedShelters: Joi.array().items(Joi.string()).optional(),
});

export const citizenUpdateSchema = citizenCreateSchema;

export const volunteerCreateSchema = Joi.object({
  phone: Joi.string().max(20).required().pattern(/^\+?[0-9\s\-]+$/),
  skills: Joi.array().items(Joi.string()).default([]),
  serviceDistricts: Joi.array().items(Joi.string()).default([]),
  availabilityStatus: Joi.string().valid("AVAILABLE", "BUSY", "OFFLINE").optional(),
});

export const volunteerUpdateSchema = Joi.object({
  skills: Joi.array().items(Joi.string()).optional(),
  serviceDistricts: Joi.array().items(Joi.string()).optional(),
});

export const volunteerStatusSchema = Joi.object({
  availabilityStatus: Joi.string().valid("AVAILABLE", "BUSY", "OFFLINE").required(),
});

export const ngoCreateSchema = Joi.object({
  registrationNumber: Joi.string().max(60).required(),
  contactPhone: Joi.string().max(20).required(),
  serviceDistricts: Joi.array().items(Joi.string).default([]),
  services: Joi.array().items(Joi.string()).default([]),
  availabilityStatus: Joi.string().valid("AVAILABLE", "BUSY", "OFFLINE").optional(),
});

export const ngoUpdateSchema = Joi.object({
  registrationNumber: Joi.string().max(60).optional(),
  contactPhone: Joi.string().max(20).optional(),
   serviceDistricts: Joi.array().items(Joi.string).default([]),
  services: Joi.array().items(Joi.string()).optional(),
  availabilityStatus: Joi.string().valid("AVAILABLE", "BUSY", "OFFLINE").optional(),
});

export const NgoStatusSchema = Joi.object({
  availabilityStatus: Joi.string().valid("AVAILABLE", "BUSY", "OFFLINE").required(),
});
