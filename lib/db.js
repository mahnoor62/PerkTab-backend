const mongoose = require("mongoose");

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/DotBack";

if (!MONGO_URL) {
  throw new Error("Missing MONGO_URL environment variable");
}

let cached = global._dotbackMongoose;

if (!cached) {
  cached = global._dotbackMongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URL, {
        bufferCommands: false,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };


