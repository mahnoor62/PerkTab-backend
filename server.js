// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const { connectToDatabase } = require("./lib/db");
const { ensureSeedData } = require("./lib/seed");

const authRoutes = require("./routes/auth");
const levelsRoutes = require("./routes/levels");
const uploadRoutes = require("./routes/upload");

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove any undefined values
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
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
  const required = {
    MONGO_URL: process.env.MONGO_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const warnings = [];
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dotback_secret_key") {
    warnings.push("⚠️  WARNING: Using default JWT_SECRET. Change this in production!");
  }

  if (warnings.length > 0) {
    console.warn("\n" + warnings.join("\n") + "\n");
  }

  return required;
}

// Initialize database connection and seed data
async function startServer() {
  try {
    // Validate environment variables
    validateEnv();

    // Debug: Show loaded environment variables
    console.log("\n📋 Environment Variables:");
    console.log(`   BACKEND_PORT: ${process.env.BACKEND_PORT || "3000 (default)"}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || "http://localhost:3000 (default)"}`);
    console.log(`   MONGO_URL: ${process.env.MONGO_URL ? "✅ Set" : "❌ Using default"}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? "✅ Set" : "❌ Using default"}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development (default)"}\n`);

    await connectToDatabase();
    await ensureSeedData();
    
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
      console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

