const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

async function getAllLevelConfigs() {
  await ensureSeedData();
  await connectToDatabase();
  
  // Ensure default 10 levels exist (only creates missing ones, won't touch edited levels)
  await LevelConfig.ensureDefaultLevels();
  
  // Get all levels from database (this will return edited levels if they exist)
  const levels = await LevelConfig.find().sort({ level: 1 }).lean();
  
  if (!Array.isArray(levels)) {
    throw new Error("Database query failed: Expected array");
  }
  
  // Must return exactly 10 levels (1-10), use defaults for missing ones
  const levelsMap = new Map();
  levels.forEach((level) => {
    levelsMap.set(level.level, {
      ...level,
      _id: level._id.toString(),
    });
  });
  
  // Ensure all 10 levels are returned
  const result = [];
  for (let i = 1; i <= 10; i++) {
    const level = levelsMap.get(i);
    if (level) {
      result.push(level);
    } else {
      // This shouldn't happen if ensureDefaultLevels worked, but fallback
      const defaultLevel = {
        level: i,
        backgroundColor: "#f4f9ff",
        dot1Color: "#5ac8fa",
        dot2Color: "#8ad4ff",
        dot3Color: "#a8e6ff",
        dot4Color: "#c4f0ff",
        dot5Color: "#e2f8ff",
        logoUrl: "",
        _id: `temp-${i}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      result.push(defaultLevel);
    }
  }
  
  return result;
}

async function getLevelConfig(levelNumber) {
  await ensureSeedData();
  await connectToDatabase();
  
  // Ensure default 10 levels exist in database
  await LevelConfig.ensureDefaultLevels();
  
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

  // Ensure default 10 levels exist in database
  await LevelConfig.ensureDefaultLevels();

  const updated = await LevelConfig.findOneAndUpdate(
    { level: Number(levelNumber) },
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


