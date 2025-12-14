const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar');

// Tüm takvimi getir (Round sırasına göre)
router.get('/', async (req, res) => {
    try {
        const races = await Calendar.find().sort({ round: 1 });
        res.json(races);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;