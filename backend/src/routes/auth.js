/**
 * ROUTES/AUTH
 *
 * Implements user authentication, allowing users to sign up and log in
 * securely.
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();

// JWT secret key, loaded from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

// API route for handling user login.
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username in the MongoDB database.
    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Compare the provided password with the hashed password in the MongoDB database.
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

    // Generate a JWT token if the login is successful.
    const token = jwt.sign({ userId: existingUser._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(400).json({ message: "Login failed. ", error: error.message });
  }
});

// API route for handling user signup.
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Determine whether a user with the provided email address already exists.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or Email already in use." });
    }

    // Hash the password for secure storage, create the new user and save them to the database.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error saving user: ", error);
    res
      .status(400)
      .json({ message: "User creation failed.", error: error.message });
  }
});

export default router;
