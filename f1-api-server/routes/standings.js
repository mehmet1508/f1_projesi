const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Team = require('../models/Team');

// Sürücüleri Getir (Takım bilgisiyle birleştirerek)
router.get('/drivers', async (req, res) => {
    try {
        const drivers = await Driver.find()
            .sort({ points: -1 }) // En yüksek puan en üstte
            .populate('team_id'); // Takım logosunu çekmek için şart
        res.json(drivers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Takımları Getir
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ points: -1 });
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;