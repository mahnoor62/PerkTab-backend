const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");
const { ensureSeedData } = require("./seed");

function normalizeLevel(level) {
  return Number(level);
}

async function getAllLevelConfigs() {
  await ensureSeedData();
  await connectToDatabase();
  const levels = await LevelConfig.find().sort({ level: 1 }).lean();
  return levels.map((level) => ({
    ...level,
    _id: level._id.toString(),
  }));
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


