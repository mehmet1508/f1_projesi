import fastf1
import json
import pandas as pd
import os

# 1. AYARLAR
if not os.path.exists('cache_folder'):
    os.makedirs('cache_folder')
fastf1.Cache.enable_cache('cache_folder')

YEAR = 2025
TARGET_RACE = 'Qatar'

print(f"--- {YEAR} SEZONU TAM HESAPLAMA (SÜRÜCÜ + TAKIM) ---")

# ==========================================
# ADIM 0: TAKIM HARİTASI (EN BAŞA ALDIK)
# ==========================================
# Bu haritayı hesaplama döngüsünde kullanacağımız için yukarı taşıdık.
team_mapping = {
    "Ferrari": { "_id": "ferrari", "principal": "Frédéric Vasseur", "base": "Maranello, Italy", "logo": "/images/logos/ferrari.png" },
    "Mercedes": { "_id": "mercedes", "principal": "Toto Wolff", "base": "Brackley, UK", "logo": "/images/logos/mercedes.png" },
    "Red Bull Racing": { "_id": "redbull", "principal": "Christian Horner", "base": "Milton Keynes, UK", "logo": "/images/logos/redbull.png" },
    "McLaren": { "_id": "mclaren", "principal": "Andrea Stella", "base": "Woking, UK", "logo": "/images/logos/mclaren.png" },
    "Aston Martin": { "_id": "astonmartin", "principal": "Mike Krack", "base": "Silverstone, UK", "logo": "/images/logos/astonmartin.png" },
    "Alpine": { "_id": "alpine", "principal": "Bruno Famin", "base": "Enstone, UK", "logo": "/images/logos/alpine.png" },
    "Williams": { "_id": "williams", "principal": "James Vowles", "base": "Grove, UK", "logo": "/images/logos/williams.png" },

    # Racing Bulls Varyasyonları
    "RB": { "_id": "rb", "principal": "Laurent Mekies", "base": "Faenza, Italy", "logo": "/images/logos/rb.png" },
    "Racing Bulls": { "_id": "rb", "principal": "Laurent Mekies", "base": "Faenza, Italy", "logo": "/images/logos/rb.png" },
    "Visa Cash App RB F1 Team": { "_id": "rb", "principal": "Laurent Mekies", "base": "Faenza, Italy", "logo": "/images/logos/rb.png" },

    # Sauber Varyasyonları
    "Kick Sauber": { "_id": "sauber", "principal": "Alessandro Alunni Bravi", "base": "Hinwil, Switzerland", "logo": "/images/logos/sauber.png" },
    "Stake F1 Team Kick Sauber": { "_id": "sauber", "principal": "Alessandro Alunni Bravi", "base": "Hinwil, Switzerland", "logo": "/images/logos/sauber.png" },

    "Haas F1 Team": { "_id": "haas", "principal": "Ayao Komatsu", "base": "Kannapolis, USA", "logo": "/images/logos/haas.png" }
}

# PUAN HAVUZLARI
driver_cumulative_points = {}      # Örn: {'VER': 255}
constructor_cumulative_points = {} # Örn: {'redbull': 400}

# ==========================================
# ADIM 1: KATAR'A KADAR OLAN YARIŞLARI BUL
# ==========================================
schedule = fastf1.get_event_schedule(YEAR)
try:
    qatar_event = schedule[schedule['EventName'].str.contains(TARGET_RACE, case=False)].iloc[0]
    target_round = qatar_event['RoundNumber']
    print(f"Hedef: {qatar_event['EventName']} (Round {target_round})")
except IndexError:
    print(f"HATA: '{TARGET_RACE}' takvimde bulunamadı.")
    exit()

# ==========================================
# ADIM 2: YARIŞ YARIŞ PUANLARI TOPLA (Sürücü + Takım)
# ==========================================

