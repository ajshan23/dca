"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const stockHistorySchema = new mongoose_1.default.Schema({
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    notes: {
        type: String,
    },
}, {
    timestamps: true,
});
const StockHistory = mongoose_1.default.model("StockHistory", stockHistorySchema);
exports.default = StockHistory;
//# sourceMappingURL=stockHistoryModel.js.map