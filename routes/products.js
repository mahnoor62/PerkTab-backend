const express = require("express");
const router = express.Router();
const ShopItem = require("../models/ShopItem");

router.get("/", async (req, res) => {
  try {
    const items = await ShopItem.find().sort({ createdAt: -1 }).lean();

    return res.json({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("[Products API] Failed to fetch products:", error);
    return res.status(500).json({
      message: "Unable to fetch products",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;


