const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");

// ✅ Hamesha DB se jo hai wohi return karo
async function getAllLevelConfigs() {
  await connectToDatabase();

  const levels = await LevelConfig.find()
    .sort({ level: 1 })
    .lean();

  const result = levels.map((level) => {
    // Explicitly construct response with all fields, ensuring dots is always an array
    const levelObj = {
      _id: level._id.toString(),
      level: level.level,
      backgroundColor: level.backgroundColor || "",
      logoUrl: level.logoUrl || "",
      createdAt: level.createdAt,
      updatedAt: level.updatedAt,
    };
    
    // Always include dots array, even if it doesn't exist in DB
    if (level.dots !== undefined && level.dots !== null && Array.isArray(level.dots)) {
      levelObj.dots = level.dots;
    } else {
      levelObj.dots = [];
    }
    
    return levelObj;
  });
  
  console.log(`[getAllLevelConfigs] Returning ${result.length} levels with dots field`);
  return result;
}

// ✅ Ek specific level read (sirf agar exist karta ho)
async function getLevelConfig(levelNumber) {
  await connectToDatabase();

  const level = await LevelConfig.findOne({
    level: Number(levelNumber),
  })
    .lean();

  if (!level) return null;

  // Explicitly construct response with all fields, ensuring dots is always an array
  return {
    _id: level._id.toString(),
    level: level.level,
    backgroundColor: level.backgroundColor || "",
    logoUrl: level.logoUrl || "",
    createdAt: level.createdAt,
    updatedAt: level.updatedAt,
    dots: Array.isArray(level.dots) ? level.dots : [],
  };
}

// ✅ "Add level" → Check if level number exists, if provided use it, otherwise find next free
async function createLevelConfig(payload = {}) {
  await connectToDatabase();

  // sab existing levels ka list
  const existing = await LevelConfig.find({}, { level: 1 }).lean();
  const used = new Set(existing.map((l) => l.level));

  let levelNumber = null;

  // If level number is provided in payload, check if it already exists
  if (payload.level !== undefined && payload.level !== null) {
    const requestedLevel = Number(payload.level);
    
    // Validate level number
    if (!Number.isInteger(requestedLevel) || requestedLevel < 1 || requestedLevel > 10) {
      throw new Error("Level number must be an integer between 1 and 10.");
    }

    // Check if level already exists
    if (used.has(requestedLevel)) {
      throw new Error(`Level ${requestedLevel} already exists.`);
    }

    levelNumber = requestedLevel;
  } else {
    // If no level number provided, find first free level (1-10)
    for (let i = 1; i <= 10; i++) {
      if (!used.has(i)) {
        levelNumber = i;
        break;
      }
    }

    if (!levelNumber) {
      throw new Error("All 10 levels already exist.");
    }
  }

  const created = await LevelConfig.create({
    level: levelNumber,
    backgroundColor: payload.backgroundColor ?? "",
    dots: Array.isArray(payload.dots) ? payload.dots : [],
    logoUrl: payload.logoUrl ?? "",
  });

  const createdObj = created.toObject();
  const result = {
    ...createdObj,
    _id: createdObj._id.toString(),
  };
  // Ensure dots array is always present
  if (!Array.isArray(result.dots)) {
    result.dots = [];
  }
  return result;
}

// ✅ Sirf existing level update, naya auto-create nahi
async function updateLevelConfig(levelNumber, payload) {
  await connectToDatabase();

  const levelNumberInt = Number(levelNumber);

  const exists = await LevelConfig.findOne({ level: levelNumberInt }).lean();
  if (!exists) return null;

  const updated = await LevelConfig.findOneAndUpdate(
    { level: levelNumberInt },
    {
      $set: {
        backgroundColor: payload.backgroundColor ?? "",
        dots: Array.isArray(payload.dots) ? payload.dots : [],
        logoUrl: payload.logoUrl ?? "",
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;

  const result = {
    ...updated,
    _id: updated._id.toString(),
  };
  // Ensure dots array is always present
  if (!Array.isArray(result.dots)) {
    result.dots = [];
  }
  return result;
}

async function deleteLevelConfig(levelNumber) {
  await connectToDatabase();

  const deleted = await LevelConfig.findOneAndDelete({
    level: Number(levelNumber),
  }).lean();

  if (!deleted) return null;

  const result = {
    ...deleted,
    _id: deleted._id.toString(),
  };
  // Ensure dots array is always present
  if (!Array.isArray(result.dots)) {
    result.dots = [];
  }
  return result;
}

module.exports = {
  getAllLevelConfigs,
  getLevelConfig,
  createLevelConfig,
  updateLevelConfig,
  deleteLevelConfig,
};
