"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const connectDB = async () => {
    try {
        mongoose_1.default.set("strictPopulate", false);
        await mongoose_1.default.connect(`${config_1.default.db.uri}/${config_1.default.db.database}`);
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
};
exports.default = connectDB;
//# sourceMappingURL=database.js.map