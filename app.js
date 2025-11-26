// const express = require('express');
// const app = express();
// const cors = require('cors');


// require('dotenv').config();
// require('./database/connection').connect();



// const CORS_OPTIONS = process.env.CORS_OPTIONS;
// let corsOrigins = [];
// if (CORS_OPTIONS) {
//     corsOrigins = CORS_OPTIONS.split(',')
// }

// const corsOptions = {
//     origin: corsOrigins,
//     optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));




// // 🔹 AFTER webhook
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// // static files
// app.use(express.static(__dirname + '/public'));

// const uploadsDir = path.join(__dirname, "uploads");








// const authRoutes = require("./routes/auth");
// const levelsRoutes = require("./routes/levels");
// const uploadRoutes = require("./routes/upload");
// const shopRoutes = require("./routes/shop");
// const productRoutes = require("./routes/products");
// const publicLevelsRoutes = require("./routes/levelsPublic");






// app.use("/uploads", express.static(uploadsDir));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/levels", levelsRoutes);
// app.use("/api/get/levels", publicLevelsRoutes);
// app.use("/api/upload", uploadRoutes);
// app.use("/api/shop", shopRoutes);
// app.use("/api/products", productRoutes);













// app.get('/', (req, res) => {
//     res.status(200).send('Server is running.')
// });

// module.exports = app;

// -------------------------------
// Imports
// -------------------------------
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();


require("./lib/db").connect();


const corsOrigins = process.env.CORS_OPTIONS
  ? process.env.CORS_OPTIONS.split(",")
  : ["*"];

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);


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
