const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const { connectToDatabase } = require("../lib/db");
const LevelConfig = require("../models/LevelConfig");

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

async function seedLevels() {
  await connectToDatabase();
  const existingCount = await LevelConfig.countDocuments();

  if (existingCount > 0) {
    console.log(`Levels already exist (${existingCount} docs). No changes made.`);
    mongoose.connection.close();
    return;
  }

  await LevelConfig.insertMany(DEFAULT_LEVELS);
  console.log("Inserted default 10 levels.");
  mongoose.connection.close();
}

seedLevels().catch((err) => {
  console.error("Seed failed:", err);
  mongoose.connection.close();
  process.exit(1);
});


