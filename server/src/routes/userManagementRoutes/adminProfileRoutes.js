import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/authorizeMiddleware.js";
import { validateBody } from "../../middleware/validate.js";
import { adminUpdateSchema } from "../../validators/userManagement.schema.js";
import {
  deleteAdminProfile,
  getAdminProfile,
  updateAdminProfile,
} from "../../controllers/userManagementController/adminProfileController.js";

const adminProfileRouter = Router();

adminProfileRouter.get("/profile-get", protect, authorize("ADMIN"), getAdminProfile);
adminProfileRouter.patch(
  "/profile-update",
  protect,
  authorize("ADMIN"),
  validateBody(adminUpdateSchema),
  updateAdminProfile,
);
adminProfileRouter.delete("/profile-delete", protect, authorize("ADMIN"), deleteAdminProfile);

export default adminProfileRouter;
