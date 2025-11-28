const express = require('express');
const router = express.Router();
const Calendar = require('../models/Calendar');

// Tüm Yarış Takvimini Getir
router.get('/', async (req, res) => {
    try {
        // Tarihe göre sıralı getir
        const races = await Calendar.find().sort({ date: 1 });
        res.json(races);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;