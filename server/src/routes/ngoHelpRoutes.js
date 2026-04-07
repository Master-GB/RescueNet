import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { declineTaskSchema } from "../validators/ngoHelp.schema.js";
import {
  getMyTasks,
  getPerformance,
  getTaskDetail,
  acceptTask,
  declineTask,
  markInProgress,
  markCompleted,
} from "../controllers/ngoHelpController.js";

const router = express.Router();

// All routes require a valid JWT and NGO role
router.use(protect);
router.use(authorize("NGO"));

// Static route must be registered before /:requestId to avoid Express
// treating the literal string "performance" as an ObjectId param
router.get("/performance", getPerformance);

router.get("/", getMyTasks);
router.get("/:requestId", getTaskDetail);

router.patch("/:requestId/accept", acceptTask);
router.patch("/:requestId/decline", validateBody(declineTaskSchema), declineTask);
router.patch("/:requestId/in-progress", markInProgress);
router.patch("/:requestId/complete", markCompleted);

export default router;
