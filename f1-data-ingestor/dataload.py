import fastf1
from pymongo import MongoClient
import pandas as pd

# --- AYARLAR ---
# MongoDB bağlantı bilgilerimiz. 'f1_db' adında bir veritabanı kullanacağız.
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "f1_db"
COLLECTION_NAME = "fastest_laps"

# FastF1'in verileri daha hızlı çekmesi için bir önbellek (cache) klasörü oluşturmasını sağlıyoruz.
fastf1.Cache.enable_cache('cache_folder') 

print("MongoDB'ye bağlanılıyor...")
try:
    # Veritabanına bağlan
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    print("MongoDB bağlantısı başarılı!")
except Exception as e:
    print(f"MongoDB'ye bağlanırken hata oluştu: {e}")
    exit()

# --- VERİ ÇEKME İŞLEMİ ---
print("Formula 1 verileri çekiliyor... (Bu işlem biraz sürebilir)")

# Örnek olarak 2025 sezonu, Bahreyn GP, Yarış seansını seçelim
session = fastf1.get_session(2025, 'Bahreyn', 'R')
session.load() # Seans verilerini yükle

# Seansın en hızlı turunu atan pilotun turunu alalım
fastest_lap_data = session.laps.pick_fastest()
driver_code = fastest_lap_data['Driver']

print(f"En hızlı tur bulundu: Pilot {driver_code}, Süre: {fastest_lap_data['LapTime']}")

# Bu tura ait detaylı telemetri verisini çekelim (Hız, RPM, Gaz vs.)
telemetry = fastest_lap_data.get_car_data().add_distance()

# --- VERİYİ VERİTABANINA UYGUN HALE GETİRME ---
# Telemetri verisinden sadece ihtiyacımız olanları seçelim
telemetry_for_db = telemetry[['Speed', 'RPM', 'Throttle', 'Brake', 'Distance']]

# Veritabanına kaydedeceğimiz son dökümanı oluşturalım
document_to_save = {
    "year": session.event['EventDate'].year,
    "race": session.event['EventName'],
    "driver": driver_code,
    "lap_time_seconds": fastest_lap_data['LapTime'].total_seconds(),
    "telemetry": telemetry_for_db.to_dict('records') # Telemetriyi liste formatına çeviriyoruz
}

# --- VERİYİ KAYDETME ---
print(f"'{driver_code}' pilotunun tur verisi veritabanına kaydediliyor...")

# Veriyi kaydetmek için update_one ve upsert=True kullanıyoruz.
# Bu sayede aynı veriyi tekrar tekrar eklemek yerine, eğer varsa günceller.
# Bu, veri tekrarını önlemek için en iyi yöntemdir.
collection.update_one(
    {"year": 2025, "race": "Bahrain Grand Prix", "driver": driver_code},
    {"$set": document_to_save},
    upsert=True
)

print("İşlem başarıyla tamamlandı!")
client.close()