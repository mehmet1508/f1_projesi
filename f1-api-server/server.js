const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {Pool} = require('pg');

// --- UYGULAMA KURULUMU ---

// Modelleri içe aktar
const Team = require('./models/Team');

const Legend = require('./models/Legend');
const Engineer = require('./models/Engineer'); // YENİ
const Technology = require('./models/Technology'); // YENİ
const CriticalSituation = require('./models/CriticalSituation'); // YENİ


const app = express();
const PORT = 5000;

// Middleware'ler
app.use(cors()); // Farklı adreslerden gelen isteklere izin ver (Frontend için gerekli)
app.use(express.json()); // Gelen isteklerdeki JSON body'leri parse etmek için

// --- VERİTABANI BAĞLANTISI ---
const MONGO_URI = "mongodb://localhost:27017/f1_db";
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB bağlantısı başarılı!"))
    .catch(err => console.error("MongoDB bağlantı hatası:", err));
    
// --- VERİ MODELİ (SCHEMA) ---
// MongoDB'deki verinin yapısını Mongoose'a anlatıyoruz.
const LapSchema = new mongoose.Schema({
    year: Number,
    race: String,
    driver: String,
    lap_time_seconds: Number,
    telemetry: Array
});

const Lap = mongoose.model('FastestLap', LapSchema, 'fastest_laps'); // 3. parametre koleksiyonun adıdır

// --- API ENDPOINT (ROTA) ---
// Ana sayfa için basit bir mesaj
app.get('/', (req, res) => {
    res.send('F1 API Sunucusu Çalışıyor!');
});

// En hızlı tur verisini getirecek olan endpoint
// :driverCode -> bir parametredir, URL'den dinamik olarak alınır.
app.get('/api/fastestlap/:driverCode', async (req, res) => {
    try {
        const driverCode = req.params.driverCode.toUpperCase();
        console.log(`'${driverCode}' için veri aranıyor...`);

        const lapData = await Lap.findOne({ driver: driverCode });

        if (!lapData) {
            console.log("Veri bulunamadı.");
            return res.status(404).json({ message: "Bu sürücü için veri bulunamadı." });
        }

        console.log("Veri bulundu ve gönderiliyor.");
        res.status(200).json(lapData);

    } catch (error) {
        console.error("API hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});
app.get('/api/fastestlaps', async (req, res) => {
    try {
        console.log("Tüm tur verileri isteniyor...");
        
        // find({}) komutu, hiçbir filtre uygulamadan tüm kayıtları bulur.
        const allLaps = await Lap.find({});

        if (!allLaps || allLaps.length === 0) {
            return res.status(404).json({ message: "Veritabanında hiç veri bulunamadı." });
        }

        res.status(200).json(allLaps);

    } catch (error) {
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});


// 1. Efsaneleri Getir
// Kullanım: GET /api/legends veya /api/legends?category=pilot
app.get('/api/legends', async (req, res) => {
    try {
        const query = {};
        if (req.query.category) {
            query.category = req.query.category;
        }
        const legends = await Legend.find(query);
        res.json(legends);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Tüm (Mevcut) Takımları Getir
// Kullanım: GET /api/teams
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- YENİ API ENDPOINTLERİ ---

// 3. Efsanevi Mühendisleri Getir
// Kullanım: GET /api/engineers
app.get('/api/engineers', async (req, res) => {
    try {
        const engineers = await Engineer.find();
        res.status(200).json(engineers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. F1 Teknolojilerini Getir
// Kullanım: GET /api/technologies
app.get('/api/technologies', async (req, res) => {
    try {
        const technologies = await Technology.find();
        res.status(200).json(technologies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Kritik Tarihi Durumları Getir
// Kullanım: GET /api/critical-situations
app.get('/api/critical-situations', async (req, res) => {
    try {
        const situations = await CriticalSituation.find().sort({ year: -1 }); // Yıla göre tersten sırala
        res.status(200).json(situations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// --- SUNUCUYU BAŞLATMA ---
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});