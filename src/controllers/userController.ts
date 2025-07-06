import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { UserRole } from "../models/userModel";
import { AppError } from "../utils/errorHandler";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await User.find({}, { passwordHash: 0 });
    res.json({ success: true, data: users });
  } catch (error) {
    throw new AppError("Failed to fetch users", 500);
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    const user = await User.findById(req.user.userId, { passwordHash: 0 });
    if (!user) throw new AppError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const user = await User.findById(req.params.id, { passwordHash: 0 });
    if (!user) throw new AppError("User not found", 404);

    res.json({ success: true, data: user });
  } catch (error) {
    throw error;
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    // Ensure users can only update their own profile unless they're admin
    if (
      req.user?.userId !== id &&
      req.user?.role !== UserRole.ADMIN &&
      req.user?.role !== UserRole.SUPER_ADMIN
    ) {
      throw new AppError("You can only update your own profile", 403);
    }

    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);

    const updateData: { username?: string; passwordHash?: string } = {};

    if (username) {
      if (
        username !== user.username &&
        (await User.isUsernameTaken(username))
      ) {
        throw new AppError("Username already taken", 409);
      }
      updateData.username = username;
    }

    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-passwordHash",
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    throw error;
  }
}

export async function updateUserRole(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);

    // Prevent modifying super admins
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot modify super admin role", 403);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: "-passwordHash" }
    );

    res.json({
      success: true,
      data: { id: updatedUser!._id, role: updatedUser!.role },
    });
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) throw new AppError("User not found", 404);

    // Prevent deleting super admins
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot delete super admin", 403);
    }

    await user.deleteOne();
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    throw error;
  }
}
