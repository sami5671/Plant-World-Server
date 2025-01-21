const { apiResponse } = require("../../helpers");
const Cart = require("../../models/cart");

const addToCart = async (req, res, next) => {
  try {
    const { user, plants } = req.body;
    const plantToAdd = plants[0];

    // find the cart for the user
    let cart = await Cart.findOne({ user });

    if (cart) {
      const existingPlantIndex = cart.plants.findIndex(
        (item) => item.plant.toString() === plantToAdd.plant
      );

      if (existingPlantIndex !== -1) {
        // increase the existing plant quantity
        cart.plants[existingPlantIndex].quantity += plantToAdd.quantity;
      } else {
        // add it to the plants array
        cart.plants.push(plantToAdd);
      }
      // save the updated cart
      await cart.save();
      return apiResponse(res, 200, true, "Added to Cart successfully");
    } else {
      const newCart = new Cart(req.body);
      await newCart.save();
      return apiResponse(res, 200, true, "Added to Cart successfully");
    }
  } catch (error) {
    return apiResponse(res, 500, false, "Adding cart Error");
  }
};

module.exports = {
  addToCart,
};
