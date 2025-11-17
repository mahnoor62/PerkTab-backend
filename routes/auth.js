const express = require("express");
const router = express.Router();
const {
  authenticateAdminCredentials,
  createAuthToken,
  setAuthCookie,
  clearAuthCookie,
  getCurrentAdmin,
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

    return res.json({
      message: "Logged in successfully.",
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

module.exports = router;


