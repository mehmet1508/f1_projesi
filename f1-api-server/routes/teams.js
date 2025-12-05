const express = require('express');
const router = express.Router();
// Modelleri çağırıyoruz
const Team = require('../models/Team');
const Driver = require('../models/Driver');

// GET /api/teams
router.get('/', async (req, res) => {
    try {
        // 1. Tüm takımları çek (lean() performansı artırır)
        const teams = await Team.find().lean();

        // 2. Her takım için sürücüleri bul ve birleştir
        const teamsWithDrivers = await Promise.all(teams.map(async (team) => {

            // Driver tablosuna git, team_id'si bu takımın _id'si olanları bul
            // Örn: team_id="redbull" olan Verstappen ve Perez'i bulur.
            const drivers = await Driver.find({ team_id: team._id }).lean();

            // Takım verisine 'drivers' listesini ekleyip gönder
            return {
                ...team,
                drivers: drivers
            };
        }));

        res.json(teamsWithDrivers);

    } catch (err) {
        console.error("Takım çekme hatası:", err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

module.exports = router;