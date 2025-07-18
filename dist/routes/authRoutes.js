"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const userModel_1 = require("../models/userModel");
const router = express_1.default.Router();
router.post("/login", authController_1.login);
router.post("/", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), authController_1.createUser);
router.put("/:id", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), authController_1.updateUser);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map