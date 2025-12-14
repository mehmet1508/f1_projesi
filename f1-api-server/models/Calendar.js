const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
    round: Number,
    name: String,
    trackImage: String, // <-- Pist resmi için yeni alan
    location: String,
    country: String,
    date: String,
    stats: {
        last_winner: String,
        fastest_lap: {
            driver: String,
            time: String,
            s1: String,
            s2: String,
            s3: String
        }
    },
    sessions: {
        type: Map,
        of: String
    }
});

module.exports = mongoose.model('Calendar', CalendarSchema);