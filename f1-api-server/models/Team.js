const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // 'ferrari', 'mercedes' gibi string ID'ler için
    name: String,
    principal: String,
    base: String,
    logo_url: String,
    points: { type: Number, default: 0 } // Puan durumu için
});

module.exports = mongoose.model('Team', TeamSchema);