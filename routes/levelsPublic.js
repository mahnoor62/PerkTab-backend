const express = require("express");
const router = express.Router();
const LevelConfig = require("../models/LevelConfig");

router.get("/", async (req, res) => {
  try {
    const levels = await LevelConfig.find()
      .sort({ level: 1 })
      .select(
        "level backgroundColor dot1Color dot2Color dot3Color dot4Color dot5Color logoUrl createdAt updatedAt"
      )
      .lean();

    return res.json({
      levels,
      count: levels.length,
    });
  } catch (error) {
    console.error("[Levels Public API] Failed to fetch levels:", error);
    return res.status(500).json({
      message: "Unable to fetch levels",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;


