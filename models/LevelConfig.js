const mongoose = require("mongoose");
const { Schema } = mongoose;

const LevelConfigSchema = new Schema(
  {
    level: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 10,
    },
    backgroundColor: {
      type: String,
      default: "#ffffff",
    },
    dot1Color: {
      type: String,
      default: "#66c2ff",
    },
    dot2Color: {
      type: String,
      default: "#99e6ff",
    },
    dot3Color: {
      type: String,
      default: "#b3f0ff",
    },
    dot4Color: {
      type: String,
      default: "#ccf5ff",
    },
    dot5Color: {
      type: String,
      default: "#e2f8ff",
    },
    logoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);


