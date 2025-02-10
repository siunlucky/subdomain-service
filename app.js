const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());

// API list
app.use("/api/users", require("./routers/userRouters/user"));
//http://localhost:3876/api/users/ 

module.exports = app;
