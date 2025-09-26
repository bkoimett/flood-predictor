const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config(); // automatically loads environment variables from a .env file

// initialise app
const app = express();

// middleware
app.use(express.json());

// mongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB ✅"))
  .catch((err) => console.error(err));

// routes
app.get('/', (req, res) => {
    res.send('Flood Prediction API is running 🚀')
});

// start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server is running on port ${PORT} ✅`));