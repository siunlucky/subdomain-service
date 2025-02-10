const mongoose = require('mongoose');
require('dotenv').config();
const { errorLogs } = require('../utils/logging');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected...");
    } catch (error) {
        errorLogs(error.message);
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
