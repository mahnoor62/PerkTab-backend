const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShopItemSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    coins: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    redeemCodes: {
      type: [String],
      default: [],
    },
    redeemCodeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["unused", "used"],
      default: "unused",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ShopItem || mongoose.model("ShopItem", ShopItemSchema);

