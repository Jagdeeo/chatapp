import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,

  MONGO_URI: process.env.MONGO_URI,

  JWT_SECRET: process.env.JWT_SECRET,

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  NODE_ENV: process.env.NODE_ENV || "development",
};


// ==================== REQUIRED VARIABLES ====================

if (!env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in .env");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in .env");
}


export default env;