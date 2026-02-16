import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/authorizeMiddleware.js";
import { validateBody } from "../../middleware/validate.js";
import { citizenCreateSchema, citizenUpdateSchema } from "../../validators/userManagement.schema.js";
import { createCitizenProfile, getCitizenProfile, updateCitizenProfile, deleteCitizenProfile } from "../../controllers/userManagementController/citizenProfileController.js";

const citizenProfileRouter = Router();

citizenProfileRouter.post("/profile-create", protect, authorize("CITIZEN"), validateBody(citizenCreateSchema), createCitizenProfile);
citizenProfileRouter.get("/profile-get", protect, authorize("CITIZEN"), getCitizenProfile);
citizenProfileRouter.patch("/profile-update", protect, authorize("CITIZEN"), validateBody(citizenUpdateSchema), updateCitizenProfile);
citizenProfileRouter.delete("/profile-delete", protect, authorize("CITIZEN"), deleteCitizenProfile);

export default citizenProfileRouter;
