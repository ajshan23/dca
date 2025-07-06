import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import config from "./config";
import connectDB from "./db/database";
import { errorHandler } from "./utils/errorHandler";

// Routes
import productRoutes from "./routes/productRoutes";
import productAssignmentRoutes from "./routes/productAssignmentRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import branchRoutes from "./routes/branchRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { seedSuperAdmin } from "./seeders/superAdminSeeder";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/product-assignments", productAssignmentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.get("/api/reset",seedSuperAdmin)
// Error handling
app.use(errorHandler);

// Start server
async function startServer(): Promise<void> {
  try {
    await connectDB();

    app.listen(config.port, () => {
      console.log(
        `🚀 Server running on port ${config.port} in ${config.env} mode`
      );
    });
  } catch (error) {
    console.error("❌ Server startup error:", error);
    process.exit(1);
  }
}

startServer();
