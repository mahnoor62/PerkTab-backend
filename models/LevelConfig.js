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
    background: { type: String, default: null },
    dots: {
      type: [
        {
          color: { type: String, default: null },
          size: { type: String, default: null },
          sizeScore: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
          colorScore: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
          totalScore: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
        },
      ],
      default: [],
    },
    logoUrl: { type: String, default: null },
  },
  { timestamps: true, strict: true }
);

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);
