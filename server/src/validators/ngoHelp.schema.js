import Joi from "joi";

export const declineTaskSchema = Joi.object({
  reason: Joi.string().max(500).optional(),
});
