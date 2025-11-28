import fastf1
import json
import pandas as pd
import os

# Cache klasörünü aktif edelim (hızlı çalışması için)
if not os.path.exists('cache_folder'):
    os.makedirs('cache_folder')
fastf1.Cache.enable_cache('cache_folder')

# Hangi yılın verisini çekeceğiz?
YEAR = 2024
# Sezonun ilk yarışını yüklüyoruz ki tüm gridi görelim
print(f"{YEAR} sezonu verileri indiriliyor...")
session = fastf1.get_session(YEAR, 1, 'R') # 1. Yarış, Race session
session.load()

# --- 1. ADIM: STATİK BİLGİLER (FastF1'de olmayanlar) ---
# FastF1'den gelen takım isimlerini bizim ID'lerimize ve statik bilgilere eşliyoruz.
# Burası senin "elle yazdığın" kısımları otomatize edecek harita.
team_mapping = {
    "Ferrari": {
        "_id": "ferrari", "principal": "Frédéric Vasseur", "base": "Maranello, Italy", "logo": "/images/logos/ferrari.png"
    },
    "Mercedes": {
        "_id": "mercedes", "principal": "Toto Wolff", "base": "Brackley, UK", "logo": "/images/logos/mercedes.png"
    },
    "Red Bull Racing": {
        "_id": "redbull", "principal": "Christian Horner", "base": "Milton Keynes, UK", "logo": "/images/logos/redbull.png"
    },
    "McLaren": {
        "_id": "mclaren", "principal": "Andrea Stella", "base": "Woking, UK", "logo": "/images/logos/mclaren.png"
    },
    "Aston Martin": {
        "_id": "astonmartin", "principal": "Mike Krack", "base": "Silverstone, UK", "logo": "/images/logos/astonmartin.png"
    },
    "Alpine": {
        "_id": "alpine", "principal": "Bruno Famin", "base": "Enstone, UK", "logo": "/images/logos/alpine.png"
    },
    "Williams": {
        "_id": "williams", "principal": "James Vowles", "base": "Grove, UK", "logo": "/images/logos/williams.png"
    },
    "RB": { # Visa Cash App RB
        "_id": "rb", "principal": "Laurent Mekies", "base": "Faenza, Italy", "logo": "/images/logos/rb.png"
    },
    "Kick Sauber": {
        "_id": "sauber", "principal": "Alessandro Alunni Bravi", "base": "Hinwil, Switzerland", "logo": "/images/logos/sauber.png"
    },
    "Haas F1 Team": {
        "_id": "haas", "principal": "Ayao Komatsu", "base": "Kannapolis, USA", "logo": "/images/logos/haas.png"
    }
}

drivers_list = []
teams_list = []
processed_teams = set()

# --- 2. ADIM: FASTF1'DEN VERİYİ ÇEKİP BİRLEŞTİRME ---
results = session.results

for index, row in results.iterrows():
    # FastF1 verileri
    driver_abbr = row['Abbreviation']  # Örn: LEC
    driver_no = row['DriverNumber']    # Örn: 16
    fullname = row['FullName']         # Örn: Charles Leclerc
    team_name_f1 = row['TeamName']     # Örn: Ferrari
    country_code = row.get('CountryCode', '') # Bazen boş gelebilir

    # Takım Eşleşmesi Kontrolü
    team_info = team_mapping.get(team_name_f1)

    if team_info:
        team_id = team_info['_id']

        # --- Driver Oluşturma ---
        driver_obj = {
            "_id": driver_abbr,
            "name": fullname,
            "number": int(driver_no),
            "nationality": country_code, # FastF1 genelde 'ITA', 'MON' gibi kod verir
            "team_id": team_id
        }
        drivers_list.append(driver_obj)

        # --- Team Oluşturma (Tekrar etmemesi için) ---
        if team_id not in processed_teams:
            team_obj = {
                "_id": team_id,
                "name": team_name_f1,
                "principal": team_info['principal'],
                "base": team_info['base'],
                "logo_url": team_info['logo']
            }
            teams_list.append(team_obj)
            processed_teams.add(team_id)
    else:
        print(f"UYARI: '{team_name_f1}' takımı mapping listesinde bulunamadı!")

# --- 3. ADIM: JSON DOSYALARINA KAYDETME ---
output_dir = '../f1-api-server/data' # Server içindeki data klasörüne gönderelim

with open(f'{output_dir}/drivers.json', 'w', encoding='utf-8') as f:
    json.dump(drivers_list, f, indent=2, ensure_ascii=False)
    print("drivers.json oluşturuldu.")

with open(f'{output_dir}/teams.json', 'w', encoding='utf-8') as f:
    json.dump(teams_list, f, indent=2, ensure_ascii=False)
    print("teams.json oluşturuldu.")