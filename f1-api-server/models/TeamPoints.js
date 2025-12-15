const mongoose = require('mongoose');

const TeamPointsSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // 'ferrari', 'mercedes' gibi string ID'ler için
    name: String,
    principal: String,
    base: String,
    base_country: String,
    logo_url: String,
    points: { type: Number, default: 0 }, // Puan durumu için
});

module.exports = mongoose.model('TeamPoints', TeamPointsSchema);