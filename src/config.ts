import dotenv from "dotenv";

dotenv.config();

interface Config {
  env: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  db: {
    uri: string;
    database: string;
  };
}

const config: Config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "3001"),
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  db: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017",
    database: process.env.MONGODB_DB || "inventory_db",
  },
};

export default config;
