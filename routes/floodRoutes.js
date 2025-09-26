const express = require('express');
const FloodData = require('../models/FloodData');
const router = express.Router();

// Save new data
router.post('/flood', async (req, res) => {
    try{
        const floodData = new FloodData(req.body);
        await floodData.save();
        res.status(200).json(floodData);      
    }
    catch (err) {
        res.status(400).json({ error: err.message});
    }
});

// Get all data
router.get('/flood', async (req,res) => {
    try{
        const floodData = await FloodData.find().sort({ date: -1 }); // -1 means from newest to oldest
        res.status(200).json(floodData)
    }
    catch (err) {
        res.status(400).json({ errors: err.message})
    }
})

// export router
module.exports = router;