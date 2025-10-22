// models/CriticalSituation.js
const mongoose = require('mongoose');

const CriticalSituationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    year: Number,
    summary: String, // Olayın kısa özeti
    category: String, // Örn: 'Controversy', 'Tragedy', 'FinalLapDecider'
    video_url: String, // İlgili video linki (YouTube vb.)
});

module.exports = mongoose.model('CriticalSituation', CriticalSituationSchema);