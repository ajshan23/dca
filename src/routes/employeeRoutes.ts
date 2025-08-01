import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { UserRole } from "../models/userModel";

const router = express.Router();

router.post(
  "/",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  createEmployee
);

router.get("/", authenticateJWT, getAllEmployees);
router.get("/:id", authenticateJWT, getEmployeeById);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  updateEmployee
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  deleteEmployee
);

export default router;
