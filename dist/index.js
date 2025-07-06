"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = __importDefault(require("./config"));
const database_1 = __importDefault(require("./db/database"));
const errorHandler_1 = require("./utils/errorHandler");
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const productAssignmentRoutes_1 = __importDefault(require("./routes/productAssignmentRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const branchRoutes_1 = __importDefault(require("./routes/branchRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const superAdminSeeder_1 = require("./seeders/superAdminSeeder");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: "*", credentials: true }));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date() });
});
app.use("/api/products", productRoutes_1.default);
app.use("/api/product-assignments", productAssignmentRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/branches", branchRoutes_1.default);
app.use("/api/employees", employeeRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/auth", authRoutes_1.default);
app.get("/api/reset", superAdminSeeder_1.seedSuperAdmin);
app.use(errorHandler_1.errorHandler);
app.get("*", (_req, res) => {
    res.sendFile("/var/www/glomium/dca/dcab/dist/index.html");
});
async function startServer() {
    try {
        await (0, database_1.default)();
        app.listen(config_1.default.port, () => {
            console.log(`🚀 Server running on port ${config_1.default.port} in ${config_1.default.env} mode`);
        });
    }
    catch (error) {
        console.error("❌ Server startup error:", error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=index.js.map