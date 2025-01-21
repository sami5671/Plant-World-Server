const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    previousPrice: {
      type: String,
      trim: true,
    },
    newPrice: {
      type: String,
      required: true,
    },
    stock: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    plantType: {
      type: String,
      required: true,
    },
    material: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        _id: false,
        publicId: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Plant = mongoose.model("Plant", plantSchema);

module.exports = Plant;
