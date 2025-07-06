import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel";
import config from "../config";
import { UserRole } from "../models/userModel";

// Super Admin data
const superAdminData = {
  username: "superadmin",
  password: "SuperAdmin@123", // Change this to a strong password
  role: UserRole.SUPER_ADMIN,
};

export async function seedSuperAdmin() {
  try {
    // Connect to MongoDB

    console.log("Connected to MongoDB for seeding...");

    // Check if super admin already exists
    const existingAdmin = await User.findOne({
      username: superAdminData.username,
    });
    if (existingAdmin) {
      console.log("Super admin already exists in the database");
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(superAdminData.password, salt);

    // Create super admin
    const superAdmin = await User.create({
      username: superAdminData.username,
      passwordHash: hashedPassword,
      role: superAdminData.role,
    });

    console.log("Super admin created successfully:", {
      id: superAdmin._id,
      username: superAdmin.username,
      role: superAdmin.role,
    });

    // await mongoose.disconnect();
    // console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding super admin:", error);
    process.exit(1);
  }
}
