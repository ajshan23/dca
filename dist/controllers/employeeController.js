"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployee = createEmployee;
exports.getAllEmployees = getAllEmployees;
exports.getEmployeeById = getEmployeeById;
exports.updateEmployee = updateEmployee;
exports.deleteEmployee = deleteEmployee;
const employeeModel_1 = __importDefault(require("../models/employeeModel"));
const errorHandler_1 = require("../utils/errorHandler");
const productAssignmentModel_1 = __importDefault(require("../models/productAssignmentModel"));
async function createEmployee(req, res) {
    try {
        const { empId, name, email, department, position } = req.body;
        if (await employeeModel_1.default.isEmpIdTaken(empId)) {
            throw new errorHandler_1.AppError("Employee ID is already taken", 409);
        }
        const employee = await employeeModel_1.default.create({
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
async function getAllEmployees(req, res) {
    try {
        const { search } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { empId: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        const employees = await employeeModel_1.default.find(query);
        res.json({ success: true, data: employees });
    }
    catch (error) {
        throw new errorHandler_1.AppError("Failed to fetch employees", 500);
    }
}
async function getEmployeeById(req, res) {
    try {
        const employee = await employeeModel_1.default.findById(req.params.id).populate({
            path: "assignments",
            populate: [
                { path: "product", select: "name model serialNumber" },
                { path: "assignedBy", select: "username" },
            ],
        });
        if (!employee)
            throw new errorHandler_1.AppError("Employee not found", 404);
        res.json({ success: true, data: employee });
    }
    catch (error) {
        throw error;
    }
}
async function updateEmployee(req, res) {
    try {
        const { id } = req.params;
        const { empId, name, email, department, position } = req.body;
        const employee = await employeeModel_1.default.findById(id);
        if (!employee)
            throw new errorHandler_1.AppError("Employee not found", 404);
        if (empId && empId !== employee.empId) {
            if (await employeeModel_1.default.isEmpIdTaken(empId)) {
                throw new errorHandler_1.AppError("Employee ID is already taken", 409);
            }
            employee.empId = empId;
        }
        if (name)
            employee.name = name;
        if (email)
            employee.email = email;
        if (department)
            employee.department = department;
        if (position)
            employee.position = position;
        await employee.save();
        res.json({ success: true, data: employee });
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
async function deleteEmployee(req, res) {
    try {
        const { id } = req.params;
        const employee = await employeeModel_1.default.findById(id);
        if (!employee)
            throw new errorHandler_1.AppError("Employee not found", 404);
        const assignmentsCount = await productAssignmentModel_1.default.countDocuments({
            employee: id,
        });
        if (assignmentsCount > 0) {
            throw new errorHandler_1.AppError("Cannot delete employee with assigned products", 400);
        }
        await employee.deleteOne();
        res.json({ success: true, message: "Employee deleted successfully" });
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
//# sourceMappingURL=employeeController.js.map