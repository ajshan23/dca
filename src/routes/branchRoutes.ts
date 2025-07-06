import express from "express";
import {
  createBranch,
  getAllBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} from "../controllers/branchController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { UserRole } from "../models/userModel";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  createBranchSchema,
  updateBranchSchema,
} from "../validations/branchValidations";

const router = express.Router();

router.post(
  "/",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),

  createBranch
);

router.get("/", getAllBranches);
router.get("/:id", getBranchById);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateBranchSchema),
  updateBranch
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteBranch
);

export default router;
