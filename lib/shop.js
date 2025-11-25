const ShopItem = require("../models/ShopItem");

async function getAllShopItems() {
  const items = await ShopItem.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  return items;
}

async function getAllShopItemsAdmin() {
  const items = await ShopItem.find().sort({ createdAt: -1 }).lean();
  return items;
}

async function getShopItemById(id) {
  const item = await ShopItem.findById(id).lean();
  return item;
}

async function createShopItem(payload) {
  const item = await ShopItem.create(payload);
  return item.toObject();
}

async function updateShopItem(id, payload) {
  const item = await ShopItem.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  return item;
}

async function deleteShopItem(id) {
  const item = await ShopItem.findByIdAndDelete(id).lean();
  return item;
}

module.exports = {
  getAllShopItems,
  getAllShopItemsAdmin,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem,
};

