"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = getAllUsers;
exports.getCurrentUser = getCurrentUser;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.updateUserRole = updateUserRole;
exports.deleteUser = deleteUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importStar(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
async function getAllUsers(_req, res) {
    try {
        const users = await userModel_1.default.find({}, { passwordHash: 0 });
        res.json({ success: true, data: users });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch users", 500);
    }
}
async function getCurrentUser(req, res) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError("User not authenticated", 401);
        const user = await userModel_1.default.findById(req.user.userId, { passwordHash: 0 });
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function getUserById(req, res) {
    try {
        const user = await userModel_1.default.findById(req.params.id, { passwordHash: 0 });
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        res.json({ success: true, data: user });
    }
    catch (error) {
        throw error;
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        if (req.user?.userId !== id &&
            req.user?.role !== userModel_1.UserRole.ADMIN &&
            req.user?.role !== userModel_1.UserRole.SUPER_ADMIN) {
            throw new errorHandler_1.AppError("You can only update your own profile", 403);
        }
        const user = await userModel_1.default.findById(id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        const updateData = {};
        if (username) {
            if (username !== user.username &&
                (await userModel_1.default.isUsernameTaken(username))) {
                throw new errorHandler_1.AppError("Username already taken", 409);
            }
            updateData.username = username;
        }
        if (password) {
            updateData.passwordHash = await bcryptjs_1.default.hash(password, 12);
        }
        const updatedUser = await userModel_1.default.findByIdAndUpdate(id, updateData, {
            new: true,
            select: "-passwordHash",
        });
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        throw error;
    }
}
async function updateUserRole(req, res) {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await userModel_1.default.findById(id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        if (user.role === userModel_1.UserRole.SUPER_ADMIN) {
            throw new errorHandler_1.AppError("Cannot modify super admin role", 403);
        }
        const updatedUser = await userModel_1.default.findByIdAndUpdate(id, { role }, { new: true, select: "-passwordHash" });
        res.json({
            success: true,
            data: { id: updatedUser._id, role: updatedUser.role },
        });
    }
    catch (error) {
        throw error;
    }
}
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await userModel_1.default.findById(id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        if (user.role === userModel_1.UserRole.SUPER_ADMIN) {
            throw new errorHandler_1.AppError("Cannot delete super admin", 403);
        }
        await user.deleteOne();
        res.json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=userController.js.map