import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_synthetic_historical_telemetry(num_samples: int = 4320): # 6 months of hourly data
    """
    Simulates 6 months of Arctic weather and physical generation telemetry
    for Svalbard Station Alpha (78.2°N 15.4°E).
    """
    np.random.seed(42)
    # Features: hour_of_day (0-23), month (1-12), irradiance (W/m2), wind_speed (m/s), outside_temp (C)
    hours = np.random.randint(0, 24, size=num_samples)
    months = np.random.randint(1, 13, size=num_samples)
    
    # Solar irradiance is 0 during Arctic polar night (Nov-Feb)
    is_polar_night = (months >= 11) | (months <= 2)
    base_irradiance = np.where(
        is_polar_night,
        0.0,
        np.maximum(0.0, np.sin((hours - 6) / 12 * np.pi) * 450 + np.random.normal(0, 40, size=num_samples))
    )
    irradiance = np.clip(base_irradiance, 0, 800)

    wind_speed = np.clip(np.random.weibull(a=2.0, size=num_samples) * 7.5, 0, 30)
    outside_temp = np.random.normal(-18.0, 8.0, size=num_samples)

    # Physical Targets (kW)
    # Solar PV output with temperature derating
    solar_kw = np.where(irradiance > 0, 48.0 * (irradiance / 1000.0) * (1 - 0.0038 * (outside_temp - 25.0)), 0.0)
    solar_kw = np.clip(solar_kw + np.random.normal(0, 0.5, size=num_samples), 0, 48)

    # Wind turbine output (30kW each x 2 = 60kW, feather at 25 m/s)
    wind_kw = np.where(
        (wind_speed < 3.0) | (wind_speed >= 25.0),
        0.0,
        np.where(wind_speed < 12.0, 60.0 * (((wind_speed - 3.0) / 9.0) ** 2.2), 58.0)
    )
    wind_kw = np.clip(wind_kw + np.random.normal(0, 0.8, size=num_samples), 0, 60)

    X = np.column_stack([hours, months, irradiance, wind_speed, outside_temp])
    y_solar = solar_kw
    y_wind = wind_kw

    return X, y_solar, y_wind

def load_or_generate_training_data():
    scada_csv = os.path.join(os.path.dirname(__file__), "..", "data", "siaps_scada_training_dataset_2024.csv")
    if os.path.exists(scada_csv):
        print(f"[SIAPS AI] Loading REAL Svalbard 2024 SCADA Dataset: {scada_csv} (8,784 rows)...")
        df = pd.read_csv(scada_csv)
        df["hour"] = pd.to_datetime(df["timestamp"]).dt.hour
        df["month"] = pd.to_datetime(df["timestamp"]).dt.month
        X = df[["hour", "month", "solar_irradiance_wm2", "wind_speed_ms", "temperature_c"]].values
        y_solar = df["solar_output_kw"].values
        y_wind = df["wind_output_kw"].values
        return X, y_solar, y_wind

    print("[SIAPS AI] Real SCADA dataset not found, generating synthetic fallback...")
    return generate_synthetic_historical_telemetry()

def train_renewable_forecasters():
    X, y_solar, y_wind = load_or_generate_training_data()
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_solar_train, y_solar_test = y_solar[:split], y_solar[split:]
    y_wind_train, y_wind_test = y_wind[:split], y_wind[split:]

    print("[SIAPS AI] Training Solar Generation ML Regressor...")
    solar_model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    solar_model.fit(X_train, y_solar_train)
    solar_preds = solar_model.predict(X_test)
    print(f"  Solar Model R2 Score: {r2_score(y_solar_test, solar_preds):.3f} | RMSE: {np.sqrt(mean_squared_error(y_solar_test, solar_preds)):.2f} kW")

    print("[SIAPS AI] Training Wind Generation ML Regressor...")
    wind_model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
    wind_model.fit(X_train, y_wind_train)
    wind_preds = wind_model.predict(X_test)
    print(f"  Wind Model R2 Score:  {r2_score(y_wind_test, wind_preds):.3f} | RMSE: {np.sqrt(mean_squared_error(y_wind_test, wind_preds)):.2f} kW")

    # Save trained models
    joblib.dump(solar_model, os.path.join(MODELS_DIR, "solar_model.joblib"))
    joblib.dump(wind_model, os.path.join(MODELS_DIR, "wind_model.joblib"))

    # Save models metadata
    meta = {
        "solar_r2": round(r2_score(y_solar_test, solar_preds), 3),
        "wind_r2": round(r2_score(y_wind_test, wind_preds), 3),
        "training_samples": len(X_train),
        "features": ["hour", "month", "irradiance", "wind_speed", "outside_temp"]
    }
    with open(os.path.join(MODELS_DIR, "renewable_forecaster_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[SIAPS AI] Models successfully trained and saved in {MODELS_DIR}!")

if __name__ == "__main__":
    train_renewable_forecasters()
