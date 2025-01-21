// external imports

// internal imports
const { apiResponse } = require("../../helpers");
const Plant = require("../../models/plants");

const getAllPlants = async (req, res, next) => {
  try {
    const plants = await Plant.find();
    return apiResponse(res, 200, true, "Plants fetched successfully!", plants);
  } catch (error) {
    return apiResponse(res, 500, false, "Error fetching plants.");
  }
};

module.exports = {
  getAllPlants,
};
