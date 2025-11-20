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
      default: "#e6fbff",
    },
    logoUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Hardcoded 10 default levels (level 1 to 10)
const DEFAULT_LEVELS = [
  { level: 1, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 2, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 3, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 4, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 5, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 6, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 7, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 8, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 9, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
  { level: 10, backgroundColor: "#f4f9ff", dot1Color: "#5ac8fa", dot2Color: "#8ad4ff", dot3Color: "#a8e6ff", dot4Color: "#c4f0ff", dot5Color: "#e2f8ff", logoUrl: "" },
];

// Static method: Ensure all 10 levels exist in database (creates only missing ones)
LevelConfigSchema.statics.ensureDefaultLevels = async function () {
  for (let i = 1; i <= 10; i++) {
    const exists = await this.findOne({ level: i }).lean();
    if (!exists) {
      const defaultLevel = DEFAULT_LEVELS.find((l) => l.level === i);
      if (defaultLevel) {
        await this.create(defaultLevel);
      }
    }
  }
};

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);