for round_num in range(1, target_round + 1):
    print(f"\nİşleniyor: Round {round_num}...", end=" ")

    # Hem Sprint hem Ana Yarış puanlarını kontrol et
    sessions_to_check = ['Sprint', 'Race']

    for session_type in sessions_to_check:
        try:
            session = fastf1.get_session(YEAR, round_num, session_type)
            session.load(telemetry=False, weather=False, messages=False)
            results = session.results

            if 'Points' in results.columns:
                points_found = False
                for index, row in results.iterrows():
                    points = row['Points']

                    if points > 0:
                        points_found = True

                        # --- A) SÜRÜCÜ PUANI EKLE ---
                        abbr = row['Abbreviation']
                        driver_cumulative_points[abbr] = driver_cumulative_points.get(abbr, 0) + points

                        # --- B) TAKIM PUANI EKLE ---
                        team_name = row['TeamName']
                        team_info = team_mapping.get(team_name)

                        if team_info:
                            t_id = team_info['_id']
                            constructor_cumulative_points[t_id] = constructor_cumulative_points.get(t_id, 0) + points

                if points_found:
                    print(f"[{session_type} ✅]", end=" ")

        except Exception:
            # Sprint yoksa veya veri yoksa geç
            pass

print("\n\n--- Tüm Puanlar Hesaplandı ---")
# Kontrol amaçlı en iyi takımı yazdır
sorted_teams = sorted(constructor_cumulative_points.items(), key=lambda x: x[1], reverse=True)
print("Lider Takım:", sorted_teams[:1])


# ==========================================
# ADIM 3: SON DURUM GRID BİLGİSİ
# ==========================================
try:
    final_session = fastf1.get_session(YEAR, target_round, 'Race')
    final_session.load(telemetry=False, weather=False, messages=False)
    final_results = final_session.results
except:
    print("Final yarış yüklenemedi.")
    exit()

drivers_list = []
teams_list = []
processed_teams = set()

print("\nJSON Dosyaları Yazılıyor...")

for index, row in final_results.iterrows():
    driver_abbr = row['Abbreviation']
    driver_no = row['DriverNumber']
    fullname = row['FullName']
    team_name_f1 = row['TeamName']
    country_code = row.get('CountryCode', '')

    team_info = team_mapping.get(team_name_f1)

    if team_info:
        team_id = team_info['_id']

        # 1. SÜRÜCÜ LİSTESİ OLUŞTURMA
        d_points = int(driver_cumulative_points.get(driver_abbr, 0))

        driver_obj = {
            "_id": driver_abbr,
            "name": fullname,
            "number": int(driver_no),
            "nationality": country_code,
            "team_id": team_id,
            "points": d_points
        }
        drivers_list.append(driver_obj)

        # 2. TAKIM LİSTESİ OLUŞTURMA
        if team_id not in processed_teams:
            # Takım puanını hesapladığımız havuzdan çekiyoruz
            c_points = int(constructor_cumulative_points.get(team_id, 0))

            team_obj = {
                "_id": team_id,
                "name": team_name_f1, # FastF1'den gelen isim (Örn: McLaren)
                "principal": team_info['principal'],
                "base": team_info['base'],
                "logo_url": team_info['logo'],
                "points": c_points  # <-- YENİ EKLENEN KISIM
            }
            teams_list.append(team_obj)
            processed_teams.add(team_id)
    else:
        print(f"UYARI: Takım Eşleşmedi -> '{team_name_f1}'")

# ==========================================
# ADIM 4: KAYDETME
# ==========================================
output_dir = '../f1-api-server/data'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(f'{output_dir}/drivers.json', 'w', encoding='utf-8') as f:
    json.dump(drivers_list, f, indent=2, ensure_ascii=False)
    print("BAŞARILI: drivers.json güncellendi.")

with open(f'{output_dir}/teams.json', 'w', encoding='utf-8') as f:
    json.dump(teams_list, f, indent=2, ensure_ascii=False)
    print("BAŞARILI: teams.json güncellendi (Puanlar dahil).")