"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = seedSuperAdmin;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/userModel"));
const userModel_2 = require("../models/userModel");
const superAdminData = {
    username: "superadmin",
    password: "SuperAdmin@123",
    role: userModel_2.UserRole.SUPER_ADMIN,
};
async function seedSuperAdmin() {
    try {
        console.log("Connected to MongoDB for seeding...");
        const existingAdmin = await userModel_1.default.findOne({
            username: superAdminData.username,
        });
        if (existingAdmin) {
            console.log("Super admin already exists in the database");
            await mongoose_1.default.disconnect();
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(superAdminData.password, salt);
        const superAdmin = await userModel_1.default.create({
            username: superAdminData.username,
            passwordHash: hashedPassword,
            role: superAdminData.role,
        });
        console.log("Super admin created successfully:", {
            id: superAdmin._id,
            username: superAdmin.username,
            role: superAdmin.role,
        });
    }
    catch (error) {
        console.error("Error seeding super admin:", error);
        process.exit(1);
    }
}
//# sourceMappingURL=superAdminSeeder.js.map