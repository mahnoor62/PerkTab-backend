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
    backgroundColor: { type: String, default: "" },
    dot1Color: { type: String, default: "" },
    dot2Color: { type: String, default: "" },
    dot3Color: { type: String, default: "" },
    dot4Color: { type: String, default: "" },
    dot5Color: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);
