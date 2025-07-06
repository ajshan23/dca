import express from "express";
import { createUser, login, updateUser } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import { UserRole } from "../models/userModel";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
} from "../validations/authValidations";

const router = express.Router();

router.post(
  "/login",
  //  validateRequest(loginSchema),
  login
);
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  // validateRequest(createUserSchema),
  createUser
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  // validateRequest(updateUserSchema),
  updateUser
);

export default router;
