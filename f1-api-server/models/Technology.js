// models/Technology.js
const mongoose = require('mongoose');

const TechnologySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    short_description: String,
    // F1 car modelindeki ilgili parçaya işaret eden 3D koordinat veya kimlik (hotspot)
    hotspot_id: {
        type: String, 
        required: true 
    }, 
    // Detaylı açıklama
    detailed_explanation: String, 
    // Görsel vurgu tipi (örn: 'wireframe', 'explode')
    visualization_type: String 
});

module.exports = mongoose.model('Technology', TechnologySchema);