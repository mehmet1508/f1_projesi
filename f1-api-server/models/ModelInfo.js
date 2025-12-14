// models/ModelInfo.js
const mongoose = require('mongoose');

const PartInfoSchema = new mongoose.Schema({
    matchers: [String],
    title: String,
    description: String
}, { _id: false });

const HotspotInfoSchema = new mongoose.Schema({
    title: String,
    description: String
}, { _id: false });

const TrackInfoSchema = new mongoose.Schema({
    title: String,
    description: String,
    buttonText: String
}, { _id: false });

const ModelInfoSchema = new mongoose.Schema({
    partInfos: [PartInfoSchema],
    hotspotInfoByKey: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    trackInfo: TrackInfoSchema
}, {
    // Tek bir doküman olarak sakla
    collection: 'modelinfo'
});

module.exports = mongoose.model('ModelInfo', ModelInfoSchema);

