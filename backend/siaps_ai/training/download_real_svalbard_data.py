import os
import requests
import pandas as pd
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

SVALBARD_LAT = 78.22
SVALBARD_LON = 15.65

def fetch_real_svalbard_data(year: int = 2024):
    """
    Downloads real historical hourly Arctic climate data for Svalbard, Norway
    directly from the free Copernicus/ECMWF ERA5-Land Archive via Open-Meteo.
    Zero cost. Zero API key required.
    """
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": SVALBARD_LAT,
        "longitude": SVALBARD_LON,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "wind_speed_10m",
            "wind_gusts_10m",
            "direct_radiation",
            "surface_pressure"
        ],
        "timezone": "UTC"
    }

    print(f"[SIAPS AI] Fetching REAL Svalbard Arctic weather data for {year} from Copernicus ERA5 archive...")
    res = requests.get(url, params=params, timeout=15)
    if res.status_code != 200:
        raise RuntimeError(f"Failed to fetch data: HTTP {res.status_code} - {res.text}")

    data = res.json()["hourly"]
    df = pd.DataFrame({
        "timestamp": data["time"],
        "temperature_c": data["temperature_2m"],
        "feels_like_c": data["apparent_temperature"],
        "humidity_pct": data["relative_humidity_2m"],
        "wind_speed_ms": data["wind_speed_10m"],
        "wind_gust_ms": data["wind_gusts_10m"],
        "solar_irradiance_wm2": data["direct_radiation"],
        "pressure_hpa": data["surface_pressure"]
    })

    out_file = os.path.join(DATA_DIR, f"real_svalbard_weather_{year}.csv")
    df.to_csv(out_file, index=False)
    print(f"[SIAPS AI] Successfully downloaded {len(df):,} hourly real Arctic readings!")
    print(f"[SIAPS AI] Saved to: {out_file}")
    return df

if __name__ == "__main__":
    fetch_real_svalbard_data(2024)
