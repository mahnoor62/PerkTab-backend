const express = require("express");
const router = express.Router();
const { getAllLevelConfigs } = require("../lib/levels");

router.get("/", async (req, res) => {
  try {
    const levels = await getAllLevelConfigs();

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


