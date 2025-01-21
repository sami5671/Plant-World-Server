// external imports
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// internal imports
const User = require("../../models/users");
const { apiResponse } = require("../../helpers");

// User registration(signUp)
const signUp = async (req, res, next) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 15);
  try {
    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });
    await newUser.save();

    // find user by email
    const user = await User.findOne({ email: req.body.email });

    const userObject = {
      userId: user._id,
      userName: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      mobile: user.mobile,
      createdAt: user.createdAt,
    };

    // Generate token
    const token = jwt.sign(userObject, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    return apiResponse(res, 200, true, "Successfully registered!!", {
      data: userObject,
      token,
    });
  } catch (error) {
    return apiResponse(res, 500, false, "UnKnown Error during registration!!");
  }
};

const login = async (req, res, next) => {
  console.log(req.body);
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return apiResponse(res, 404, false, "User not found!!");
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);

    if (!isMatch) {
      return apiResponse(res, 401, false, "Invalid Email or Password!!");
    } else {
      console.log("else block");
      const userObject = {
        userId: user._id,
        userName: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mobile: user.mobile,
        createdAt: user.createdAt,
      };

      // Generate token
      const token = jwt.sign(userObject, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });

      // Set cookie
      res.cookie(process.env.COOKIE_NAME, token, {
        maxAge: parseInt(process.env.JWT_EXPIRY, 10), // Ensure maxAge is a number
        httpOnly: true,
        signed: true,
      });

      return apiResponse(res, 200, true, "Successfully logged in!!", {
        data: userObject,
        token,
      });
    }
  } catch (error) {
    console.error(error); // Log the actual error for debugging
    return apiResponse(res, 500, false, "Unknown error during login!!");
  }
};

module.exports = {
  signUp,
  login,
};
