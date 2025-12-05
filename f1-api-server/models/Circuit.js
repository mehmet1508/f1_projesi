
const mongoose = require('mongoose');

const CircuitSchema = new mongoose.Schema({
    // Primary Identifier & Display Fields
    id: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    imgUrl: String,
    location: String, // Used in the second set of tracks (Monza, Suzuka)

    // 3D Map Camera/Position Data
    center: { 
        lat: Number, 
        lng: Number, 
        altitude: Number 
    },
    range: Number,
    heading: Number,
    tilt: Number,
    
    // Explicit Lat/Lng (Redundant but included for strict model mapping)
    lat: Number, 
    lng: Number, 

    // Street View Data
    streetView: {
        lat: Number,
        lng: Number,
        heading: Number,
        pitch: Number,
    }
 
});

module.exports = mongoose.model("Circuit", CircuitSchema);