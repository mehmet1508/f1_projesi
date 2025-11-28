import fastf1
import os
import pandas as pd
import json
from fastf1 import utils
from datetime import datetime

# Cache'i aktif et (verileri tekrar tekrar indirmemek için)
fastf1.Cache.enable_cache('cache_folder')

def get_season_schedule(season):
    # Resmi olmayan etkinlikleri (test sürüşleri vb.) dahil etmemek için
    # include_testing=False parametresini ekleyebilirsin ama şimdilik hepsini çekelim.
    schedule = fastf1.get_event_schedule(season)

    events = []

    for rnd in schedule.index:
        event = schedule.loc[rnd]

        # Güvenli tarih formatlama fonksiyonu (Kod tekrarını önlemek için)
        def format_date(date_obj):
            if pd.isna(date_obj):
                return None
            return date_obj.strftime("%Y-%m-%d %H:%M")

        events.append({
            "round": int(event['RoundNumber']),
            "name": event['EventName'],
            "location": event['Location'],
            "country": event['Country'],
            "date": event['EventDate'].strftime("%Y-%m-%d") if not pd.isna(event['EventDate']) else None,
            "sessions": {
                # Tüm seanslar için format_date fonksiyonunu kullanıyoruz
                "FP1": format_date(event['Session1Date']),
                "FP2": format_date(event['Session2Date']),
                "FP3": format_date(event['Session3Date']),
                "Qualifying": format_date(event['Session4Date']),
                "Race": format_date(event['Session5Date'])
            }
        })

    return events
if __name__ == "__main__":
      season = 2024
      print(f"{season} sezonu verisi çekiliyor...")

      try:
          data = get_season_schedule(season)

          # --- HEDEF KLASÖR AYARI ---
          # ".." -> Bir üst dizine çık (f1-data-ingestor'dan çık)
          # "/f1-api-server/data" -> Hedef klasöre gir
          output_folder = "../f1-api-server/data"

          filename = f"season_{season}_schedule.json"

          # Klasör yolunu oluştur (Linux/Windows uyumlu olması için os.path.join kullanıyoruz)
          # __file__ kullanmak scriptin çalıştığı yeri baz almasını sağlar, daha güvenlidir.
          script_dir = os.path.dirname(os.path.abspath(__file__))
          full_output_path = os.path.join(script_dir, output_folder)

          # Klasörün var olduğundan emin ol (Yoksa oluşturur)
          os.makedirs(full_output_path, exist_ok=True)

          # Tam dosya yolu
          full_file_path = os.path.join(full_output_path, filename)

          with open(full_file_path, "w") as f:
              json.dump(data, f, indent=4)

          print(f"Başarılı! Dosya şuraya kaydedildi: {full_file_path}")

      except Exception as e:
          print(f"Bir hata oluştu: {e}")