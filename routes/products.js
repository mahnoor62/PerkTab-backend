const express = require("express");
const router = express.Router();
const ShopItem = require("../models/ShopItem");

router.get("/", async (req, res) => {
  try {
    const items = await ShopItem.find({
      $or: [
        { redeemCodeCount: { $gt: 0 } },
        { status: { $ne: "used" } },
      ],
    })
      .sort({ createdAt: -1 })
      .select("name description imageUrl coins isActive redeemCodeCount status createdAt updatedAt")
      .lean();

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

router.get("/get-redeem-codes/:id", async (req, res) => {
  try {
    const item = await ShopItem.findById(req.params.id)
      .select("name redeemCodes redeemCodeCount isActive")
      .lean();

    if (!item || !item.isActive) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (!Array.isArray(item.redeemCodes) || item.redeemCodes.length === 0) {
      return res.status(404).json({ message: "No redeem codes available." });
    }

    return res.json({
      itemId: item._id,
      name: item.name,
      redeemCodes: item.redeemCodes,
      count: item.redeemCodes.length,
    });
  } catch (error) {
    console.error("[Products API] Failed to fetch redeem codes:", error);
    return res.status(500).json({
      message: "Unable to fetch redeem codes",
      error: error.message || "Unknown error",
    });
  }
});

module.exports = router;


