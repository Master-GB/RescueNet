import express from "express";
import { thirdPartyLimiter } from "../middleware/rateLimitThirdParty.js";
import { disastersMap, disastersHeatmap, disasterUpdates } from "../controllers/disastersController.js";

const disastersRoutes = express.Router();

// rate limit to protect external services
disastersRoutes.use(thirdPartyLimiter);


disastersRoutes.get("/map", disastersMap);
disastersRoutes.get("/heatmap", disastersHeatmap);
disastersRoutes.get("/updates", disasterUpdates);

export default disastersRoutes;
