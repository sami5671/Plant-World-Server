// external imports

// internal imports
const { apiResponse } = require("../../helpers");
const Plant = require("../../models/plants");

const addPlant = async (req, res, next) => {
  //   console.log(req.body);
  try {
    const newPlant = new Plant(req.body);
    await newPlant.save();
    return apiResponse(res, 201, true, "Plant added successfully!");
  } catch (error) {
    return apiResponse(res, 500, false, "Error adding plant.");
  }
};

module.exports = {
  addPlant,
};
