const mongoose = require('mongoose');

const {MONGO_URL} = process.env;

exports.connectToDatabase = () => {
    // Connecting to the database
    mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("Successfully connected to database");
        })
        .catch((error) => {
            console.log("database connection failed.");
            console.error(error.message);
            process.exit(1);
        });

}