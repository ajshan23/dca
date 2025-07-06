import express from "express";
import {
  assignProduct,
  returnProduct,
  getActiveAssignments,
  getAssignmentHistory,
  getAssignmentsByProduct,
} from "../controllers/productAssignmentController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { UserRole } from "../models/userModel";

const router = express.Router();

router.post(
  "/assign",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  assignProduct
);
router.get("/product/:productId", authenticateJWT, getAssignmentsByProduct);
router.post(
  "/return/:assignmentId",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  returnProduct
);

router.get("/active", authenticateJWT, getActiveAssignments);

router.get("/history", authenticateJWT, getAssignmentHistory);

export default router;
