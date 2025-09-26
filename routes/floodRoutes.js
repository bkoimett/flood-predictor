const express = require("express");
const FloodData = require("../models/FloodData");
const router = express.Router();

// Save new data
router.post("/flood", async (req, res) => {
  try {
    const floodData = new FloodData(req.body);
    await floodData.save();
    res.status(200).json(floodData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all data
router.get("/flood", async (req, res) => {
  try {
    const floodData = await FloodData.find().sort({ date: -1 }); // -1 means from newest to oldest
    res.status(200).json(floodData);
  } catch (err) {
    res.status(400).json({ errors: err.message });
  }
});

// Simple prediction based on last entry
router.get("/flood/predict", async (req, res) => {
    const latest = await FloodData.find().sort({ date: -1}).limit(1);

    if (latest === 0) return res.json({ prediction: 'No data available'});

    const { rainfall_mm, river_level_m } = latest[0];
    let risk = 'low';

    if ( rainfall_mm > 100 || river_level_m > 3.0) risk = 'Moderate 👌';
    if ( rainfall_mm > 100 || river_level_m > 4.5) risk = 'High ⚠️';

    res.json({ prediction: risk, latest: latest[0], area: latest[0].area });
});

// export router
module.exports = router;
