const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // 'LEC', 'HAM' gibi kısaltmalar
    name: String,
    number: Number,
    nationality: String,
    team_id: { type: String, ref: 'Team' }, // Team modeline referans (Foreign Key)
    points: { type: Number, default: 0 } // Puan durumu için
});

module.exports = mongoose.model('Driver', DriverSchema);