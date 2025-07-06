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
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const userModel_1 = __importStar(require("../models/userModel"));
const validationMiddleware_1 = require("../middlewares/validationMiddleware");
const userValidations_1 = require("../validations/userValidations");
const router = express_1.default.Router();
router.get("/me", authMiddleware_1.authenticateJWT, userController_1.getCurrentUser);
router.get("/", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), userController_1.getAllUsers);
router.get("/check-username", async (req, res) => {
    const { username } = req.query;
    const available = !(await userModel_1.default.isUsernameTaken(username));
    res.json({ available });
});
router.get("/:id", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), userController_1.getUserById);
router.patch("/:id", authMiddleware_1.authenticateJWT, (0, validationMiddleware_1.validateRequest)(userValidations_1.updateUserSchema), userController_1.updateUser);
router.patch("/:id/role", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.SUPER_ADMIN), (0, validationMiddleware_1.validateRequest)(userValidations_1.updateRoleSchema), userController_1.updateUserRole);
router.delete("/:id", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.SUPER_ADMIN), userController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=userRoutes.js.map