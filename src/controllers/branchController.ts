import { Request, Response } from "express";
import Branch from "../models/branchModel";
import { AppError } from "../utils/errorHandler";
import Product from "../models/productModel";

export async function createBranch(req: Request, res: Response) {
  try {
    const { name } = req.body;

    if (await Branch.isNameTaken(name)) {
      throw new AppError("Branch name is already taken", 409);
    }

    const branch = await Branch.create({ name });

    res.status(201).json({
      success: true,
      data: branch,
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

export async function getAllBranches(req: Request, res: Response) {
  try {
    const branches = await Branch.find();
    res.json({ success: true, data: branches });
  } catch (error) {
    throw new AppError("Failed to fetch branches", 500);
  }
}

export async function getBranchById(req: Request, res: Response) {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) throw new AppError("Branch not found", 404);
    res.json({ success: true, data: branch });
  } catch (error) {
    throw error;
  }
}

export async function updateBranch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) throw new AppError("Branch not found", 404);

    if (name && name !== branch.name) {
      if (await Branch.isNameTaken(name)) {
        throw new AppError("Branch name is already taken", 409);
      }
      branch.name = name;
    }

    await branch.save();
    res.json({ success: true, data: branch });
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

export async function deleteBranch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const branch = await Branch.findById(id);
    if (!branch) throw new AppError("Branch not found", 404);

    // Check if branch has products
    const productsCount = await Product.countDocuments({ branch: id });
    if (productsCount > 0) {
      throw new AppError("Cannot delete branch with associated products", 400);
    }

    await branch.deleteOne();
    res.json({ success: true, message: "Branch deleted successfully" });
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
