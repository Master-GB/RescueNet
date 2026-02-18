//Rate limit only the third-party proxy routes
import rateLimit from "express-rate-limit";

export const thirdPartyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // 60 req/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});
