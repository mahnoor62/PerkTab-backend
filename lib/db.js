const mongoose = require("mongoose");

const mongoUrl = process.env.MONGO_URL;

if (!mongoUrl) {
  throw new Error(
    "Missing MONGO_URL environment variable. Define it in backend/.env before starting the server."
  );
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
      .connect(mongoUrl, {
        bufferCommands: false,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };


