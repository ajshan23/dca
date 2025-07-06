import mongoose from "mongoose";
import config from "../config";

const connectDB = async () => {
  try {
    mongoose.set("strictPopulate", false); // Temporary solution
    await mongoose.connect(`${config.db.uri}/${config.db.database}`);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

export default connectDB;
