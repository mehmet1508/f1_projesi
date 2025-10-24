const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({  
    _id: { type: String, required: true },
    name: String,
    number: Number,
    nationality: String,
    team_id: String,


});
module.exports = mongoose.model('Driver', DriverSchema);