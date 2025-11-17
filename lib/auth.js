const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret() {
  return process.env.JWT_SECRET || "dotback_secret_key";
}

async function authenticateAdminCredentials(email, password) {
  await ensureSeedData();
  await connectToDatabase();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return null;
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) {
    return null;
  }

  return admin;
}

function createAuthToken(admin) {
  return jwt.sign(
    {
      sub: admin._id.toString(),
      email: admin.email,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRATION_SECONDS }
  );
}

async function getCurrentAdmin(req) {
  await ensureSeedData();
  await connectToDatabase();

  // Get token from Authorization header only (no cookies)
  // Express normalizes headers to lowercase, but check both cases for compatibility
  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (authHeader.startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (authHeader.startsWith("Token ")) {
      token = authHeader.substring(6).trim();
    } else if (authHeader.startsWith("token ")) {
      token = authHeader.substring(6).trim();
    } else {
      // Allow direct token in Authorization header
      token = authHeader.trim();
    }
  }

  if (!token) {
    // Debug logging in production
    console.log(`[Auth] No token found. Headers:`, {
      authorization: req.headers.authorization ? "present" : "missing",
      Authorization: req.headers.Authorization ? "present" : "missing",
      allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes("auth")),
    });
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(payload.sub).lean();
    if (!admin) {
      console.log(`[Auth] Admin not found for token payload:`, payload.sub);
      return null;
    }
    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    console.error(`[Auth] Token verification failed:`, error.message);
    return null;
  }
}

async function createAdmin(email, password, name) {
  await ensureSeedData();
  await connectToDatabase();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  // Validate password strength
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
  if (existingAdmin) {
    throw new Error("Admin with this email already exists.");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin
  const admin = await Admin.create({
    email: email.toLowerCase().trim(),
    passwordHash,
    name: name || "Administrator",
  });

  // Return admin without password hash
  const adminObj = admin.toObject();
  delete adminObj.passwordHash;
  
  return {
    id: adminObj._id.toString(),
    email: adminObj.email,
    name: adminObj.name,
    createdAt: adminObj.createdAt,
    updatedAt: adminObj.updatedAt,
  };
}

module.exports = {
  authenticateAdminCredentials,
  createAuthToken,
  getCurrentAdmin,
  createAdmin,
};


