"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const errorHandler_1 = require("../utils/errorHandler");
const productModel_1 = __importDefault(require("../models/productModel"));
async function createCategory(req, res) {
    try {
        const { name, description } = req.body;
        if (await categoryModel_1.default.isNameTaken(name)) {
            throw new errorHandler_1.AppError("Category name is already taken", 409);
        }
        const category = await categoryModel_1.default.create({ name, description });
        res.status(201).json({
            success: true,
            data: category,
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
async function getAllCategories(_req, res) {
    try {
        const categories = await categoryModel_1.default.find();
        res.json({ success: true, data: categories });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch categories", 500);
    }
}
async function getCategoryById(req, res) {
    try {
        const category = await categoryModel_1.default.findById(req.params.id);
        if (!category)
            throw new errorHandler_1.AppError("Category not found", 404);
        res.json({ success: true, data: category });
    }
    catch (error) {
        throw error;
    }
}
async function updateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const category = await categoryModel_1.default.findById(id);
        if (!category)
            throw new errorHandler_1.AppError("Category not found", 404);
        if (name && name !== category.name) {
            if (await categoryModel_1.default.isNameTaken(name)) {
                throw new errorHandler_1.AppError("Category name is already taken", 409);
            }
            category.name = name;
        }
        if (description) {
            category.description = description;
        }
        await category.save();
        res.json({ success: true, data: category });
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
async function deleteCategory(req, res) {
    try {
        const { id } = req.params;
        const category = await categoryModel_1.default.findById(id);
        if (!category)
            throw new errorHandler_1.AppError("Category not found", 404);
        const productsCount = await productModel_1.default.countDocuments({ category: id });
        if (productsCount > 0) {
            throw new errorHandler_1.AppError("Cannot delete category with associated products", 400);
        }
        await category.deleteOne();
        res.json({ success: true, message: "Category deleted successfully" });
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
//# sourceMappingURL=categoryController.js.map