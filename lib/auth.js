const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { connectToDatabase } = require("./db");

const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET && process.env.JWT_SECRET.trim();
  if (!jwtSecret) {
    throw new Error(
      "Missing JWT_SECRET environment variable. Define it in backend/.env before handling authentication."
    );
  }
  return jwtSecret;
}

async function authenticateAdminCredentials(email, password) {
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
  await connectToDatabase();

  // Simple: Only check "token" header (lowercase)
  const token = req.headers.token ? String(req.headers.token).trim() : null;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    const admin = await Admin.findById(payload.sub).lean();
    
    if (!admin) {
      return null;
    }
    
    return {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    };
  } catch (error) {
    return null;
  }
}

async function createAdmin(email, password, name) {
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


