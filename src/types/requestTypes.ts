import { UserRole } from "../models/userModel";

export interface CreateBranchRequest {
  name: string;
}

export interface UpdateBranchRequest {
  name?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role?: UserRole;
}