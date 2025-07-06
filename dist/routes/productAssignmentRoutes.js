"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productAssignmentController_1 = require("../controllers/productAssignmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const roleMiddleware_1 = require("../middlewares/roleMiddleware");
const userModel_1 = require("../models/userModel");
const router = express_1.default.Router();
router.post("/assign", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), productAssignmentController_1.assignProduct);
router.get("/product/:productId", authMiddleware_1.authenticateJWT, productAssignmentController_1.getAssignmentsByProduct);
router.post("/return/:assignmentId", authMiddleware_1.authenticateJWT, (0, roleMiddleware_1.authorizeRoles)(userModel_1.UserRole.ADMIN, userModel_1.UserRole.SUPER_ADMIN), productAssignmentController_1.returnProduct);
router.get("/active", authMiddleware_1.authenticateJWT, productAssignmentController_1.getActiveAssignments);
router.get("/history", authMiddleware_1.authenticateJWT, productAssignmentController_1.getAssignmentHistory);
exports.default = router;
//# sourceMappingURL=productAssignmentRoutes.js.map