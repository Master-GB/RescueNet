import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/authorizeMiddleware.js";
import { validateBody } from "../../middleware/validate.js";
import { volunteerCreateSchema, volunteerUpdateSchema, volunteerStatusSchema} from "../../validators/userManagement.schema.js";
import {
  createVolunteerProfile,
  getVolunteerProfile,
  updateVolunteerProfile,
  updateAvailabilityStatus,
  deleteVolunteerProfile
} from "../../controllers/userManagementController/volunteerProfileController.js";

const volunteerProfileRouter = Router();

volunteerProfileRouter.post("/profile-create", protect, authorize("VOLUNTEER"), validateBody(volunteerCreateSchema), createVolunteerProfile);
volunteerProfileRouter.get("/profile-get", protect, authorize("VOLUNTEER"), getVolunteerProfile);
volunteerProfileRouter.patch("/profile-update", protect, authorize("VOLUNTEER"), validateBody(volunteerUpdateSchema), updateVolunteerProfile);
volunteerProfileRouter.patch("/profile/status-update", protect, authorize("VOLUNTEER"), validateBody(volunteerStatusSchema), updateAvailabilityStatus);
volunteerProfileRouter.delete("/profile-delete", protect, authorize("VOLUNTEER"), deleteVolunteerProfile);

export default volunteerProfileRouter;
