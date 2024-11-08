/**
 * SERVER
 * 
 * Sets up a Node.js/Express server that can handle authentication requests and 
 * connect to a MongoDB database.
 */

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

const app = express();

// Enable CORS, parsing of JSON requests and authentication-related API requests.
app.use(cors());
app.use(bodyParser.json());
app.use("/api", authRoutes);

// Connect to MongoDB using URI from the environment variables.
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.error("Error connecting to MongoDB: ", error));

// Start backend server and listen on PORT from the environment variables.
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});