import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  getCurrentUser,
} from "../controllers/userController";
import { authenticateJWT } from "../middlewares/authMiddleware";
import { authorizeRoles } from "../middlewares/roleMiddleware";
import User, { UserRole } from "../models/userModel";
import { validateRequest } from "../middlewares/validationMiddleware";
import {
  updateUserSchema,
  updateRoleSchema,
} from "../validations/userValidations";

const router = express.Router();

// Get current user profile (for any authenticated user)
router.get("/me", authenticateJWT, getCurrentUser);

// Admin-only routes
router.get(
  "/",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getAllUsers
);

router.get("/check-username", async (req, res) => {
  const { username } = req.query;
  const available = !(await User.isUsernameTaken(username as string));
  res.json({ available });
});

router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getUserById
);

// User can update their own profile
router.patch(
  "/:id",
  authenticateJWT,
  validateRequest(updateUserSchema),
  updateUser
);

// Only super admin can change roles
router.patch(
  "/:id/role",
  authenticateJWT,
  authorizeRoles(UserRole.SUPER_ADMIN),
  validateRequest(updateRoleSchema),
  updateUserRole
);

// Only super admin can delete users
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(UserRole.SUPER_ADMIN),
  deleteUser
);

export default router;
