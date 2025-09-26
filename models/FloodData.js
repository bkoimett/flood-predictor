const mongoose = require('mongoose');

// define schema
const FloodDataSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    rainfall_mm: {
        type: Number, 
        required: true
    },
    river_level_m: {
        type: Number,
        required: true
    },
    area: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('FloodDataSet', FloodDataSchema);