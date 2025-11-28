const mongoose = require('mongoose');

const CalendarSchema = new mongoose.Schema({
    round: Number,
    name: String,
    location: String,
    country: String,
    date: String,
    sessions: Object
});

module.exports = mongoose.model("Calendar", CalendarSchema);
