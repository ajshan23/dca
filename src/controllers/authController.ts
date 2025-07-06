import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/userModel";
import { AppError } from "../utils/errorHandler";

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const trimmedPassword = password.trim();

    if (!username?.trim() || !trimmedPassword) {
      throw new AppError("Username and password are required", 400);
    }

    const user = await User.findOne({ username }).select("+passwordHash");
    if (!user) throw new AppError("Invalid credentials", 401);

    console.log("Comparing:", trimmedPassword, "with", user.passwordHash);
    const isMatch = await bcrypt.compare(trimmedPassword, user.passwordHash);

    if (!isMatch) throw new AppError("Invalid credentials", 401);

    const token = jwt.sign({ id: user._id, role: user.role }, "SecretAn", {
      expiresIn: "10d",
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  }
}

export async function createUser(req: Request, res: Response) {
  try {
    if (!req.user) throw new AppError("Authentication required", 401);

    const currentUser = req.user;
    const { username, password, role = UserRole.USER } = req.body;

    if (!username || !password) {
      throw new AppError("Username and password are required", 400);
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    // Check permissions
    if (role === UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new AppError("Only super admin can create admin", 403);
    }

    if (role === UserRole.SUPER_ADMIN) {
      throw new AppError("Cannot create super admin via API", 403);
    }

    if (await User.isUsernameTaken(username)) {
      throw new AppError("Username is already taken", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      passwordHash: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
// authController.ts
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);

    const updateData: { username?: string; passwordHash?: string } = {};

    if (username && username !== user.username) {
      if (await User.isUsernameTaken(username)) {
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

    res.json({
      success: true,
      data: {
        id: updatedUser!._id,
        username: updatedUser!.username,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
