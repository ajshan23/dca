"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const productSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
//# sourceMappingURL=productModel.js.map