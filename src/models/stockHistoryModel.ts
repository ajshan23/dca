import mongoose, { Document, Model, Types } from "mongoose";

type StockHistoryType = "assignment" | "return" | "adjustment" | "initial";

export interface IStockHistory extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  type: StockHistoryType;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: Types.ObjectId;
  notes?: string;
}

const stockHistorySchema = new mongoose.Schema<IStockHistory>(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["assignment", "return", "adjustment", "initial"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const StockHistory = mongoose.model<IStockHistory>(
  "StockHistory",
  stockHistorySchema
);

export default StockHistory;
