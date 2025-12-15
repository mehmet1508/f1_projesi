import fastf1
import os
import pandas as pd
import json
from datetime import timedelta

# Cache klasörü ayarı
if not os.path.exists('cache_folder'):
    os.makedirs('cache_folder')
fastf1.Cache.enable_cache('cache_folder')

# --- PİST RESİMLERİ EŞLEŞTİRME LİSTESİ ---
# React public klasöründeki yolları buraya yazıyoruz.
TRACK_IMAGE_MAP = {
    "Bahrain Grand Prix": "/images/tracks/Bahrain_Circuit.avif",
    "Saudi Arabian Grand Prix": "/images/tracks/Saudi_Arabia_Circuit.avif",
    "Australian Grand Prix": "/images/tracks/Australia_Circuit.avif",
    "Japanese Grand Prix": "/images/tracks/Japan_Circuit.avif",
    "Chinese Grand Prix": "/images/tracks/China_Circuit.avif",
    "Miami Grand Prix": "/images/tracks/Miami_Circuit.avif",
    "Emilia Romagna Grand Prix": "/images/tracks/Emilia_Romagna_Circuit.avif",
    "Monaco Grand Prix": "/images/tracks/Monaco_Circuit.avif",
    "Canadian Grand Prix": "/images/tracks/Canada_Circuit.avif",
    "Spanish Grand Prix": "/images/tracks/Spain_Circuit.avif",
    "Austrian Grand Prix": "/images/tracks/Austria_Circuit.avif",
    "British Grand Prix": "/images/tracks/Great_Britain_Circuit.avif",
    "Hungarian Grand Prix": "/images/tracks/Hungary_Circuit.avif",
    "Belgian Grand Prix": "/images/tracks/Belgium_Circuit.avif",
    "Dutch Grand Prix": "/images/tracks/Netherlands_Circuit.avif",
    "Italian Grand Prix": "/images/tracks/Italy_Circuit.avif",
    "Azerbaijan Grand Prix": "/images/tracks/Baku_Circuit.avif",
    "Singapore Grand Prix": "/images/tracks/Singapore_Circuit.avif",
    "United States Grand Prix": "/images/tracks/USA_Circuit.avif",
    "Mexico City Grand Prix": "/images/tracks/Mexico_Circuit.avif",
    "São Paulo Grand Prix": "/images/tracks/Brazil_Circuit.avif",
    "Las Vegas Grand Prix": "/images/tracks/Las_Vegas_Circuit.avif",
    "Qatar Grand Prix": "/images/tracks/Qatar_Circuit.avif",
    "Abu Dhabi Grand Prix": "/images/tracks/Abu_Dhabi_Circuit.avif"
}

# Varsayılan resim (Eğer listede yoksa bu çıkar)
DEFAULT_TRACK_IMAGE = "/images/tracks/default_track.png"

def format_f1_style(td):
    if pd.isna(td): return "N/A"
    total_seconds = td.total_seconds()
    minutes = int(total_seconds // 60)
    seconds = int(total_seconds % 60)
    milliseconds = int(td.microseconds / 1000)
    if minutes > 0:
        return f"{minutes}.{seconds:02}.{milliseconds:03}"
    return f"{seconds}.{milliseconds:03}"

def get_last_edition_stats(event_name, current_year):
    prev_year = current_year - 1
    stats = {"last_winner": "N/A", "fastest_lap": {"driver": "N/A", "time": "N/A", "s1": "N/A", "s2": "N/A", "s3": "N/A"}}
    try:
        session = fastf1.get_session(prev_year, event_name, 'Race')
        session.load(telemetry=False, weather=False, messages=False)
        if not session.results.empty:
            stats["last_winner"] = session.results.iloc[0]['FullName']
        fastest = session.laps.pick_fastest()
        if not pd.isna(fastest['LapTime']):
            stats["fastest_lap"] = {
                "driver": fastest['Driver'],
                "time": format_f1_style(fastest['LapTime']),
                "s1": format_f1_style(fastest['Sector1Time']),
                "s2": format_f1_style(fastest['Sector2Time']),
                "s3": format_f1_style(fastest['Sector3Time'])
            }
    except Exception: pass
    return stats

def get_season_schedule(season):
    print(f"--- {season} Sezonu Hazırlanıyor ---")
    schedule = fastf1.get_event_schedule(season)
    events = []
    schedule = schedule[schedule['RoundNumber'] > 0]

    for rnd in schedule.index:
        event = schedule.loc[rnd]
        event_name = event['EventName']
        print(f"İşleniyor: {event_name}")

        past_stats = get_last_edition_stats(event_name, season)

        # Resim yolunu belirle
        track_image = TRACK_IMAGE_MAP.get(event_name, DEFAULT_TRACK_IMAGE)

        # Dinamik Seans Algılama
        session_data = {}
        for i in range(1, 6):
            sess_name = str(event.get(f'Session{i}')).lower()
            sess_date = event.get(f'Session{i}Date')

            if sess_name != 'nan' and not pd.isna(sess_date):
                date_str = sess_date.strftime("%Y-%m-%d %H:%M")
                key = "unknown"
                if "practice 1" in sess_name: key = "fp1"
                elif "practice 2" in sess_name: key = "fp2"
                elif "practice 3" in sess_name: key = "fp3"
                elif "sprint qualifying" in sess_name or "shootout" in sess_name: key = "sprint_quali"
                elif "sprint" in sess_name: key = "sprint"
                elif "qualifying" in sess_name: key = "qualifying"
                elif "race" in sess_name: key = "race"
                session_data[key] = date_str

        events.append({
            "round": int(event['RoundNumber']),
            "name": event_name,
            "trackImage": track_image, # <-- YENİ EKLENEN KISIM
            "location": event['Location'],
            "country": event['Country'],
            "date": event['EventDate'].strftime("%Y-%m-%d") if not pd.isna(event['EventDate']) else None,
            "stats": past_stats,
            "sessions": session_data
        })
    return events

if __name__ == "__main__":
    data = get_season_schedule(2025)
    output_path = "../f1-api-server/data/season_2025_schedule_detailed.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print("✅ JSON oluşturuldu (Resim yolları dahil).")