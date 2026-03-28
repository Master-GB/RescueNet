import express from "express";
import { thirdPartyLimiter } from "../middleware/rateLimitThirdParty.js";
import { route, geocodeAddress, reverseAddress } from "../controllers/geoController.js";

const geoRouter = express.Router();

// rate limit to protect external services
geoRouter.use(thirdPartyLimiter);

geoRouter.get("/route", route);
geoRouter.get("/geocode", geocodeAddress);
geoRouter.get("/reverse", reverseAddress);

export default geoRouter;
