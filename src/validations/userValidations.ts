// userValidations.ts
import * as yup from "yup";
import { UserRole } from "../models/userModel";

export const updateUserSchema = yup.object({
  username: yup.string().min(3).max(50),
  password: yup.string().min(8),
});

export const updateRoleSchema = yup.object({
  role: yup.string().oneOf(Object.values(UserRole)).required(),
});
