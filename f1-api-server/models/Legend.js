const mongoose = require('mongoose');

const legendSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    // SAYFA GRUBU (frontend filtrelemesi buradan yapılıyor)
    category: {
        type: String,
        enum: ['pilot', 'others', 'media'], // ✅ JSON ile birebir
        required: true
    },

    // KİŞİNİN GERÇEK ROLÜ (opsiyonel ama çok önemli)
    role: {
        type: String,
        trim: true,
        required: function () {
            // pilot’lar için role zorunlu değil
            return this.category !== 'pilot';
        }
    },

    bio: {
        type: String
    },

    image_url: {
        type: String
    },

    // Esnek istatistik yapısı
    stats: {
        type: mongoose.Schema.Types.Mixed
    },

    related_link:
    {
        type:mongoose.Schema.Types.Mixed
    }

}, {
    timestamps: true // createdAt / updatedAt (ileride çok işine yarar)
});

module.exports = mongoose.model('Legend', legendSchema);
