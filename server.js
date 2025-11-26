// Load environment variables from .env file
const path = require("path");
const fs = require("fs");
require("dotenv").config();
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

const authRoutes = require("./routes/auth");
const levelsRoutes = require("./routes/levels");
const uploadRoutes = require("./routes/upload");
const shopRoutes = require("./routes/shop");
const productRoutes = require("./routes/products");
const publicLevelsRoutes = require("./routes/levelsPublic");

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});


const rawAllowed = [
  process.env.FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
].filter(Boolean);

const normalize = (url) =>
  url ? url.trim().replace(/\/$/, "") : url;

const allowed = rawAllowed.map(normalize);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman etc.

    const normalizedOrigin = normalize(origin);

    if (allowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.log("❌ BLOCKED ORIGIN:", normalizedOrigin);
    console.log("ALLOWED:", allowed);

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};


// const allowed = [
//   process.env.FRONTEND_URL,
//   ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim()) : [])
// ].filter(Boolean);

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowed.includes(origin)) return callback(null, true);
//     console.log("❌ BLOCKED ORIGIN:", origin);
//     console.log("ALLOWED:", allowed);
//     callback(new Error("Not allowed by CORS"));
//   },
//   credentials: true,
// };

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
app.use("/api/get/levels", publicLevelsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/products", productRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Debug endpoint to check headers (remove in production)
app.get("/api/test-headers", (req, res) => {
  res.json({
    message: "Headers received by server",
    allHeaderKeys: Object.keys(req.headers),
    tokenHeader: req.headers.token || "not found",
  });
});

// Validate required environment variables
function validateEnv() {
  const errors = [];
  const warnings = [];
  
  // Required variables
  if (!process.env.PORT) {
    errors.push("❌ PORT is required");
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
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
  };
}

// Initialize database connection
async function startServer() {
  try {
    // Validate environment variables
    const envVars = validateEnv();

    // Debug: Show loaded environment variables
    console.log("\n📋 Environment Variables (from .env or system):");
    console.log(`   PORT: ${process.env.PORT || "❌ NOT SET"}`);
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
    
    app.listen(PORT, () => {
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
      const host = process.env.BACKEND_HOST;
      console.log(`✅ Backend server running on port ${PORT}`);
      if (host) {
        console.log(`   Health check: ${protocol}://${host}:${PORT}/health`);
      } else {
        console.log(`   Health check: ${protocol}://<BACKEND_HOST>:${PORT}/health (BACKEND_HOST not set)`);
      }
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "Not configured"}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

