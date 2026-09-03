import requests
from datetime import datetime
from typing import Dict, Any, List

BHARATI_COORDS = {"lat": -69.41, "lon": 76.19, "name": "Bharati Station", "region": "Larsemann Hills, Antarctica"}
MAITRI_COORDS = {"lat": -70.77, "lon": 11.73, "name": "Maitri Station", "region": "Schirmacher Oasis, Antarctica"}

class StationForecastingEngine:
    """
    Forecasting Engine of SIAPS AI:
    - Queries live Antarctic meteorological data for Indian Polar Stations:
      * Bharati Station (69°24′S 76°11′E, Larsemann Hills)
      * Maitri Station (70°46′S 11°44′E, Schirmacher Oasis)
    - Estimates future heating and operational electrical demand.
    - Operates 100% independently of any LLM.
    """
    def __init__(self, station: str = "bharati"):
        self.active_coords = BHARATI_COORDS if station == "bharati" else MAITRI_COORDS
        self.cached_weather = None
        self.last_fetch = datetime.min
        self.cache_ttl = 300 # 5 min

    def get_weather_forecast(self) -> Dict[str, Any]:
        now = datetime.utcnow()
        if self.cached_weather and (now - self.last_fetch).total_seconds() < self.cache_ttl:
            return self.cached_weather

        try:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": self.active_coords["lat"],
                "longitude": self.active_coords["lon"],
                "current": ["temperature_2m", "relative_humidity_2m", "apparent_temperature", "wind_speed_10m", "wind_gusts_10m", "direct_radiation"],
                "forecast_days": 3
            }
            res = requests.get(url, params=params, timeout=3)
            if res.status_code == 200:
                d = res.json()["current"]
                weather = {
                    "temperature": round(d.get("temperature_2m", -18.4), 1),
                    "feelsLike": round(d.get("apparent_temperature", -26.1), 1),
                    "windSpeed": round(d.get("wind_speed_10m", 8.7), 1),
                    "windGust": round(d.get("wind_gusts_10m", 13.2), 1),
                    "solarRadiation": round(d.get("direct_radiation", 312.0), 1),
                    "condition": "Partly Cloudy" if d.get("direct_radiation", 300) > 150 else "Overcast",
                    "isLive": True
                }
                self.cached_weather = weather
                self.last_fetch = now
                return weather
        except Exception:
            pass

        # Offline fallback
        return {
            "temperature": -18.4,
            "feelsLike": -26.1,
            "windSpeed": 8.7,
            "windGust": 13.2,
            "solarRadiation": 312.0,
            "condition": "Partly Cloudy",
            "isLive": False
        }

    def predict_station_demand(self, outside_temp: float, wind_speed: float) -> Dict[str, Any]:
        # Arctic building heat loss model: Q = U * A * delta_T * wind_factor
        delta_t = max(0.0, 19.0 - outside_temp)
        wind_factor = 1.0 + (wind_speed / 25.0) * 0.35
        heating_kw = round((0.28 * 380 * delta_t * wind_factor) / 1000.0 + 4.5, 1)

        loads = [
            {"name": "Critical / Life-Support", "value": 12.8, "priority": 0, "color": "#ef4444"},
            {"name": "Scientific Equipment",   "value": 11.4, "priority": 1, "color": "#8b5cf6"},
            {"name": "Heating & HVAC",          "value": heating_kw, "priority": 2, "color": "#f97316"},
            {"name": "Communication",           "value": 2.1,  "priority": 3, "color": "#0ea5e9"},
            {"name": "Computing & Data",        "value": 5.8,  "priority": 4, "color": "#06b6d4"},
            {"name": "General Appliances",      "value": 3.9,  "priority": 5, "color": "#64748b"},
            {"name": "Flexible Loads",          "value": 1.7,  "priority": 6, "color": "#94a3b8"},
        ]
        return {
            "total_consumption": round(sum(l["value"] for l in loads), 1),
            "loads": loads,
            "heating_kw": heating_kw
        }
