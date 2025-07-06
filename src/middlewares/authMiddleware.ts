import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/userModel";
import { AppError } from "../utils/errorHandler";
import config from "../config";
import { Types } from "mongoose";

export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("no token");
      throw new AppError("Authentication required", 401);
    }

    const decoded = jwt.verify(token, "SecretAn") as {
      id: string;
      role: string;
    };

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Set the user object with consistent typing
    req.user = {
     userId: (user._id as Types.ObjectId).toString(),
      role: user.role as UserRole, // Ensure proper typing
      username: user.username, // Optional if you need it
    };

    next();
  } catch (error) {
    next(new AppError("Invalid or expired token", 401));
  }
}
