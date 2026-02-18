import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/authorizeMiddleware.js";
import { validateBody } from "../../middleware/validate.js";
import { ngoCreateSchema, ngoUpdateSchema, NgoStatusSchema } from "../../validators/userManagement.schema.js";
import { createNgoProfile, getNgoProfile, updateNgoProfile,deleteNgoProfile, updateAvailabilityStatus } from "../../controllers/userManagementController/ngoProfileController.js";

const ngoProfileRouter = Router();

ngoProfileRouter.post("/profile-create", protect, authorize("NGO"), validateBody(ngoCreateSchema), createNgoProfile);
ngoProfileRouter.get("/profile-get", protect, authorize("NGO"), getNgoProfile);
ngoProfileRouter.patch("/profile-update", protect, authorize("NGO"), validateBody(ngoUpdateSchema), updateNgoProfile);
ngoProfileRouter.patch("/profile/status-update", protect, authorize("NGO"), validateBody(NgoStatusSchema), updateAvailabilityStatus);
ngoProfileRouter.delete("/profile-delete", protect, authorize("NGO"),deleteNgoProfile);

export default ngoProfileRouter;
