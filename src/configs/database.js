const mongoose = require("mongoose");

const connectToDatabase = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
