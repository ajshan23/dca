import { Request, Response } from "express";
import Employee from "../models/employeeModel";
import { AppError } from "../utils/errorHandler";
import ProductAssignment from "../models/productAssignmentModel";

export async function createEmployee(req: Request, res: Response) {
  try {
    const { empId, name, email, department, position } = req.body;

    if (await Employee.isEmpIdTaken(empId)) {
      throw new AppError("Employee ID is already taken", 409);
    }

    const employee = await Employee.create({
      empId,
      name,
      email,
      department,
      position,
    });

    res.status(201).json({
      success: true,
      data: employee,
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

export async function getAllEmployees(req: Request, res: Response) {
  try {
    const { search } = req.query;

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { empId: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const employees = await Employee.find(query);
    res.json({ success: true, data: employees });
  } catch (error) {
    throw new AppError("Failed to fetch employees", 500);
  }
}

export async function getEmployeeById(req: Request, res: Response) {
  try {
    const employee = await Employee.findById(req.params.id).populate({
      path: "assignments",
      populate: [
        { path: "product", select: "name model serialNumber" },
        { path: "assignedBy", select: "username" },
      ],
    });

    if (!employee) throw new AppError("Employee not found", 404);

    res.json({ success: true, data: employee });
  } catch (error) {
    throw error;
  }
}

export async function updateEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { empId, name, email, department, position } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);

    if (empId && empId !== employee.empId) {
      if (await Employee.isEmpIdTaken(empId)) {
        throw new AppError("Employee ID is already taken", 409);
      }
      employee.empId = empId;
    }

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (department) employee.department = department;
    if (position) employee.position = position;

    await employee.save();

    res.json({ success: true, data: employee });
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

export async function deleteEmployee(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) throw new AppError("Employee not found", 404);

    // Check if employee has assignments
    const assignmentsCount = await ProductAssignment.countDocuments({
      employee: id,
    });
    if (assignmentsCount > 0) {
      throw new AppError("Cannot delete employee with assigned products", 400);
    }

    await employee.deleteOne();
    res.json({ success: true, message: "Employee deleted successfully" });
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
