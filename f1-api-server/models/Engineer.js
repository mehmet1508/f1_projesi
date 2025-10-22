// models/Engineer.js
const mongoose = require('mongoose');

const EngineerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    title: String, // Örn: Chief Technical Officer
    team_history: [String], // Örn: ['Red Bull', 'McLaren', 'Williams']
    contributions: String, // Başlıca katkıları özetleyen uzun metin
    photo_url: String, // Frontend için resim linki
});

module.exports = mongoose.model('Engineer', EngineerSchema);