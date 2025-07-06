"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const branchSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
}, {
    timestamps: true,
});
branchSchema.statics.isNameTaken = async function (name) {
    const branch = await this.findOne({ name });
    return !!branch;
};
const Branch = mongoose_1.default.model("Branch", branchSchema);
exports.default = Branch;
//# sourceMappingURL=branchModel.js.map