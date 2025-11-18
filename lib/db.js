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
    console.log("[DB] Using cached database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[DB] Creating new database connection...");
    console.log("[DB] MONGO_URL:", mongoUrl ? mongoUrl.replace(/\/\/.*@/, "//***:***@") : "NOT SET");
    cached.promise = mongoose
      .connect(mongoUrl, {
        bufferCommands: false,
        maxPoolSize: 5,
      })
      .then((mongooseInstance) => {
        console.log("[DB] Connected to MongoDB successfully");
        console.log("[DB] Database name:", mongooseInstance.connection.name);
        console.log("[DB] Database ready state:", mongooseInstance.connection.readyState);
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("[DB] Connection error:", error);
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectToDatabase };


