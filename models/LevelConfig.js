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
    dots: {
      type: [
        {
          color: { type: String, default: "" },
          size: { type: String, default: "" },
          score: { type: String, default: "" },
        },
      ],
      default: [],
    },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);
