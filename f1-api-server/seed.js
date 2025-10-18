const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Modellerimizi import ediyoruz (verinin nasıl görüneceğini bilmeli)
const Legend = require('./models/Legend');
const Team = require('./models/Team');
// const Technology = require('./models/Technology'); // Diğerlerini de eklersiniz

// 1. ADIM: server.js ile AYNI veritabanına bağlan
const MONGO_URI = "mongodb://localhost:27017/f1_db"; 

const importData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB\'ye (Seed Script) bağlanıldı...');

        // 2. ADIM: Her çalıştırmada eski verileri sil (duplicate olmasın)
        await Legend.deleteMany();
        await Team.deleteMany();
        // await Technology.deleteMany();

        // 3. ADIM: data/ klasöründeki JSON dosyalarını oku
        const legendsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data/legends.json'), 'utf-8')
        );
        const teamsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, 'data/teams.json'), 'utf-8')
        );

        // 4. ADIM: Okunan verileri veritabanına topluca ekle
        await Legend.insertMany(legendsData);
        await Team.insertMany(teamsData);

        console.log('JSON dosyalarındaki veriler başarıyla MongoDB\'ye aktarıldı!');
        
        // 5. ADIM: Script işini bitirdi, bağlantıyı kapat
        mongoose.disconnect();

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        process.exit(1); // Hata varsa script'i durdur
    }
};

// Script'i çalıştır
importData();