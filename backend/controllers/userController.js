// controllers/userController.js

const User = require("../models/User");

// @desc   Get logged-in user's profile
// @route  GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    // req.user was already set by the protect middleware
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Update logged-in user's profile
// @route  PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update fields that were actually sent
    user.name = req.body.name || user.name;
    user.college = req.body.college || user.college;
    user.phone = req.body.phone || user.phone;
    user.profileImage = req.body.profileImage || user.profileImage;

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      college: updatedUser.college,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getProfile, updateProfile };