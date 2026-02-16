export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true, // removes unexpected fields
  });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  req.body = value;
  next();
};
