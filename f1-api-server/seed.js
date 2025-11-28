const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Modellerimizi import ediyoruz
const Calendar = require('./models/Calendar');
const Driver = require('./models/Driver');
const Legend = require('./models/Legend');
const Team = require('./models/Team');
const Engineer = require('./models/Engineer');
const Technology = require('./models/Technology');
const CriticalSituation = require('./models/CriticalSituations');

const MONGO_URI = "mongodb://localhost:27017/f1_db";

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB\'ye (Seed Script) bağlanıldı...');

        // TAKVİM VERİSİNİ SİL
        await Calendar.deleteMany();

        // ESKİ VERİLERİ SİL
        await Legend.deleteMany();
        await Driver.deleteMany();
        await Team.deleteMany();
        await Engineer.deleteMany();
        await Technology.deleteMany();
        await CriticalSituation.deleteMany();

        // JSON DOSYALARINI OKU
        const legendsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/legends.json'), 'utf-8'));
        const teamsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/teams.json'), 'utf-8'));
        const driversData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/drivers.json'), 'utf-8'));
        const engineersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/engineers.json'), 'utf-8'));
        const technologiesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/technologies.json'), 'utf-8'));
        const situationsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/critical-situations.json'), 'utf-8'));

        // YENİ: TAKVİM DOSYASI OKU (FastF1 script ile ürettik)
        const calendarData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data/season_2024_schedule.json'), 'utf-8')
        );

        // VERİYİ YÜKLE
        await Calendar.insertMany(calendarData);
        await Legend.insertMany(legendsData);
        await Driver.insertMany(driversData);
        await Team.insertMany(teamsData);
        await Engineer.insertMany(engineersData);
        await Technology.insertMany(technologiesData);
        await CriticalSituation.insertMany(situationsData);

        console.log('TÜM VERİLER BAŞARILI ŞEKİLDE MONGODB\'YE AKTARILDI!');


        mongoose.disconnect();

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        process.exit(1);
    }
};

importData();
