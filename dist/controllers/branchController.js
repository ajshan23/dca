"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBranch = createBranch;
exports.getAllBranches = getAllBranches;
exports.getBranchById = getBranchById;
exports.updateBranch = updateBranch;
exports.deleteBranch = deleteBranch;
const branchModel_1 = __importDefault(require("../models/branchModel"));
const errorHandler_1 = require("../utils/errorHandler");
const productModel_1 = __importDefault(require("../models/productModel"));
async function createBranch(req, res) {
    try {
        const { name } = req.body;
        if (await branchModel_1.default.isNameTaken(name)) {
            throw new errorHandler_1.AppError("Branch name is already taken", 409);
        }
        const branch = await branchModel_1.default.create({ name });
        res.status(201).json({
            success: true,
            data: branch,
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
async function getAllBranches(_req, res) {
    try {
        const branches = await branchModel_1.default.find();
        res.json({ success: true, data: branches });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch branches", 500);
    }
}
async function getBranchById(req, res) {
    try {
        const branch = await branchModel_1.default.findById(req.params.id);
        if (!branch)
            throw new errorHandler_1.AppError("Branch not found", 404);
        res.json({ success: true, data: branch });
    }
    catch (error) {
        throw error;
    }
}
async function updateBranch(req, res) {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const branch = await branchModel_1.default.findById(id);
        if (!branch)
            throw new errorHandler_1.AppError("Branch not found", 404);
        if (name && name !== branch.name) {
            if (await branchModel_1.default.isNameTaken(name)) {
                throw new errorHandler_1.AppError("Branch name is already taken", 409);
            }
            branch.name = name;
        }
        await branch.save();
        res.json({ success: true, data: branch });
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
async function deleteBranch(req, res) {
    try {
        const { id } = req.params;
        const branch = await branchModel_1.default.findById(id);
        if (!branch)
            throw new errorHandler_1.AppError("Branch not found", 404);
        const productsCount = await productModel_1.default.countDocuments({ branch: id });
        if (productsCount > 0) {
            throw new errorHandler_1.AppError("Cannot delete branch with associated products", 400);
        }
        await branch.deleteOne();
        res.json({ success: true, message: "Branch deleted successfully" });
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
//# sourceMappingURL=branchController.js.map