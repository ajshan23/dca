"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignProduct = assignProduct;
exports.returnProduct = returnProduct;
exports.getActiveAssignments = getActiveAssignments;
exports.getAssignmentHistory = getAssignmentHistory;
exports.getAssignmentsByProduct = getAssignmentsByProduct;
const productAssignmentModel_1 = __importDefault(require("../models/productAssignmentModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const errorHandler_1 = require("../utils/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
const employeeModel_1 = __importDefault(require("../models/employeeModel"));
const mongoose_2 = require("mongoose");
async function assignProduct(req, res) {
    try {
        const { productId, employeeId, quantity, expectedReturnAt, notes } = req.body;
        const assignedBy = req.user?.userId;
        console.log("Request body:", req.body);
        const productObjectId = new mongoose_2.Types.ObjectId(productId);
        const employeeObjectId = new mongoose_2.Types.ObjectId(employeeId);
        const productDoc = await productModel_1.default.findById(productObjectId);
        if (!productDoc) {
            console.error(`Product not found with ID: ${productId}`);
            throw new errorHandler_1.AppError("Product not found", 404);
        }
        const employeeExists = await employeeModel_1.default.exists({ _id: employeeObjectId });
        if (!employeeExists) {
            throw new errorHandler_1.AppError("Employee not found", 404);
        }
        if (productDoc.availableStock < quantity) {
            throw new errorHandler_1.AppError("Insufficient stock available", 400);
        }
        const assignment = await productAssignmentModel_1.default.create({
            product: productObjectId,
            employee: employeeObjectId,
            assignedBy,
            quantity,
            expectedReturnAt,
            notes,
            status: "assigned",
        });
        productDoc.availableStock -= quantity;
        await productDoc.save();
        res.status(201).json({
            success: true,
            data: {
                id: assignment._id,
                productId: productObjectId,
                employeeId: employeeObjectId,
                assignedBy,
                quantity,
                assignedAt: assignment.assignedAt,
                status: "assigned",
            },
        });
    }
    catch (error) {
        console.error("Assignment error:", error);
        if (error instanceof errorHandler_1.AppError) {
            throw error;
        }
        throw new errorHandler_1.AppError("Failed to assign product", 500);
    }
}
async function returnProduct(req, res) {
    try {
        const { assignmentId } = req.params;
        const { condition, notes } = req.body;
        const assignment = await productAssignmentModel_1.default.findById(assignmentId);
        if (!assignment) {
            throw new errorHandler_1.AppError("Assignment not found", 404);
        }
        if (assignment.status === "returned") {
            throw new errorHandler_1.AppError("Product already returned", 400);
        }
        assignment.status = "returned";
        assignment.returnedAt = new Date();
        assignment.condition = condition;
        assignment.notes = notes;
        await assignment.save();
        const product = await productModel_1.default.findById(assignment.product);
        if (product) {
            product.availableStock += assignment.quantity;
            await product.save();
        }
        res.json({
            success: true,
            data: {
                id: assignment._id,
                status: "returned",
                returnedAt: assignment.returnedAt,
            },
        });
    }
    catch (error) {
        throw error;
    }
}
async function getActiveAssignments(_req, res) {
    try {
        const assignments = (await productAssignmentModel_1.default.find({ status: "assigned" })
            .populate("product", "name model serialNumber")
            .populate("employee", "name empId")
            .populate("assignedBy", "username")
            .lean());
        const transformed = assignments.map((a) => ({
            id: a._id.toString(),
            product: {
                id: a.product._id.toString(),
                name: a.product.name,
                model: a.product.model,
                serialNumber: a.product.serialNumber,
            },
            employee: {
                id: a.employee._id.toString(),
                name: a.employee.name,
                empId: a.employee.empId,
            },
            assignedBy: a.assignedBy.username,
            quantity: a.quantity,
            assignedAt: a.assignedAt,
            expectedReturnAt: a.expectedReturnAt,
            status: a.status,
        }));
        res.json({ success: true, data: transformed });
    }
    catch (error) {
        throw new errorHandler_1.AppError(error instanceof Error ? error.message : "Failed to fetch assignments", 500);
    }
}
async function getAssignmentHistory(req, res) {
    try {
        const { productId, status, fromDate, toDate } = req.query;
        const filter = {};
        if (productId)
            filter.product = productId;
        if (status)
            filter.status = status;
        if (fromDate || toDate) {
            filter.assignedAt = {};
            if (fromDate)
                filter.assignedAt.$gte = new Date(fromDate);
            if (toDate)
                filter.assignedAt.$lte = new Date(toDate);
        }
        const assignments = (await productAssignmentModel_1.default.find(filter)
            .populate("product", "name")
            .populate("employee", "name")
            .sort({ assignedAt: -1 })
            .lean());
        const transformed = assignments.map((a) => ({
            id: a._id.toString(),
            product: {
                id: a.product._id.toString(),
                name: a.product.name,
            },
            employee: {
                id: a.employee._id.toString(),
                name: a.employee.name,
            },
            quantity: a.quantity,
            assignedAt: a.assignedAt,
            returnedAt: a.returnedAt,
            status: a.status,
            condition: a.condition,
        }));
        res.json({
            success: true,
            data: transformed,
        });
    }
    catch (error) {
        console.error("Error fetching assignment history:", error);
        throw new errorHandler_1.AppError(error instanceof Error
            ? error.message
            : "Failed to fetch assignment history", 500);
    }
}
async function getAssignmentsByProduct(req, res) {
    try {
        const { productId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            throw new errorHandler_1.AppError("Invalid product ID", 400);
        }
        const assignments = (await productAssignmentModel_1.default.find({ product: productId })
            .populate("product", "name model serialNumber")
            .populate("employee", "name empId")
            .populate("assignedBy", "username")
            .sort({ assignedAt: -1 })
            .lean());
        const transformed = assignments.map((a) => ({
            id: a._id.toString(),
            product: {
                id: a.product._id.toString(),
                name: a.product.name,
                model: a.product.model,
                serialNumber: a.product.serialNumber,
            },
            employee: {
                id: a.employee._id.toString(),
                name: a.employee.name,
                empId: a.employee.empId,
            },
            assignedBy: a.assignedBy?.username,
            quantity: a.quantity,
            assignedAt: a.assignedAt,
            returnedAt: a.returnedAt,
            expectedReturnAt: a.expectedReturnAt,
            status: a.status,
            condition: a.condition,
            notes: a.notes,
        }));
        res.json({
            success: true,
            data: transformed,
        });
    }
    catch (error) {
        console.error("Error fetching product assignments:", error);
        throw new errorHandler_1.AppError(error instanceof Error
            ? error.message
            : "Failed to fetch product assignments", 500);
    }
}
//# sourceMappingURL=productAssignmentController.js.map