const mongoose = require('mongoose');

const legendSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['pilot', 'engineer', 'principal'], required: true },
    bio: String,
    image_url: String,
    stats: mongoose.Schema.Types.Mixed // Esnek bir obje (championships, wins vs.)
});

module.exports = mongoose.model('Legend', legendSchema); // 'legends' koleksiyonuna bağlanır