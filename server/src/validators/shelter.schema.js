import Joi from "joi";

const disasterTypes = [
  "FLOOD",
  "LANDSLIDE",
  "TSUNAMI",
  "FIRE",
  "CYCLONE",
  "OTHER",
];
const statusEnum = ["OPEN", "FULL", "CLOSED"];
const shelterType = [
  "SCHOOL",
  "TEMPLE",
  "COMMUNITY_HALL",
  "STADIUM",
  "GOVERNMENT_BUILDING",
  "OTHER",
];

export const shelterCreateSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  description: Joi.string().max(2000).allow("").optional(),
  shelterType: Joi.string()
    .valid(...shelterType)
    .default("OTHER")
    .optional(),

  address: Joi.object({
    street: Joi.string().max(200).allow("").optional(),
    city: Joi.string().max(80).required(),
    province: Joi.string().max(80).required(),
    postalCode: Joi.string().max(20).allow("").required(),
  }).required(),

  image: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().max(200).allow("").optional(),
      }),
    )
    .optional(),

  contact: Joi.object({
    phone: Joi.string()
      .max(30)
      .allow("")
      .pattern(/^\+?[0-9\s\-]+$/)
      .required(),
    email: Joi.string()
      .email()
      .allow("")
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .optional(),
  }).required(),

  location: Joi.object({
    type: Joi.string().valid("Point").default("Point").optional(),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).required(),

  capacity: Joi.object({
    total: Joi.number().min(1).required(),
  }).required(),

  occupancy: Joi.object({
    current: Joi.number().min(0).default(0),
  }).optional(),

  supports: Joi.object({
    disasterTypes: Joi.array()
      .items(Joi.string().valid(...disasterTypes))
      .required(),
    wheelchairAccess: Joi.boolean().default(false),
    medical: Joi.boolean().default(false),
    food: Joi.boolean().default(false),
    water: Joi.boolean().default(false),
    power: Joi.boolean().default(false),
  }).required(),

  specialSupport: Joi.object({
    elderlySupport: Joi.boolean().default(false),
    disabilitySupport: Joi.boolean().default(false),
    pregnancySupport: Joi.boolean().default(false),
    petFriendly: Joi.boolean().default(false),
    childFriendly: Joi.boolean().default(false),
  }).optional(),

  status: Joi.string()
    .valid(...statusEnum)
    .optional(),
  verified: Joi.boolean().optional(),
});

export const shelterUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  description: Joi.string().max(2000).allow("").optional(),
  shelterType: Joi.string()
    .valid(...shelterType)
    .optional(),

  address: Joi.object({
    street: Joi.string().max(200).allow("").optional(),
    city: Joi.string().max(80).optional(),
    province: Joi.string().max(80).optional(),
    postalCode: Joi.string().max(20).allow("").optional(),
  }).optional(),

  contact: Joi.object({
    phone: Joi.string()
      .max(30)
      .allow("")
      .pattern(/^\+?[0-9\s\-]+$/)
      .optional(),
    email: Joi.string()
      .email()
      .allow("")
      .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .optional(),
  }).optional(),

  location: Joi.object({
    coordinates: Joi.array().items(Joi.number()).length(2).optional(),
  }).optional(),

  capacity: Joi.object({
    total: Joi.number().min(1).optional(),
  }).optional(),

  occupancy: Joi.object({
    current: Joi.number().min(0).optional(),
  }).optional(),

  supports: Joi.object({
    disasterTypes: Joi.array()
      .items(Joi.string().valid(...disasterTypes))
      .optional(),
    wheelchairAccess: Joi.boolean().optional(),
    medical: Joi.boolean().optional(),
    food: Joi.boolean().optional(),
    water: Joi.boolean().optional(),
    power: Joi.boolean().optional(),
    petFriendly: Joi.boolean().optional(),
    childFriendly: Joi.boolean().optional(),
  }).optional(),

  specialSupport: Joi.object({
    elderlySupport: Joi.boolean().optional(),
    disabilitySupport: Joi.boolean().optional(),
    pregnancySupport: Joi.boolean().optional(),
    petFriendly: Joi.boolean().optional(),
    childFriendly: Joi.boolean().optional(),
  }).optional(),

  status: Joi.string().valid("OPEN", "FULL", "CLOSED").optional(),
  verified: Joi.boolean().optional(),
}).min(1);
