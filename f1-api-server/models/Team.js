const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // 'ferrari'
    name: { type: String, required: true },
    principal: String,
    base: String,
    logo_url: String
});

module.exports = mongoose.model('Team', teamSchema); // 'teams' koleksiyonuna bağlanır