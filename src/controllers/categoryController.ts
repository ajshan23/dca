import { Request, Response } from "express";
import Category from "../models/categoryModel";
import { AppError } from "../utils/errorHandler";
import Product from "../models/productModel";

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, description } = req.body;

    if (await Category.isNameTaken(name)) {
      throw new AppError("Category name is already taken", 409);
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await Category.find();
    res.json({ success: true, data: categories });
  } catch (error) {
    throw new AppError("Failed to fetch categories", 500);
  }
}

export async function getCategoryById(req: Request, res: Response) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw new AppError("Category not found", 404);
    res.json({ success: true, data: category });
  } catch (error) {
    throw error;
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    if (name && name !== category.name) {
      if (await Category.isNameTaken(name)) {
        throw new AppError("Category name is already taken", 409);
      }
      category.name = name;
    }

    if (description) {
      category.description = description;
    }

    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) throw new AppError("Category not found", 404);

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      throw new AppError(
        "Cannot delete category with associated products",
        400
      );
    }

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
