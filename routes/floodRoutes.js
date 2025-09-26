const express = require("express");
const FloodData = require("../models/FloodData");
const axios = require("axios");
const router = express.Router();

// Fetch rainfall from NASA API and save
router.get("/flood/fetch", async (req, res) => {
  // error handling block - nasa api down / mDB error etc
  try {
    const {
      lat = -0.0917,
      lon = 34.768,
      start = "20250825", // why are the extreme dates not being retrieved?
      end = "20250925",
      area = "Kisumu",
    } = req.query;

    // build API url
    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=RE&longitude=${lon}&latitude=${lat}&start=${start}&end=${end}&format=JSON`;

    // GET request to NASA API using Axios
    const response = await axios.get(url);

    // extracts just the rainfall data
    const rainfallData = response.data.properties.parameter.PRECTOTCORR;

    // convert nasa json into mongoDB docs
    const docs = Object.entries(rainfallData).map(([date, rainfall]) => ({
      date: new Date(
        date.substring(0, 4), // year
        date.substring(4, 6) - 1, // month (0-based in JS)
        date.substring(6, 8) // day
      ),
      rainfall_mm: rainfall,
      river_level_m: (rainfall / 20).toFixed(2),
      area,
    }));

    // insert into mongoDB
    await FloodData.insertMany(docs);

    res.json({ message: "Data saved ✅", count: docs.length, docs });
  } catch (err) {
    console.error(err);
    res.status(400).json(err);
  }
});

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

// GET by area end point
router.get("/flood", async (req, res) => {
  try {
    // destructuring assignment
    const { area } = req.query;
    let query = {};
    if (area) query.area = area;

    const data = await FloodData.find(query).sort({ date: -1 });
    res.json(data);
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
  const latest = await FloodData.find().sort({ date: -1 }).limit(1);

  if (latest === 0) return res.json({ prediction: "No data available" });

  const { rainfall_mm, river_level_m } = latest[0];
  let risk = "low";

  if (rainfall_mm > 100 || river_level_m > 3.0) risk = "Moderate 👌";
  if (rainfall_mm > 100 || river_level_m > 4.5) risk = "High ⚠️";

  res.json({ prediction: risk, latest: latest[0], area: latest[0].area });
});


// DELETE - Remove everything
router.delete('/flood', async (req,res) => {
    try{
        await FloodData.find().deleteMany();
        const floodData = await FloodData.find();
        res.status(200).json(floodData);
    }
    catch (err) {
        res.status(400).json({ error: err.message});
    }
});

// export router
module.exports = router;
