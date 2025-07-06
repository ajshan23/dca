"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.updateStock = updateStock;
exports.getProductStockHistory = getProductStockHistory;
const productModel_1 = __importDefault(require("../models/productModel"));
const stockHistoryModel_1 = __importDefault(require("../models/stockHistoryModel"));
const errorHandler_1 = require("../utils/errorHandler");
const mongoose_1 = __importDefault(require("mongoose"));
async function createProduct(req, res) {
    try {
        console.log("Creating product with data:", req.body);
        if (!req.body.name ||
            !req.body.model ||
            !req.body.category ||
            !req.body.branch) {
            throw new errorHandler_1.AppError("Missing required fields", 400);
        }
        if (!req.user?.userId) {
            throw new errorHandler_1.AppError("Missing user", 401);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(req.body.category)) {
            throw new errorHandler_1.AppError("Invalid category ID", 400);
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(req.body.branch)) {
            throw new errorHandler_1.AppError("Invalid branch ID", 400);
        }
        const product = new productModel_1.default({
            name: req.body.name,
            model: req.body.model,
            serialNumber: req.body.serialNumber,
            category: new mongoose_1.default.Types.ObjectId(req.body.category),
            branch: new mongoose_1.default.Types.ObjectId(req.body.branch),
            totalStock: Number(req.body.totalStock) || 0,
            availableStock: Number(req.body.availableStock) || Number(req.body.totalStock) || 0,
            warrantyDate: req.body.warrantyDate || undefined,
            complianceStatus: Boolean(req.body.complianceStatus),
            notes: req.body.notes || undefined,
        });
        const savedProduct = await product.save();
        console.log("Product created:", savedProduct);
        await stockHistoryModel_1.default.create({
            product: savedProduct._id,
            user: req.user.userId,
            type: "initial",
            quantity: savedProduct.totalStock,
            previousStock: 0,
            newStock: savedProduct.totalStock,
        });
        res.status(201).json({ success: true, data: savedProduct });
    }
    catch (error) {
        console.error("Product creation error:", error);
        if (error.code === 11000) {
            throw new errorHandler_1.AppError("Product with this serial number already exists", 400);
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            throw new errorHandler_1.AppError(messages.join(", "), 400);
        }
        if (error.name === "CastError") {
            throw new errorHandler_1.AppError("Invalid ID format", 400);
        }
        throw new errorHandler_1.AppError(error.message || "Failed to create product", 500);
    }
}
async function getAllProducts(_req, res) {
    try {
        const products = await productModel_1.default.find()
            .populate("category", "name")
            .populate("branch", "name");
        res.json({ success: true, data: products });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch products", 500);
    }
}
async function getProductById(req, res) {
    try {
        const product = await productModel_1.default.findById(req.params.id)
            .populate("category", "name")
            .populate("branch", "name");
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        res.json({ success: true, data: product });
    }
    catch (error) {
        throw error;
    }
}
async function updateProduct(req, res) {
    try {
        const product = await productModel_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        res.json({ success: true, data: product });
    }
    catch (error) {
        throw error;
    }
}
async function deleteProduct(req, res) {
    try {
        const product = await productModel_1.default.findByIdAndDelete(req.params.id);
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        res.json({ success: true, message: "Product deleted successfully" });
    }
    catch (error) {
        throw error;
    }
}
async function updateStock(req, res) {
    const session = await productModel_1.default.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;
        const { adjustment, notes } = req.body;
        const product = await productModel_1.default.findById(id).session(session);
        if (!product)
            throw new errorHandler_1.AppError("Product not found", 404);
        const previousStock = product.availableStock;
        const newStock = previousStock + adjustment;
        if (newStock < 0) {
            throw new errorHandler_1.AppError("Insufficient stock for this adjustment", 400);
        }
        product.totalStock += adjustment;
        product.availableStock = newStock;
        await product.save({ session });
        await stockHistoryModel_1.default.create([
            {
                product: product._id,
                user: req.user.userId,
                type: "adjustment",
                quantity: adjustment,
                previousStock,
                newStock,
                notes,
            },
        ], { session });
        await session.commitTransaction();
        res.json({ success: true, data: product });
    }
    catch (error) {
        await session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
}
async function getProductStockHistory(req, res) {
    try {
        const history = await stockHistoryModel_1.default.find({ product: req.params.id })
            .sort({ createdAt: -1 })
            .populate("user", "username");
        res.json({ success: true, data: history });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch stock history", 500);
    }
}
//# sourceMappingURL=productController.js.map