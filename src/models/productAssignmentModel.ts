import mongoose, { Document, Schema } from "mongoose";
import { IProduct } from "./productModel";
import { IEmployee } from "./employeeModel";
import { IUser } from "./userModel";

type AssignmentStatus = "assigned" | "returned" | "lost" | "damaged";
type ConditionStatus = "excellent" | "good" | "fair" | "poor";

export interface IProductAssignment extends Document {
  product: mongoose.Types.ObjectId | IProduct;
  employee: mongoose.Types.ObjectId | IEmployee;
  assignedBy: mongoose.Types.ObjectId | IUser;
  quantity: number;
  assignedAt: Date;
  returnedAt?: Date;
  expectedReturnAt?: Date;
  status: AssignmentStatus;
  condition?: ConditionStatus;
  notes?: string;
}

const productAssignmentSchema = new Schema<IProductAssignment>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    returnedAt: Date,
    expectedReturnAt: Date,
    status: {
      type: String,
      enum: ["assigned", "returned", "lost", "damaged"],
      default: "assigned",
    },
    condition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
    },
    notes: String,
  },
  { timestamps: true }
);

const ProductAssignment = mongoose.model<IProductAssignment>(
  "ProductAssignment",
  productAssignmentSchema
);

export default ProductAssignment;
