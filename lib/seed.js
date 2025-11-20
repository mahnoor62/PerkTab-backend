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


