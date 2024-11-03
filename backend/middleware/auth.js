/**
 * MIDDLEWARE/AUTH
 * 
 * A security layer for the application that enables a JWT-based access
 * control mechanism. Should be used for all protected routes.
 */

const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware function to authenticate users based on JWT.
function authMiddleware(req, res, next) {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // If no token is found in the header, return an unauthorized error code.
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify the token with the secret key and attach the user ID from the token 
    // if the verification is successful.
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach the user ID to the request
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
}

module.exports = authMiddleware;