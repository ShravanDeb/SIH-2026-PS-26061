import os
import requests
import pandas as pd

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Official Indian Antarctic Research Station Coordinates (NCPOR / MoES)
INDIAN_STATIONS = {
    "bharati": {
        "name": "Bharati Station",
        "location": "Larsemann Hills, East Antarctica",
        "lat": -69.4078,
        "lon": 76.1872
    },
    "maitri": {
        "name": "Maitri Station",
        "location": "Schirmacher Oasis, Queen Maud Land, East Antarctica",
        "lat": -70.7661,
        "lon": 11.7322
    }
}

def fetch_antarctic_station_data(station_key: str = "bharati", year: int = 2024):
    """
    Downloads real historical hourly Antarctic climate data for Indian Polar Stations
    directly from Copernicus/ECMWF ERA5 archive via Open-Meteo.
    Zero cost. Zero API key required.
    """
    station = INDIAN_STATIONS[station_key]
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": station["lat"],
        "longitude": station["lon"],
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

    print(f"[SIAPS AI] Fetching REAL Antarctic climate data for {station['name']} ({station['location']}) for {year}...")
    res = requests.get(url, params=params, timeout=20)
    if res.status_code != 200:
        raise RuntimeError(f"Failed to fetch data for {station['name']}: HTTP {res.status_code} - {res.text}")

    data = res.json()["hourly"]
    df = pd.DataFrame({
        "timestamp": data["time"],
        "station": station["name"],
        "temperature_c": data["temperature_2m"],
        "feels_like_c": data["apparent_temperature"],
        "humidity_pct": data["relative_humidity_2m"],
        "wind_speed_ms": data["wind_speed_10m"],
        "wind_gust_ms": data["wind_gusts_10m"],
        "solar_irradiance_wm2": data["direct_radiation"],
        "pressure_hpa": data["surface_pressure"]
    })

    out_file = os.path.join(DATA_DIR, f"real_{station_key}_antarctica_weather_{year}.csv")
    df.to_csv(out_file, index=False)
    print(f"[SIAPS AI] Successfully downloaded {len(df):,} hourly real Antarctic readings for {station['name']}!")
    print(f"[SIAPS AI] Saved to: {out_file}")
    return df

def fetch_all_indian_stations(year: int = 2024):
    for key in INDIAN_STATIONS:
        fetch_antarctic_station_data(key, year)

if __name__ == "__main__":
    fetch_all_indian_stations(2024)
