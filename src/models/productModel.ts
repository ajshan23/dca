import mongoose, { Document,  Types } from "mongoose";

export interface IProduct extends Omit<Document, 'model'> {
  name: string;
  model: string;  // Now this is safe
  serialNumber?: string;
  category: Types.ObjectId;
  totalStock: number;
  availableStock: number;
  branch: Types.ObjectId;
  warrantyDate?: Date;
  complianceStatus: boolean;
  notes?: string;
}

const productSchema = new mongoose.Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    totalStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    availableStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    warrantyDate: {
      type: Date,
    },
    complianceStatus: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product;
