
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


require("./lib/db").connectToDatabase();
const allowedOrigins = process.env.CORS_OPTIONS
  ? process.env.CORS_OPTIONS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server-side
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ VERY IMPORTANT (preflight fix)
app.options("*", cors());


// const corsOrigins = process.env.CORS_OPTIONS
//   ? process.env.CORS_OPTIONS.split(",")
//   : ["*"];

// app.use(
//   cors({
//     origin: corsOrigins,
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// );


app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));


app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/auth", require("./routes/auth"));
app.use("/api/levels", require("./routes/levels"));
app.use("/api/get/levels", require("./routes/levelsPublic"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/shop", require("./routes/shop"));
app.use("/api/products", require("./routes/products"));


app.get("/", (req, res) => {
  res.status(200).send("Server is running.");
});


module.exports = app;
