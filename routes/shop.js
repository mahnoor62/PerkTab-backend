const express = require("express");
const router = express.Router();
const { getCurrentAdmin } = require("../lib/auth");
const {
  getAllShopItems,
  getAllShopItemsAdmin,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem,
} = require("../lib/shop");
const path = require("path");
const fs = require("fs").promises;

function sanitizeRedeemCodes(codes) {
  if (!Array.isArray(codes)) return null;
  const normalized = codes
    .map(code => (typeof code === "string" ? code.trim() : ""))
    .filter(Boolean);
  return Array.from(new Set(normalized));
}

async function requireAuth(req, res, next) {
  const admin = await getCurrentAdmin(req);
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.admin = admin;
  next();
}

router.get("/", async (req, res) => {
  try {
    const items = await getAllShopItems();
    return res.json({ items });
  } catch (error) {
    console.error("[Shop API] Error fetching items:", error);
    return res.status(500).json({
      message: "Failed to fetch shop items",
      error: error.message || "Unknown error",
    });
  }
});

router.get("/admin", requireAuth, async (req, res) => {
  try {
    const items = await getAllShopItemsAdmin();
    return res.json({ items });
  } catch (error) {
    console.error("[Shop API] Error fetching items:", error);
    return res.status(500).json({
      message: "Failed to fetch shop items",
      error: error.message || "Unknown error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await getShopItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }
    return res.json({ item });
  } catch (error) {
    console.error("[Shop API] Error fetching item:", error);
    return res.status(500).json({
      message: "Failed to fetch shop item",
      error: error.message || "Unknown error",
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = req.body;
    
    console.log("Shop item creation request payload:", {
      name: payload.name,
      description: payload.description,
      imageUrl: payload.imageUrl,
      coins: payload.coins,
      isActive: payload.isActive,
    });

    if (!payload.name || typeof payload.name !== "string") {
      return res.status(400).json({
        message: "Item name is required.",
      });
    }

    if (typeof payload.coins !== "number" || payload.coins < 0) {
      return res.status(400).json({
        message: "Coins must be a non-negative number.",
      });
    }

    if (payload.redeemCodes !== undefined && !Array.isArray(payload.redeemCodes)) {
      return res.status(400).json({
        message: "Redeem codes must be provided as an array.",
      });
    }

    const redeemCodes = sanitizeRedeemCodes(payload.redeemCodes);

    const itemData = {
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      imageUrl: payload.imageUrl || "",
      coins: payload.coins,
      isActive: payload.isActive !== undefined ? payload.isActive : true,
      redeemCodes: redeemCodes !== null ? redeemCodes : [],
      redeemCodeCount: redeemCodes !== null ? redeemCodes.length : 0,
      status:
        payload.status && ["unused", "used"].includes(payload.status)
          ? payload.status
          : "unused",
    };
    
    console.log("Creating shop item with data:", itemData);

    const item = await createShopItem(itemData);
    
    console.log("Shop item created successfully:", {
      id: item._id,
      name: item.name,
      imageUrl: item.imageUrl,
    });

    return res.status(201).json({ item });
  } catch (error) {
    console.error("[Shop API] Error creating item:", error);
    return res.status(400).json({
      message: error.message || "Unable to create shop item.",
    });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const item = await getShopItemById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const payload = req.body;

    if (payload.name !== undefined && typeof payload.name !== "string") {
      return res.status(400).json({
        message: "Item name must be a string.",
      });
    }

    if (payload.coins !== undefined && (typeof payload.coins !== "number" || payload.coins < 0)) {
      return res.status(400).json({
        message: "Coins must be a non-negative number.",
      });
    }

    const updateData = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.description !== undefined) updateData.description = payload.description?.trim() || "";
    if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl;
    if (payload.coins !== undefined) updateData.coins = payload.coins;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
    if (payload.status !== undefined) {
      if (!["unused", "used"].includes(payload.status)) {
        return res.status(400).json({
          message: "Status must be either 'unused' or 'used'.",
        });
      }
      updateData.status = payload.status;
    }
    if (payload.redeemCodes !== undefined) {
      if (!Array.isArray(payload.redeemCodes)) {
        return res.status(400).json({
          message: "Redeem codes must be provided as an array.",
        });
      }
      const redeemCodes = sanitizeRedeemCodes(payload.redeemCodes);
      if (redeemCodes !== null) {
        updateData.redeemCodes = redeemCodes;
        updateData.redeemCodeCount = redeemCodes.length;
      }
    }

    const oldImageUrl = item.imageUrl;
    const newImageUrl = updateData.imageUrl || item.imageUrl;

    if (oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.startsWith("/uploads/")) {
      try {
        const oldFilePath = path.join(__dirname, "..", "uploads", oldImageUrl.replace("/uploads/", ""));
        await fs.unlink(oldFilePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.warn(`Failed to delete old image file: ${oldImageUrl}`, error);
        }
      }
    }

    const updated = await updateShopItem(req.params.id, updateData);

    if (!updated) {
      return res.status(404).json({ message: "Item not found." });
    }

    return res.json({ item: updated });
  } catch (error) {
    console.error("[Shop API] Error updating item:", error);
    return res.status(400).json({
      message: error.message || "Unable to update shop item.",
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const item = await getShopItemById(req.params.id);
    if (!item) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    const imageUrl = item.imageUrl;
    if (imageUrl && imageUrl.startsWith("/uploads/")) {
      try {
        const imageFilePath = path.join(__dirname, "..", "uploads", imageUrl.replace("/uploads/", ""));
        await fs.unlink(imageFilePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.warn(`Failed to delete image file: ${imageUrl}`, error);
        }
      }
    }

    const deleted = await deleteShopItem(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Item not found.",
      });
    }

    return res.json({ item: deleted });
  } catch (error) {
    console.error("[Shop API] Error deleting item:", error);
    return res.status(500).json({
      message: error.message || "Unable to delete shop item.",
    });
  }
});

module.exports = router;

