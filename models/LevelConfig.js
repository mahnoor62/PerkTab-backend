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
    colors: {
      type: [
        {
          color: { type: String, required: true },
          score: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
        },
      ],
      default: [],
    },
    dotSizes: {
      type: [
        {
          size: { type: String, required: true },
          score: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
        },
      ],
      default: [],
    },
    dots: {
      type: [
        {
          color: { type: String, default: null },
          colorScore: { 
            type: Number, 
            default: 0,
            set: (v) => typeof v === 'string' ? parseInt(v, 10) || 0 : (typeof v === 'number' ? v : 0)
          },
        },
      ],
      default: [],
    },
    logoUrl: { type: String, default: null },
    useDefaultColors: {
      type: String,
      enum: ['default', 'custom'],
      default: 'default',
    },
    useDefaultDotSizes: {
      type: String,
      enum: ['default', 'custom'],
      default: 'default',
    },
  },
  { timestamps: true, strict: true }
);

module.exports =
  mongoose.models.LevelConfig || mongoose.model("LevelConfig", LevelConfigSchema);
