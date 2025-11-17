const express = require("express");
const router = express.Router();
const { getCurrentAdmin } = require("../lib/auth");
const {
  getAllLevelConfigs,
  getLevelConfig,
  createLevelConfig,
  updateLevelConfig,
  deleteLevelConfig,
} = require("../lib/levels");
const path = require("path");
const fs = require("fs").promises;

// Middleware to check authentication
async function requireAuth(req, res, next) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.admin = admin;
  next();
}

// Get all levels
router.get("/", requireAuth, async (req, res) => {
  const levels = await getAllLevelConfigs();
  return res.json({ levels });
});

// Create a new level
router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = req.body;
    if (payload == null || typeof payload !== "object") {
      return res.status(400).json({
        message: "Invalid payload.",
      });
    }

    const level = await createLevelConfig(payload);
    return res.status(201).json({ level });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Unable to create level.",
    });
  }
});

// Parse level number from params
function parseLevel(levelParam) {
  const levelNumber = Number(levelParam);
  if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    return null;
  }
  return levelNumber;
}

// Get a specific level
router.get("/:level", requireAuth, async (req, res) => {
  const levelNumber = parseLevel(req.params.level);
  if (!levelNumber) {
    return res.status(400).json({ message: "Invalid level." });
  }

  const level = await getLevelConfig(levelNumber);
  if (!level) {
    return res.status(404).json({ message: "Level not found." });
  }

  return res.json({ level });
});

// Update a specific level
router.put("/:level", requireAuth, async (req, res) => {
  const levelNumber = parseLevel(req.params.level);
  if (!levelNumber) {
    return res.status(400).json({ message: "Invalid level." });
  }

  const payload = req.body;
  const requiredFields = [
    "backgroundColor",
    "dot1Color",
    "dot2Color",
    "dot3Color",
    "dot4Color",
    "dot5Color",
  ];

  const missingField = requiredFields.find(
    (field) => typeof payload[field] !== "string"
  );

  if (missingField) {
    return res.status(400).json({
      message: `Field ${missingField} is required.`,
    });
  }

  // Get current level to check for old logo
  const currentLevel = await getLevelConfig(levelNumber);
  if (!currentLevel) {
    return res.status(404).json({ message: "Level not found." });
  }

  // Delete old logo file if logoUrl is being changed or cleared
  const oldLogoUrl = currentLevel.logoUrl;
  const newLogoUrl = payload.logoUrl ?? "";

  if (oldLogoUrl && oldLogoUrl !== newLogoUrl && oldLogoUrl.startsWith("/uploads/")) {
    try {
      const oldFilePath = path.join(__dirname, "..", "uploads", oldLogoUrl.replace("/uploads/", ""));
      await fs.unlink(oldFilePath);
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      if (error.code !== "ENOENT") {
        console.warn(`Failed to delete old logo file: ${oldLogoUrl}`, error);
      }
    }
  }

  const updated = await updateLevelConfig(levelNumber, payload);

  if (!updated) {
    return res.status(404).json({ message: "Level not found." });
  }

  return res.json({ level: updated });
});

// Delete a specific level
router.delete("/:level", requireAuth, async (req, res) => {
  const levelNumber = parseLevel(req.params.level);
  if (!levelNumber) {
    return res.status(400).json({ message: "Invalid level." });
  }

  // Get level before deleting to check for logo file
  const levelToDelete = await getLevelConfig(levelNumber);
  if (!levelToDelete) {
    return res.status(404).json({
      message: "Level not found.",
    });
  }

  // Delete logo file if it exists
  const logoUrl = levelToDelete.logoUrl;
  if (logoUrl && logoUrl.startsWith("/uploads/")) {
    try {
      const logoFilePath = path.join(__dirname, "..", "uploads", logoUrl.replace("/uploads/", ""));
      await fs.unlink(logoFilePath);
    } catch (error) {
      // Only log if it's not a "file not found" error (ENOENT)
      if (error.code !== "ENOENT") {
        console.warn(`Failed to delete logo file: ${logoUrl}`, error);
      }
    }
  }

  const deleted = await deleteLevelConfig(levelNumber);
  if (!deleted) {
    return res.status(404).json({
      message: "Level not found.",
    });
  }

  return res.json({ level: deleted });
});

module.exports = router;


