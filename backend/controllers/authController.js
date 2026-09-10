
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @desc   Register a new user
// @route  POST /api/auth/register
const registerUser = async (req, res) => {
    try {
    const { name, email, password, confirmPassword, college, phone } = req.body;

    // 1. Basic validation
    if (!name || !email || !password || !confirmPassword || !college || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
    }

    // 3. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user in the database
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        college,
        phone,
    });

    // 5. Send response (never send back the password, even hashed)
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        phone: user.phone,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Login an existing user
// @route  POST /api/auth/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate a JWT
    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    // 5. Send the token and safe user info back
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        token,
    });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { registerUser, loginUser };