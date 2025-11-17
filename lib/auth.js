const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

const TOKEN_COOKIE = "dotback_admin_token";
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

  const token = req.cookies?.[TOKEN_COOKIE];

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

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_EXPIRATION_SECONDS * 1000,
    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE, {
    path: "/",
  });
}

module.exports = {
  authenticateAdminCredentials,
  createAuthToken,
  getCurrentAdmin,
  setAuthCookie,
  clearAuthCookie,
};


