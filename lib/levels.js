const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

async function getAllLevelConfigs() {
  await ensureSeedData();
  await connectToDatabase();
  
  // Get all levels from database exactly as they are stored (no auto-create)
  const levels = await LevelConfig.find().sort({ level: 1 }).lean();
  
  // Return exactly what's in database - no modification, no auto-create
  return levels.map((level) => ({
    ...level,
    _id: level._id.toString(),
  }));
}

async function getLevelConfig(levelNumber) {
  await ensureSeedData();
  await connectToDatabase();
  
  // Get level from database (no auto-create)
  const level = await LevelConfig.findOne({ level: Number(levelNumber) }).lean();
  if (!level) {
    return null;
  }
  
  return {
    ...level,
    _id: level._id.toString(),
  };
}

async function createLevelConfig(payload) {
  await ensureSeedData();
  await connectToDatabase();

  const levelNumber = Number(payload.level);

  if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
    throw new Error("Level must be an integer between 1 and 10.");
  }

  const existing = await LevelConfig.findOne({ level: levelNumber }).lean();
  if (existing) {
    throw new Error(`Level ${levelNumber} already exists.`);
  }

  const created = await LevelConfig.create({
    level: levelNumber,
    backgroundColor: payload.backgroundColor,
    dot1Color: payload.dot1Color,
    dot2Color: payload.dot2Color,
    dot3Color: payload.dot3Color,
    dot4Color: payload.dot4Color,
    dot5Color: payload.dot5Color,
    logoUrl: payload.logoUrl,
  });

  return {
    ...created.toObject(),
    _id: created._id.toString(),
  };
}

async function updateLevelConfig(levelNumber, payload) {
  await ensureSeedData();
  await connectToDatabase();
  
  const levelNumberInt = Number(levelNumber);
  
  // Check if level exists, if not return null (no auto-create)
  const exists = await LevelConfig.findOne({ level: levelNumberInt }).lean();
  if (!exists) {
    return null; // Level not found - must be created first using Add Level button
  }
  
  // Update the level in database
  const updated = await LevelConfig.findOneAndUpdate(
    { level: levelNumberInt },
    {
      $set: {
        backgroundColor: payload.backgroundColor,
        dot1Color: payload.dot1Color,
        dot2Color: payload.dot2Color,
        dot3Color: payload.dot3Color,
        dot4Color: payload.dot4Color,
        dot5Color: payload.dot5Color,
        logoUrl: payload.logoUrl || "",
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    return null;
  }

  // Return exactly what's stored in database after update
  return {
    ...updated,
    _id: updated._id.toString(),
  };
}

async function deleteLevelConfig(levelNumber) {
  await ensureSeedData();
  await connectToDatabase();

  const deleted = await LevelConfig.findOneAndDelete({
    level: Number(levelNumber),
  }).lean();

  if (!deleted) {
    return null;
  }

  return {
    ...deleted,
    _id: deleted._id.toString(),
  };
}

module.exports = {
  getAllLevelConfigs,
  getLevelConfig,
  createLevelConfig,
  updateLevelConfig,
  deleteLevelConfig,
};
