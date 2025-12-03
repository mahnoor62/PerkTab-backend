const express = require("express");
const router = express.Router();
const { getCurrentAdmin } = require("../lib/auth");
const {
  getAllLevelConfigs,
  getLevelConfig,
  getLevelConfigById,
  createLevelConfig,
  updateLevelConfig,
  updateLevelConfigById,
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
  try {
    console.log(`[Levels API] GET /api/levels - Request from: ${req.admin.email}`);
    const levels = await getAllLevelConfigs();
    
    console.log(`[Levels API] Found ${levels.length} levels in database`);
    
    if (!Array.isArray(levels)) {
      console.error(`[Levels API] ERROR: getAllLevelConfigs did not return an array:`, typeof levels, levels);
      return res.status(500).json({ 
        message: "Internal server error: Invalid response from database",
        error: "Database query returned non-array result"
      });
    }
    
    // Log if empty but don't throw error - empty array is valid if no levels exist
    if (levels.length === 0) {
      console.warn(`[Levels API] WARNING: Database returned empty array. This might indicate:`);
      console.warn(`  - No levels created yet in database`);
      console.warn(`  - Database connection issue`);
      console.warn(`  - Wrong database being queried`);
    } else {
      console.log(`[Levels API] Successfully returning ${levels.length} levels`);
    }
    
    return res.json({ levels });
  } catch (error) {
    console.error(`[Levels API] ERROR in GET /api/levels:`, error);
    console.error(`[Levels API] Error stack:`, error.stack);
    return res.status(500).json({ 
      message: "Failed to fetch levels from database",
      error: error.message || "Unknown error"
    });
  }
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

// IMPORTANT: ID-based routes must come BEFORE :level routes to avoid route conflicts

// Update a level by ID (supports partial updates) - MUST BE BEFORE /:level route
router.put("/id/:id", requireAuth, async (req, res) => {
  try {
    const levelId = req.params.id;
    const payload = req.body;
    
    console.log(`[Levels API] PUT /api/levels/id/${levelId} - Partial update`, {
      fields: Object.keys(payload),
      colors: payload.colors?.length || 0,
      dotSizes: payload.dotSizes?.length || 0,
      dots: payload.dots?.length || 0,
    });

    // Get current level to check for old logo
    const currentLevel = await getLevelConfigById(levelId);
    if (!currentLevel) {
      return res.status(404).json({ message: "Level not found." });
    }

    // Delete old logo file if logoUrl is being changed or cleared
    if (payload.logoUrl !== undefined) {
      const oldLogoUrl = currentLevel.logoUrl;
      const newLogoUrl = payload.logoUrl ?? "";

      if (oldLogoUrl && oldLogoUrl !== newLogoUrl && oldLogoUrl.startsWith("/uploads/")) {
        try {
          const oldFilePath = path.join(__dirname, "..", "uploads", oldLogoUrl.replace("/uploads/", ""));
          await fs.unlink(oldFilePath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.warn(`Failed to delete old logo file: ${oldLogoUrl}`, error);
          }
        }
      }
    }

    // Validate only the fields that are being updated
    if (payload.background !== undefined && typeof payload.background !== "string") {
      return res.status(400).json({
        message: "Field background must be a string.",
      });
    }

    if (payload.colors !== undefined) {
      if (!Array.isArray(payload.colors)) {
        return res.status(400).json({
          message: "Field colors must be an array.",
        });
      }
      const validColors = payload.colors.filter((c) => c != null);
      for (let i = 0; i < validColors.length; i++) {
        const colorItem = validColors[i];
        if (!colorItem || typeof colorItem.color !== "string" || colorItem.color === "") {
          return res.status(400).json({
            message: `Color at index ${i} must have color as a non-empty string.`,
          });
        }
      }
    }

    if (payload.dotSizes !== undefined) {
      if (!Array.isArray(payload.dotSizes)) {
        return res.status(400).json({
          message: "Field dotSizes must be an array.",
        });
      }
      const validSizes = payload.dotSizes.filter((s) => s != null);
      for (let i = 0; i < validSizes.length; i++) {
        const sizeItem = validSizes[i];
        if (!sizeItem || typeof sizeItem.size !== "string" || sizeItem.size === "") {
          return res.status(400).json({
            message: `Dot size at index ${i} must have size as a non-empty string.`,
          });
        }
      }
    }

    if (payload.dots !== undefined) {
      if (!Array.isArray(payload.dots)) {
        return res.status(400).json({
          message: "Field dots must be an array.",
        });
      }
      const validDots = payload.dots.filter((dot) => dot != null);
      for (let i = 0; i < validDots.length; i++) {
        const dot = validDots[i];
        if (!dot || typeof dot.color !== "string" || dot.color === "") {
          return res.status(400).json({
            message: `Dot at index ${i} must have color as a non-empty string.`,
          });
        }
      }
    }

    const updated = await updateLevelConfigById(levelId, payload);

    if (!updated) {
      console.error(`[Levels API] Level with ID ${levelId} not found for update`);
      return res.status(404).json({ message: "Level not found." });
    }

    console.log(`[Levels API] Successfully updated level ${levelId}`);
    return res.json({ level: updated });
  } catch (error) {
    console.error(`[Levels API] ERROR in PUT /api/levels/id/${req.params.id}:`, error);
    console.error(`[Levels API] Error stack:`, error.stack);
    return res.status(500).json({ 
      message: error.message || "Failed to update level.",
      error: error.message || "Unknown error"
    });
  }
});

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
  try {
    const levelNumber = parseLevel(req.params.level);
    if (!levelNumber) {
      return res.status(400).json({ message: "Invalid level." });
    }

    const payload = req.body;
    
    console.log(`[Levels API] PUT /api/levels/${levelNumber} - Updating level`, {
      colors: payload.colors?.length || 0,
      dotSizes: payload.dotSizes?.length || 0,
      dots: payload.dots?.length || 0,
      background: payload.background ? "set" : "not set",
    });
  
  // Background field is optional, but if provided should be a string
  if (payload.background !== undefined && typeof payload.background !== "string") {
    return res.status(400).json({
      message: "Field background must be a string.",
    });
  }

  // Validate colors array
  if (payload.colors !== undefined) {
    if (!Array.isArray(payload.colors)) {
      return res.status(400).json({
        message: "Field colors must be an array.",
      });
    }
    // Filter out null/undefined colors before validation
    const validColors = payload.colors.filter((c) => c != null);
    
    for (let i = 0; i < validColors.length; i++) {
      const colorItem = validColors[i];
      if (!colorItem || typeof colorItem.color !== "string" || colorItem.color === "") {
        return res.status(400).json({
          message: `Color at index ${i} must have color as a non-empty string.`,
        });
      }
      // score is optional, will default to 0 if not provided
    }
  }

  // Validate dotSizes array
  if (payload.dotSizes !== undefined) {
    if (!Array.isArray(payload.dotSizes)) {
      return res.status(400).json({
        message: "Field dotSizes must be an array.",
      });
    }
    // Filter out null/undefined sizes before validation
    const validSizes = payload.dotSizes.filter((s) => s != null);
    
    for (let i = 0; i < validSizes.length; i++) {
      const sizeItem = validSizes[i];
      if (!sizeItem || typeof sizeItem.size !== "string" || sizeItem.size === "") {
        return res.status(400).json({
          message: `Dot size at index ${i} must have size as a non-empty string.`,
        });
      }
      // score is optional, will default to 0 if not provided
    }
  }

  // Validate dots array (color and colorScore)
  if (payload.dots !== undefined) {
    if (!Array.isArray(payload.dots)) {
      return res.status(400).json({
        message: "Field dots must be an array.",
      });
    }
    // Filter out null/undefined dots before validation
    const validDots = payload.dots.filter((dot) => dot != null);
    
    for (let i = 0; i < validDots.length; i++) {
      const dot = validDots[i];
      // Ensure dot exists and has a color field that is a string
      if (!dot || typeof dot.color !== "string" || dot.color === "") {
        return res.status(400).json({
          message: `Dot at index ${i} must have color as a non-empty string.`,
        });
      }
      // colorScore is optional, will default to calculated value if not provided
    }
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
      console.error(`[Levels API] Level ${levelNumber} not found for update`);
      return res.status(404).json({ message: "Level not found." });
    }

    console.log(`[Levels API] Successfully updated level ${levelNumber}`);
    return res.json({ level: updated });
  } catch (error) {
    console.error(`[Levels API] ERROR in PUT /api/levels/${req.params.level}:`, error);
    console.error(`[Levels API] Error stack:`, error.stack);
    return res.status(500).json({ 
      message: error.message || "Failed to update level.",
      error: error.message || "Unknown error"
    });
  }
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


