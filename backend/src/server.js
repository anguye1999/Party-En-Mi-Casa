/**
 * SERVER
 *
 * Sets up a Node.js/Express server that can handle authentication requests and
 * connect to a MongoDB database.
 */

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.js";

const app = express();

// Enable CORS, parsing of JSON requests and authentication-related API requests.
app.use(cors());
app.use(bodyParser.json());
app.use("/api", authRoutes);

// Connect to MongoDB using URI from the environment variables.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB: ", error));

// Start backend server and listen on API_PORT from the environment variables.
const API_PORT = process.env.API_PORT;
app.listen(API_PORT, () => {
  console.log(`Server is running on port ${API_PORT}`);
});
