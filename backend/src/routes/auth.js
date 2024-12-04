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
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// JWT secret key, loaded from environment variables.
const JWT_SECRET = process.env.JWT_SECRET;

// API route for getting current user data
router.get("/user", authMiddleware, async (req, res) => {
  try {
    // Find the user by ID from the JWT token
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data without sensitive information
    res.json({
      username: user.username,
      email: user.email,
      avatar: user.avatar
    });
  } catch (error) {
    console.error("Error fetching user: ", error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

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
    res.status(200).json({
      success: true,
      token,
      user: {
        username: existingUser.username,
        email: existingUser.email,
        avatar: existingUser.avatar
      }
    });
  } catch (error) {
    console.error("Error during login: ", error);
    res.status(400).json({ message: "Login failed. ", error: error.message });
  }
});

// API route for handling user signup.
router.post("/signup", async (req, res) => {
  const { username, email, password, avatar } = req.body;

  try {
    // Determine whether a user with the provided email address already exists.
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "Email already in use." });
    } else if (existingUserByUsername) {
      return res
        .status(400)
        .json({ message: "Username already in use." })
    }

    // Validate avatar if provided
    let validatedAvatar = null;
    if (avatar) {
      // Basic validation for base64 image
      const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
      if (!base64Regex.test(avatar)) {
        return res.status(400).json({ message: "Invalid avatar format." });
      }

      const maxSizeBytes = 20 * 1024 * 1024; // 20MB
      const imageSize = Math.round(avatar.length * 0.75); // Approximate base64 to bytes
      if (imageSize > maxSizeBytes) {
        return res.status(400).json({ message: "Avatar image is too large." });
      }

      validatedAvatar = avatar;
    }

    // Hash the password for secure storage, create the new user and save them to the database.
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatar: validatedAvatar
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully.",
      user: {
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar ? true : false
      }
    });
  } catch (error) {
    console.error("Error saving user: ", error);
    res
      .status(400)
      .json({ message: "User creation failed.", error: error.message });
  }
});

export default router;