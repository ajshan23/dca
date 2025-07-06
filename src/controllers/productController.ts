import { Request, Response } from "express";
import Product from "../models/productModel";
import StockHistory from "../models/stockHistoryModel";
import { AppError } from "../utils/errorHandler";
import mongoose from "mongoose";

export async function createProduct(req: Request, res: Response) {
  try {
    console.log("Creating product with data:", req.body);

    // Validate input data
    if (
      !req.body.name ||
      !req.body.model ||
      !req.body.category ||
      !req.body.branch
    ) {
      throw new AppError("Missing required fields", 400);
    }
    if (
      !req.user?.userId
    ) {
      throw new AppError("Missing user", 401);
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
      throw new AppError("Invalid category ID", 400);
    }
    if (!mongoose.Types.ObjectId.isValid(req.body.branch)) {
      throw new AppError("Invalid branch ID", 400);
    }

    // Create product
    const product = new Product({
      name: req.body.name,
      model: req.body.model,
      serialNumber: req.body.serialNumber,
      category: new mongoose.Types.ObjectId(req.body.category),
      branch: new mongoose.Types.ObjectId(req.body.branch),
      totalStock: Number(req.body.totalStock) || 0,
      availableStock:
        Number(req.body.availableStock) || Number(req.body.totalStock) || 0,
      warrantyDate: req.body.warrantyDate || undefined,
      complianceStatus: Boolean(req.body.complianceStatus),
      notes: req.body.notes || undefined,
    });

    const savedProduct = await product.save();
    console.log("Product created:", savedProduct);

    // Create stock history
    await StockHistory.create({
      product: savedProduct._id,
      user: req.user!.userId,
      type: "initial",
      quantity: savedProduct.totalStock,
      previousStock: 0,
      newStock: savedProduct.totalStock,
    });

    res.status(201).json({ success: true, data: savedProduct });
  } catch (error: any) {
    console.error("Product creation error:", error);

    // Handle duplicate key error (unique serialNumber)
    if (error.code === 11000) {
      throw new AppError("Product with this serial number already exists", 400);
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (val: any) => val.message
      );
      throw new AppError(messages.join(", "), 400);
    }

    // Handle CastError (invalid ObjectId)
    if (error.name === "CastError") {
      throw new AppError("Invalid ID format", 400);
    }

    throw new AppError(error.message || "Failed to create product", 500);
  }
}

export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("branch", "name");
    res.json({ success: true, data: products });
  } catch (error) {
    throw new AppError("Failed to fetch products", 500);
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("branch", "name");

    if (!product) throw new AppError("Product not found", 404);

    res.json({ success: true, data: product });
  } catch (error) {
    throw error;
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!product) throw new AppError("Product not found", 404);

    res.json({ success: true, data: product });
  } catch (error) {
    throw error;
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) throw new AppError("Product not found", 404);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    throw error;
  }
}

export async function updateStock(req: Request, res: Response) {
  const session = await Product.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { adjustment, notes } = req.body;

    const product = await Product.findById(id).session(session);
    if (!product) throw new AppError("Product not found", 404);

    const previousStock = product.availableStock;
    const newStock = previousStock + adjustment;

    if (newStock < 0) {
      throw new AppError("Insufficient stock for this adjustment", 400);
    }

    product.totalStock += adjustment;
    product.availableStock = newStock;
    await product.save({ session });

    await StockHistory.create(
      [
        {
          product: product._id,
          user: req.user!.userId,
          type: "adjustment",
          quantity: adjustment,
          previousStock,
          newStock,
          notes,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.json({ success: true, data: product });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getProductStockHistory(req: Request, res: Response) {
  try {
    const history = await StockHistory.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "username");

    res.json({ success: true, data: history });
  } catch (error) {
    throw new AppError("Failed to fetch stock history", 500);
  }
}
