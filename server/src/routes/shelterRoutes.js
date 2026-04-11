import express from "express";
import {
  createShelter,
  getShelterById,
  listShelters,
  listSheltersWithVerification,
  nearbyShelters,
  updateShelter,
  deleteShelter,
} from "../controllers/shelterController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizeMiddleware.js";
import { validateBody } from "../middleware/validate.js";
import { shelterCreateSchema, shelterUpdateSchema } from "../validators/shelter.schema.js";

const shelterRouter = express.Router();

shelterRouter.get("/get-list", listShelters);
shelterRouter.get("/get-list-verified", listSheltersWithVerification);
shelterRouter.get("/get-nearby", nearbyShelters);
shelterRouter.get("/get/:id", getShelterById);


shelterRouter.post("/create",protect,authorize("ADMIN", "VOLUNTEER","NGO"),validateBody(shelterCreateSchema),createShelter);

shelterRouter.patch("/update/:id",protect,authorize("ADMIN", "VOLUNTEER","NGO"),validateBody(shelterUpdateSchema),updateShelter);

shelterRouter.delete("/delete/:id",protect, authorize("ADMIN"), deleteShelter);

export default shelterRouter;
