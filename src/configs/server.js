// External imports
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv/config");

// Internal imports
const connectToDatabase = require("./database");
const errorMiddleware = require("../middlewares/errorMiddleware");
const { apiResponse } = require("../helpers");
const { config } = require("../configs/config");
const authenticationRoute = require("../routes/authenticationRoute");
const plantRoute = require("../routes/plantRoute");
const userRoute = require("../routes/usersRoute");

// Create app instance
const app = express();
const env = process.env.NODE_ENV || "development";

// Middleware
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(config[env].corsOptions));
app.use(express.json({ limit: "100kb" }));

// Connect to MongoDB
connectToDatabase(config[env].databaseURI);

// routing setup
app.use("/auth", authenticationRoute);
app.use("/plant", plantRoute);
app.use("/user", userRoute);

// Home route
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to Plant World!" });
});

// 404 route
app.use((req, res, next) => {
  return apiResponse(res, 404, false, "This route does not exist!");
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
