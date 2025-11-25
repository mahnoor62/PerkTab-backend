const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");

// ✅ Hamesha DB se jo hai wohi return karo
async function getAllLevelConfigs() {
  await connectToDatabase();

  const levels = await LevelConfig.find().sort({ level: 1 }).lean();

  return levels.map((level) => ({
    ...level,
    _id: level._id.toString(),
  }));
}

// ✅ Ek specific level read (sirf agar exist karta ho)
async function getLevelConfig(levelNumber) {
  await connectToDatabase();

  const level = await LevelConfig.findOne({
    level: Number(levelNumber),
  }).lean();

  if (!level) return null;

  return {
    ...level,
    _id: level._id.toString(),
  };
}

// ✅ "Add level" → backend 1–10 me se next free level choose kare
async function createLevelConfig(payload = {}) {
  await connectToDatabase();

  // sab existing levels ka list
  const existing = await LevelConfig.find({}, { level: 1 }).lean();
  const used = new Set(existing.map((l) => l.level));

  // 1 se 10 tak first free level number
  let levelNumber = null;
  for (let i = 1; i <= 10; i++) {
    if (!used.has(i)) {
      levelNumber = i;
      break;
    }
  }

  if (!levelNumber) {
    throw new Error("All 10 levels already exist.");
  }

  const created = await LevelConfig.create({
    level: levelNumber,
    backgroundColor: payload.backgroundColor ?? "",
    dot1Color: payload.dot1Color ?? "",
    dot2Color: payload.dot2Color ?? "",
    dot3Color: payload.dot3Color ?? "",
    dot4Color: payload.dot4Color ?? "",
    dot5Color: payload.dot5Color ?? "",
    logoUrl: payload.logoUrl ?? "",
  });

  return {
    ...created.toObject(),
    _id: created._id.toString(),
  };
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
        dot1Color: payload.dot1Color ?? "",
        dot2Color: payload.dot2Color ?? "",
        dot3Color: payload.dot3Color ?? "",
        dot4Color: payload.dot4Color ?? "",
        dot5Color: payload.dot5Color ?? "",
        logoUrl: payload.logoUrl ?? "",
      },
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) return null;

  return {
    ...updated,
    _id: updated._id.toString(),
  };
}

async function deleteLevelConfig(levelNumber) {
  await connectToDatabase();

  const deleted = await LevelConfig.findOneAndDelete({
    level: Number(levelNumber),
  }).lean();

  if (!deleted) return null;

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
