import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/authorizeMiddleware.js";
import { verifyVolunteer, verifyNgo, deleteUserAccount } from "../../controllers/userManagementController/adminUserController.js";

const AdminUserRouter = Router();

AdminUserRouter.patch("/verify-volunteer/:userId", protect, authorize("ADMIN"), verifyVolunteer);
AdminUserRouter.patch("/verify-ngo/:userId", protect, authorize("ADMIN"), verifyNgo);
AdminUserRouter.delete("/delete-user/:userId", protect, authorize("ADMIN"), deleteUserAccount);

export default AdminUserRouter;
