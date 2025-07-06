import { Request, Response } from "express";
import ProductAssignment from "../models/productAssignmentModel";
import Product, { IProduct } from "../models/productModel";
import { AppError } from "../utils/errorHandler";
import mongoose from "mongoose";
import Employee from "../models/employeeModel";
import { Types } from "mongoose";
export async function assignProduct(req: Request, res: Response) {
  try {
    // Destructure with correct field names
    const { productId, employeeId, quantity, expectedReturnAt, notes } =
      req.body;
    const assignedBy = req.user?.userId;

    console.log("Request body:", req.body); // Debug log

    // Convert string IDs to ObjectId
    const productObjectId = new Types.ObjectId(productId);
    const employeeObjectId = new Types.ObjectId(employeeId);

    // Validate product exists and has enough stock
    const productDoc = await Product.findById(productObjectId);
    if (!productDoc) {
      console.error(`Product not found with ID: ${productId}`);
      throw new AppError("Product not found", 404);
    }

    // Validate employee exists
    const employeeExists = await Employee.exists({ _id: employeeObjectId });
    if (!employeeExists) {
      throw new AppError("Employee not found", 404);
    }

    if (productDoc.availableStock < quantity) {
      throw new AppError("Insufficient stock available", 400);
    }

    // Create assignment
    const assignment = await ProductAssignment.create({
      product: productObjectId,
      employee: employeeObjectId,
      assignedBy,
      quantity,
      expectedReturnAt,
      notes,
      status: "assigned",
    });

    // Update product stock
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
  } catch (error) {
    console.error("Assignment error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to assign product", 500);
  }
}

export async function returnProduct(req: Request, res: Response) {
  try {
    const { assignmentId } = req.params;
    const { condition, notes } = req.body;

    const assignment = await ProductAssignment.findById(assignmentId);
    if (!assignment) {
      throw new AppError("Assignment not found", 404);
    }
    if (assignment.status === "returned") {
      throw new AppError("Product already returned", 400);
    }

    // Update assignment
    assignment.status = "returned";
    assignment.returnedAt = new Date();
    assignment.condition = condition;
    assignment.notes = notes;
    await assignment.save();

    // Update product stock
    const product = await Product.findById(assignment.product);
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
  } catch (error) {
    throw error;
  }
}
export async function getActiveAssignments(req: Request, res: Response) {
  try {
    // Define interface for the populated assignment
    interface PopulatedAssignment {
      _id: Types.ObjectId;
      product: {
        _id: Types.ObjectId;
        name: string;
        model: string;
        serialNumber?: string;
      };
      employee: {
        _id: Types.ObjectId;
        name: string;
        empId: string;
      };
      assignedBy: {
        _id: Types.ObjectId;
        username: string;
      };
      quantity: number;
      assignedAt: Date;
      expectedReturnAt?: Date;
      status: string;
    }

    // Fetch assignments with proper typing
    const assignments = (await ProductAssignment.find({ status: "assigned" })
      .populate<{ product: PopulatedAssignment["product"] }>(
        "product",
        "name model serialNumber"
      )
      .populate<{ employee: PopulatedAssignment["employee"] }>(
        "employee",
        "name empId"
      )
      .populate<{ assignedBy: PopulatedAssignment["assignedBy"] }>(
        "assignedBy",
        "username"
      )
      .lean()) as unknown as PopulatedAssignment[];

    // Transform the data with proper typing
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
  } catch (error) {
    throw new AppError(
      error instanceof Error ? error.message : "Failed to fetch assignments",
      500
    );
  }
}

export async function getAssignmentHistory(req: Request, res: Response) {
  try {
    const { productId, status, fromDate, toDate } = req.query;

    // Define filter type
    type AssignmentFilter = {
      product?: string;
      status?: string;
      assignedAt?: {
        $gte?: Date;
        $lte?: Date;
      };
    };

    const filter: AssignmentFilter = {};

    if (productId) filter.product = productId as string;
    if (status) filter.status = status as string;

    if (fromDate || toDate) {
      filter.assignedAt = {};
      if (fromDate) filter.assignedAt.$gte = new Date(fromDate as string);
      if (toDate) filter.assignedAt.$lte = new Date(toDate as string);
    }

    // Define types for populated data
    interface PopulatedAssignment {
      _id: Types.ObjectId;
      product: {
        _id: Types.ObjectId;
        name: string;
      };
      employee: {
        _id: Types.ObjectId;
        name: string;
      };
      quantity: number;
      assignedAt: Date;
      returnedAt?: Date;
      status: string;
      condition?: string;
    }

    // Fetch assignments with proper typing
    const assignments = (await ProductAssignment.find(filter)
      .populate<{ product: PopulatedAssignment["product"] }>("product", "name")
      .populate<{ employee: PopulatedAssignment["employee"] }>(
        "employee",
        "name"
      )
      .sort({ assignedAt: -1 })
      .lean()) as unknown as PopulatedAssignment[];

    // Transform the data with proper typing
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
  } catch (error) {
    console.error("Error fetching assignment history:", error);
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Failed to fetch assignment history",
      500
    );
  }
}

export async function getAssignmentsByProduct(req: Request, res: Response) {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid product ID", 400);
    }

    // Define interface for the populated assignment
    interface PopulatedAssignment {
      _id: Types.ObjectId;
      product: {
        _id: Types.ObjectId;
        name: string;
        model: string;
        serialNumber?: string;
      };
      employee: {
        _id: Types.ObjectId;
        name: string;
        empId: string;
      };
      assignedBy?: {
        _id: Types.ObjectId;
        username: string;
      };
      quantity: number;
      assignedAt: Date;
      returnedAt?: Date;
      expectedReturnAt?: Date;
      status: string;
      condition?: string;
      notes?: string;
    }

    // Fetch assignments with proper typing
    const assignments = (await ProductAssignment.find({ product: productId })
      .populate<{ product: PopulatedAssignment["product"] }>(
        "product",
        "name model serialNumber"
      )
      .populate<{ employee: PopulatedAssignment["employee"] }>(
        "employee",
        "name empId"
      )
      .populate<{ assignedBy: PopulatedAssignment["assignedBy"] }>(
        "assignedBy",
        "username"
      )
      .sort({ assignedAt: -1 })
      .lean()) as unknown as PopulatedAssignment[];

    // Transform the data with proper typing
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
  } catch (error) {
    console.error("Error fetching product assignments:", error);
    throw new AppError(
      error instanceof Error
        ? error.message
        : "Failed to fetch product assignments",
      500
    );
  }
}
