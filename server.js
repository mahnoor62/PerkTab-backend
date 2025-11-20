// Load environment variables from .env file
const path = require("path");
const fs = require("fs");

// Get the path to .env file in the backend directory
const envPath = path.join(__dirname, ".env");

// Check if .env file exists and load it
let dotenvResult = { error: null, parsed: null };
if (!fs.existsSync(envPath)) {
  console.warn("⚠️  WARNING: .env file not found at:", envPath);
  console.warn("   Creating .env file will be required for the server to run.");
  console.warn("   Server will try to use system environment variables.\n");
} else {
  console.log("✅ Found .env file at:", envPath);
  // Load environment variables from .env file
  dotenvResult = require("dotenv").config({ path: envPath });
  if (dotenvResult.error) {
    console.warn(`   ⚠️  Error loading .env file: ${dotenvResult.error.message}`);
  } else if (dotenvResult.parsed) {
    console.log(`   ✅ Loaded ${Object.keys(dotenvResult.parsed).length} variables from .env file`);
  }
}

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// path already imported above
const { connectToDatabase } = require("./lib/db");
const { ensureSeedData } = require("./lib/seed");

const authRoutes = require("./routes/auth");
const levelsRoutes = require("./routes/levels");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.BACKEND_PORT;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Build list of allowed origins from environment variables
    const allowedOrigins = [];
    
    // Add FRONTEND_URL if set
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    // Add ALLOWED_ORIGINS (comma-separated list) if set
    if (process.env.ALLOWED_ORIGINS) {
      const origins = process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()).filter(Boolean);
      allowedOrigins.push(...origins);
    }
    
    // In development mode, add localhost URLs from env variable
    if (process.env.NODE_ENV === "development" && process.env.LOCALHOST_PORT) {
      allowedOrigins.push(`http://localhost:${process.env.LOCALHOST_PORT}`);
      allowedOrigins.push(`http://127.0.0.1:${process.env.LOCALHOST_PORT}`);
    }
    
    // Add CORS_PATTERN regex if set (e.g., /^https:\/\/.*\.vercel\.app$/)
    let corsPattern = null;
    if (process.env.CORS_PATTERN) {
      try {
        corsPattern = new RegExp(process.env.CORS_PATTERN);
      } catch (error) {
        console.warn(`Invalid CORS_PATTERN regex: ${process.env.CORS_PATTERN}`);
      }
    }
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins if no specific origins configured
    if (process.env.NODE_ENV === "development" && allowedOrigins.length === 0 && !corsPattern) {
      return callback(null, true);
    }
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === "string") {
        // Exact match or remove trailing slash for comparison
        const normalizedAllowed = allowed.replace(/\/$/, "");
        const normalizedOrigin = origin.replace(/\/$/, "");
        return normalizedOrigin === normalizedAllowed;
      }
      return false;
    });
    
    // Check against regex pattern if set
    if (corsPattern && corsPattern.test(origin)) {
      return callback(null, true);
    }
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin ${origin}`);
      console.warn(`CORS: Allowed origins:`, allowedOrigins);
      if (corsPattern) {
        console.warn(`CORS: Pattern: ${corsPattern}`);
      }
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie", "authorization", "content-type"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files statically
const uploadsDir = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/levels", levelsRoutes);
app.use("/api/upload", uploadRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Validate required environment variables
function validateEnv() {
  const errors = [];
  const warnings = [];
  
  // Required variables
  if (!process.env.BACKEND_PORT) {
    errors.push("❌ BACKEND_PORT is required");
  }
  
  if (!process.env.MONGO_URL) {
    errors.push("❌ MONGO_URL is required");
  }
  
  if (!process.env.JWT_SECRET) {
    errors.push("❌ JWT_SECRET is required");
  }
  
  // Warnings
  if (process.env.JWT_SECRET === "dotback_secret_key") {
    warnings.push("⚠️  WARNING: Using default JWT_SECRET. Change this in production!");
  }
  
  if (!process.env.FRONTEND_URL && !process.env.ALLOWED_ORIGINS) {
    warnings.push("⚠️  WARNING: FRONTEND_URL or ALLOWED_ORIGINS should be set for CORS");
  }
  
  if (errors.length > 0) {
    console.error("\n❌ Missing required environment variables:");
    errors.forEach(error => console.error(`   ${error}`));
    console.error("\n");
    throw new Error("Missing required environment variables");
  }
  
  if (warnings.length > 0) {
    console.warn("\n" + warnings.join("\n") + "\n");
  }

  return {
    BACKEND_PORT: process.env.BACKEND_PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
}

// Initialize database connection and seed data
async function startServer() {
  try {
    // Validate environment variables
    const envVars = validateEnv();

    // Debug: Show loaded environment variables
    console.log("\n📋 Environment Variables (from .env or system):");
    console.log(`   BACKEND_PORT: ${process.env.BACKEND_PORT || "❌ NOT SET"}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "❌ Not set"}`);
    console.log(`   ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || "❌ Not set"}`);
    console.log(`   CORS_PATTERN: ${process.env.CORS_PATTERN || "❌ Not set"}`);
    console.log(`   MONGO_URL: ${process.env.MONGO_URL ? "✅ Set" : "❌ NOT SET"}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ NOT SET"}`);
    console.log(`   COOKIE_DOMAIN: ${process.env.COOKIE_DOMAIN || "❌ Not set"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development (default)"}`);
    if (process.env.NODE_ENV === "development" && process.env.LOCALHOST_PORT) {
      console.log(`   LOCALHOST_PORT: ${process.env.LOCALHOST_PORT}`);
    }
    
    console.log("");

    await connectToDatabase();
    await ensureSeedData();
    
    app.listen(PORT, () => {
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const host = process.env.BACKEND_HOST || "localhost";
      console.log(`✅ Backend server running on port ${PORT}`);
      console.log(`   Health check: ${protocol}://${host}:${PORT}/health`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "Not configured"}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

