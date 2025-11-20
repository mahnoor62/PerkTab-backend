const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const LevelConfig = require("../models/LevelConfig");
const { connectToDatabase } = require("./db");

let hasSeeded = global._dotbackSeeded || false;

const DEFAULT_ADMIN = {
  email: "admin@dotback.com",
  password: "dotback123",
  name: "DotBack Admin",
};

async function ensureSeedData() {
  if (hasSeeded) {
    return;
  }

  await connectToDatabase();

  // Seed Admin
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 12);
    await Admin.create({
      email: DEFAULT_ADMIN.email,
      passwordHash,
      name: DEFAULT_ADMIN.name,
    });
  }

  // Seed Levels (1-10) if database is empty
  const levelsCount = await LevelConfig.countDocuments();
  if (levelsCount === 0) {
    const defaultLevels = [];
    for (let i = 1; i <= 10; i++) {
      defaultLevels.push({
        level: i,
        backgroundColor: "#f4f9ff",
        dot1Color: "#5ac8fa",
        dot2Color: "#8ad4ff",
        dot3Color: "#a8e6ff",
        dot4Color: "#c4f0ff",
        dot5Color: "#e2f8ff",
        logoUrl: "",
      });
    }
    await LevelConfig.insertMany(defaultLevels);
  }

  global._dotbackSeeded = true;
  hasSeeded = true;
}

function getDefaultAdminCredentials() {
  return {
    email: DEFAULT_ADMIN.email,
    password: DEFAULT_ADMIN.password,
  };
}

module.exports = { ensureSeedData, getDefaultAdminCredentials };


