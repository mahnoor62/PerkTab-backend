const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

function normalizeLevel(level) {
  return Number(level);
}

async function getAllLevelConfigs() {
  try {
    console.log("[Levels Lib] Starting getAllLevelConfigs()");
    await ensureSeedData();
    const dbConnection = await connectToDatabase();
    
    console.log("[Levels Lib] Database connection established");
    console.log("[Levels Lib] Database name:", dbConnection.connection.name);
    console.log("[Levels Lib] Collection name: levelconfigs");
    
    // Check collection count before query
    const collection = dbConnection.connection.db.collection("levelconfigs");
    const count = await collection.countDocuments();
    console.log(`[Levels Lib] Total documents in levelconfigs collection: ${count}`);
    
    console.log("[Levels Lib] Querying LevelConfig collection...");
    const levels = await LevelConfig.find().sort({ level: 1 }).lean();
    
    console.log(`[Levels Lib] Database query returned ${levels.length} documents`);
    console.log(`[Levels Lib] Collection count vs query result: ${count} vs ${levels.length}`);
    
    if (count > 0 && levels.length === 0) {
      console.error("[Levels Lib] CRITICAL: Collection has documents but query returned empty!");
      console.error("[Levels Lib] This might indicate:");
      console.error("  - Wrong collection name");
      console.error("  - Wrong database");
      console.error("  - Schema mismatch");
      throw new Error(`Database inconsistency: Collection has ${count} documents but query returned empty array`);
    }
    
    if (!Array.isArray(levels)) {
      console.error("[Levels Lib] ERROR: LevelConfig.find() did not return an array!");
      throw new Error("Database query failed: Expected array but got " + typeof levels);
    }
    
    const mappedLevels = levels.map((level) => {
      if (!level || !level._id) {
        console.error("[Levels Lib] ERROR: Invalid level document:", level);
        throw new Error("Invalid level document found in database");
      }
      return {
        ...level,
        _id: level._id.toString(),
      };
    });
    
    console.log(`[Levels Lib] Successfully processed ${mappedLevels.length} levels`);
    return mappedLevels;
  } catch (error) {
    console.error("[Levels Lib] ERROR in getAllLevelConfigs():", error);
    console.error("[Levels Lib] Error stack:", error.stack);
    throw error;
  }
}

async function getLevelConfig(levelNumber) {
  await ensureSeedData();
  await connectToDatabase();
  const level = await LevelConfig.findOne({ level: levelNumber }).lean();
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

  const levelNumber = normalizeLevel(payload.level);

  if (
    !Number.isInteger(levelNumber) ||
    levelNumber < 1 ||
    levelNumber > 10
  ) {
    throw new Error("Level must be an integer between 1 and 10.");
  }

  const existing = await LevelConfig.findOne({ level: levelNumber }).lean();
  if (existing) {
    throw new Error(`Level ${levelNumber} already exists.`);
  }

  const created = await LevelConfig.create({
    level: levelNumber,
    backgroundColor: payload.backgroundColor ?? undefined,
    dot1Color: payload.dot1Color ?? undefined,
    dot2Color: payload.dot2Color ?? undefined,
    dot3Color: payload.dot3Color ?? undefined,
    dot4Color: payload.dot4Color ?? undefined,
    dot5Color: payload.dot5Color ?? undefined,
    logoUrl: payload.logoUrl ?? undefined,
  });

  const level = created.toObject();
  return {
    ...level,
    _id: level._id.toString(),
  };
}

async function updateLevelConfig(levelNumber, payload) {
  await ensureSeedData();
  await connectToDatabase();
  const sanitizedPayload = {
    backgroundColor: payload.backgroundColor,
    dot1Color: payload.dot1Color,
    dot2Color: payload.dot2Color,
    dot3Color: payload.dot3Color,
    dot4Color: payload.dot4Color,
    dot5Color: payload.dot5Color,
    logoUrl: payload.logoUrl ?? "",
  };

  const updated = await LevelConfig.findOneAndUpdate(
    { level: levelNumber },
    { $set: sanitizedPayload },
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
    level: levelNumber,
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


