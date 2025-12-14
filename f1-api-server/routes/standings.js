const express = require('express');
const router = express.Router();
const DriverPoints = require('../models/DriverPoints');
const TeamPoints = require('../models/TeamPoints');

// Sürücüleri Getir (Takım bilgisiyle birleştirerek)
router.get('/driverPoints', async (req, res) => {
    try {
        const driverPoints = await DriverPoints.find()
            .sort({ points: -1 }) // En yüksek puan en üstte
            .populate('team_id'); // Takım logosunu çekmek için şart
        res.json(driverPoints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Takımları Getir
router.get('/teamPoints', async (req, res) => {
    try {
        const teamPoints = await TeamPoints.find().sort({ points: -1 });
        res.json(teamPoints);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;