const express = require("express");
const router = express.Router();
const {
  authenticateAdminCredentials,
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
  getCurrentAdmin,
  createAdmin,
} = require("../lib/auth");

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const admin = await authenticateAdminCredentials(email, password);

    if (!admin) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = createAuthToken(admin);
    setAuthCookie(res, token);

    // Log for debugging (remove sensitive data)
    console.log(`Login successful for: ${email}`);
    console.log(`Origin: ${req.headers.origin || "none"}`);
    console.log(`Cookie will be set with secure: ${process.env.NODE_ENV === "production"}, sameSite: ${process.env.NODE_ENV === "production" ? "none" : "lax"}`);

    return res.json({
      message: "Logged in successfully.",
      token: token, // Also return token for API clients (Postman, etc.)
      admin: {
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    return res.status(500).json({
      message: "Unexpected error during login.",
    });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: "Logged out successfully." });
});

// Session check
router.get("/session", async (req, res) => {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return res.status(401).json({ authenticated: false });
  }

  return res.json({
    authenticated: true,
    admin,
  });
});

// Middleware to check authentication
async function requireAuth(req, res, next) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.admin = admin;
  next();
}

// Create new admin (public endpoint - no authentication required)
router.post("/create", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    // Create admin
    const admin = await createAdmin(email, password, name);

    return res.status(201).json({
      message: "Admin created successfully.",
      admin,
    });
  } catch (error) {
    console.error("Create admin error", error);
    
    // Handle duplicate email error
    if (error.message.includes("already exists") || error.code === 11000) {
      return res.status(409).json({
        message: "Admin with this email already exists.",
      });
    }

    // Handle validation errors
    if (error.message.includes("Invalid") || error.message.includes("must be")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Unexpected error during admin creation.",
    });
  }
});

module.exports = router;


