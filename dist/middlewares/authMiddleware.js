"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const errorHandler_1 = require("../utils/errorHandler");
async function authenticateJWT(req, _res, next) {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            console.log("no token");
            throw new errorHandler_1.AppError("Authentication required", 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, "SecretAn");
        const user = await userModel_1.default.findById(decoded.id);
        if (!user) {
            throw new errorHandler_1.AppError("User not found", 404);
        }
        req.user = {
            userId: user._id.toString(),
            role: user.role,
            username: user.username,
        };
        next();
    }
    catch (error) {
        next(new errorHandler_1.AppError("Invalid or expired token", 401));
    }
}
//# sourceMappingURL=authMiddleware.js.map