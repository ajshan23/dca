import { Document } from "mongoose";
import { UserRole } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string; // or mongoose.Types.ObjectId if you prefer
        role: UserRole;
        username?: string; // optional if you need it
      };
    }
  }
}
