"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
const userSchema = new mongoose_1.default.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50,
        match: /^[a-zA-Z0-9_]+$/,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            delete ret.passwordHash;
            return ret;
        },
    },
});
userSchema.statics.isUsernameTaken = async function (username) {
    const user = await this.findOne({ username });
    return !!user;
};
userSchema.methods.comparePassword = async function (password) {
    return bcryptjs_1.default.compare(password, this.passwordHash);
};
userSchema.methods.updatePassword = async function (newPassword) {
    this.passwordHash = await bcryptjs_1.default.hash(newPassword, 12);
    await this.save();
};
userSchema.methods.hasRole = function (role) {
    return this.role === role;
};
userSchema.methods.hasAnyRole = function (roles) {
    return roles.includes(this.role);
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
//# sourceMappingURL=userModel.js.map