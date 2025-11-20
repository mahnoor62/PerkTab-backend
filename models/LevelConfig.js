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

// Static method to ensure default 10 levels exist
LevelConfigSchema.statics.ensureDefaultLevels = async function () {
  const count = await this.countDocuments();
  
  if (count === 0) {
    const defaultLevels = [
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
    await this.insertMany(defaultLevels);
  }
};

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);


