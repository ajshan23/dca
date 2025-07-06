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
exports.login = login;
exports.createUser = createUser;
exports.updateUser = updateUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importStar(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
async function login(req, res) {
    try {
        const { username, password } = req.body;
        const trimmedPassword = password.trim();
        if (!username?.trim() || !trimmedPassword) {
            throw new errorHandler_1.AppError("Username and password are required", 400);
        }
        const user = await userModel_1.default.findOne({ username }).select("+passwordHash");
        if (!user)
            throw new errorHandler_1.AppError("Invalid credentials", 401);
        console.log("Comparing:", trimmedPassword, "with", user.passwordHash);
        const isMatch = await bcryptjs_1.default.compare(trimmedPassword, user.passwordHash);
        if (!isMatch)
            throw new errorHandler_1.AppError("Invalid credentials", 401);
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, "SecretAn", {
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
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        else {
            res.status(500).json({
                success: false,
                message: "Authentication error",
            });
        }
    }
}
async function createUser(req, res) {
    try {
        if (!req.user)
            throw new errorHandler_1.AppError("Authentication required", 401);
        const currentUser = req.user;
        const { username, password, role = userModel_1.UserRole.USER } = req.body;
        if (!username || !password) {
            throw new errorHandler_1.AppError("Username and password are required", 400);
        }
        if (password.length < 8) {
            throw new errorHandler_1.AppError("Password must be at least 8 characters", 400);
        }
        if (role === userModel_1.UserRole.ADMIN && currentUser.role !== userModel_1.UserRole.SUPER_ADMIN) {
            throw new errorHandler_1.AppError("Only super admin can create admin", 403);
        }
        if (role === userModel_1.UserRole.SUPER_ADMIN) {
            throw new errorHandler_1.AppError("Cannot create super admin via API", 403);
        }
        if (await userModel_1.default.isUsernameTaken(username)) {
            throw new errorHandler_1.AppError("Username is already taken", 409);
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await userModel_1.default.create({
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
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        else {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const user = await userModel_1.default.findById(id);
        if (!user)
            throw new errorHandler_1.AppError("User not found", 404);
        const updateData = {};
        if (username && username !== user.username) {
            if (await userModel_1.default.isUsernameTaken(username)) {
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
        res.json({
            success: true,
            data: {
                id: updatedUser._id,
                username: updatedUser.username,
            },
        });
    }
    catch (error) {
        if (error instanceof errorHandler_1.AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
            });
        }
        else {
            console.error(error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
//# sourceMappingURL=authController.js.map