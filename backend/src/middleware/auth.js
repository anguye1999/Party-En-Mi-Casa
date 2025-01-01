/**
 * MIDDLEWARE/AUTH
 *
 * A security layer for the application that enables a JWT-based access
 * control mechanism. Should be used for all protected routes.
 */

import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Import User model

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware function to authenticate users based on JWT.
async function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  // If no token is found in the header, return an unauthorized error code.
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token with the secret key and attach the user ID from the token
    // if the verification is successful.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach the user ID to the request
    const user = await User.findById(decoded.userId);

    // If user not found, return an error indicating invalid authentication.
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    // Attach user data to request object for use in routes
    req.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle different types of JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    console.error("Authentication error:", error);
    res.status(400).json({ message: "Authentication failed" });
  }
}

export default authMiddleware;
