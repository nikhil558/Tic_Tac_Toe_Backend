const express = require("express");
const User = require("../Model/user");
const bcrypt = require("bcrypt");
const userRouter = express.Router();
const { validateSignUpData } = require("../Utills/validation");

userRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req); // Validate input data
    const { firstName, lastName, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Store the hashed password
    });

    const data = await newUser.save();
    const token = await newUser.getJWT(); // Generate JWT token
    res.cookie("Tic-Tac-Toe", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // 🔑 HTTPS only in prod
      sameSite: process.env.NODE_ENV !== "development" ? "None" : "Lax",
      expires: new Date(Date.now() + 24 * 3600000), // Set cookie expiration to 1 day
    });

    res
      .status(201)
      .json({ response: data, message: "User signed up successfully" });
  } catch (error) {
    console.log("Error signing up user:", error);
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = await user.getJWT();
    res.cookie("Tic-Tac-Toe", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development", // 🔑 HTTPS only in prod
      sameSite: process.env.NODE_ENV !== "development" ? "None" : "Lax",
      expires: new Date(Date.now() + 24 * 3600000),
    });
    res
      .status(200)
      .json({ response: user, message: "User signed in successfully" });
  } catch (error) {
    console.log("Error signing in user:", error);
  }
});

userRouter.post("/signout", (req, res) => {
  res.cookie("Tic-Tac-Toe", null, {
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "User signed out successfully" });
});

module.exports = userRouter;
