const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const {Pool} = require('pg');

// --- UYGULAMA KURULUMU ---
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
    // PostgreSQL bağlantısı
const pgPool = new Pool({
    user:'f1_user',
    host:'localhost',
    database:'f1_static_db',
    password:'Mkc1508156',
    port:5432,
});
console.log("PostgreSQL bağlantısı başarılı!");
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
// PostgreSQL'den statik verileri çekmek için yeni bir endpoint
app.get('/api/teams', async (req, res) => {
    try {
        console.log("Tüm takımlar isteniyor (PostgreSQL)...");
        const allTeams = await pgPool.query('SELECT * FROM teams ORDER BY name');
        res.status(200).json(allTeams.rows); // Sonuçlar .rows içindedir
    } catch (error) {
        console.error("PostgreSQL sorgu hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});

app.get('/api/drivers', async (req, res) => {
    try {
        console.log("Tüm pilotlar isteniyor (PostgreSQL)...");
        // İki tabloyu birleştirerek (JOIN) daha anlamlı veri getirelim
        const queryText = `
            SELECT d.code, d.full_name, d.nationality, t.name AS team_name
            FROM drivers d
            LEFT JOIN teams t ON d.team_id = t.team_id;
        `;
        const allDrivers = await pgPool.query(queryText);
        res.status(200).json(allDrivers.rows);
    } catch (error) {
        console.error("PostgreSQL sorgu hatası:", error);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
});

// --- SUNUCUYU BAŞLATMA ---
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});