import os
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
WEATHER_CSV = os.path.join(DATA_DIR, "real_svalbard_weather_2024.csv")
OUTPUT_SCADA_CSV = os.path.join(DATA_DIR, "siaps_scada_training_dataset_2024.csv")

def generate_microgrid_scada_from_real_weather():
    if not os.path.exists(WEATHER_CSV):
        raise FileNotFoundError(f"Weather data file not found: {WEATHER_CSV}")

    print("[SIAPS AI] Loading REAL Svalbard 2024 weather telemetry...")
    df = pd.read_csv(WEATHER_CSV)

    # Microgrid Parameters
    solar_cap = 48.0 # kW
    wind_cap = 60.0  # kW (2x 30 kW)
    battery_cap_kwh = 400.0
    u_cabin = 0.28   # W/m2K
    area_cabin = 380 # m2

    solar_kw_list = []
    wind_kw_list = []
    heating_kw_list = []
    total_load_kw_list = []
    net_balance_list = []
    battery_soc_list = []
    generator_kw_list = []
    renewable_pct_list = []

    current_soc = 78.0 # initial SOC

    for _, row in df.iterrows():
        irr = row["solar_irradiance_wm2"]
        temp = row["temperature_c"]
        wind = row["wind_speed_ms"]
        gust = row["wind_gust_ms"]

        # 1. Physics-based Solar PV calculation with temperature derating
        if irr > 0:
            t_cell = temp + (irr / 800.0) * 25.0
            temp_coeff = 1.0 - 0.0038 * (t_cell - 25.0)
            p_solar = round(np.clip(solar_cap * (irr / 1000.0) * temp_coeff * 0.95, 0, solar_cap), 1)
        else:
            p_solar = 0.0

        # 2. Aerodynamic Wind Turbine with 25 m/s feathering cutoff
        if wind >= 25.0 or gust >= 28.0 or wind < 3.0:
            p_wind = 0.0
        elif wind < 12.0:
            v_norm = (wind - 3.0) / 9.0
            p_wind = round(np.clip(wind_cap * (v_norm ** 2.2), 0, wind_cap), 1)
        else:
            p_wind = round(wind_cap * 0.95, 1)

        # 3. Cabin Heat Loss & Demand
        delta_t = max(0.0, 19.0 - temp)
        wind_factor = 1.0 + (wind / 25.0) * 0.35
        p_heating = round((u_cabin * area_cabin * delta_t * wind_factor) / 1000.0 + 4.5, 1)
        
        # Total load = Life Support (12.8) + Science (11.4) + Heating + Comm/Compute/Flexible (13.5)
        total_load = round(12.8 + 11.4 + p_heating + 13.5, 1)

        # 4. Energy Dispatch Optimization
        p_renewables = p_solar + p_wind
        net_balance = round(p_renewables - total_load, 1)

        batt_net = 0.0
        p_gen = 0.0

        if net_balance >= 0:
            # Charge battery up to 90%
            headroom = max(0.0, (90.0 - current_soc) / 100.0 * battery_cap_kwh)
            batt_net = min(net_balance, 50.0, headroom)
        else:
            # Discharge battery down to 20%
            deficit = abs(net_balance)
            usable_reserve = max(0.0, (current_soc - 20.0) / 100.0 * battery_cap_kwh)
            batt_net = -min(deficit, 50.0, usable_reserve)
            unmet = deficit - abs(batt_net)
            if unmet > 0:
                p_gen = round(min(unmet, 80.0), 1)

        # Update battery SOC for next hour
        soc_delta = (batt_net / battery_cap_kwh) * 100.0 * (0.95 if batt_net >= 0 else 1.05)
        current_soc = round(np.clip(current_soc + soc_delta, 10.0, 100.0), 2)

        # Renewable share %
        delivered = p_renewables + p_gen + max(0.0, -batt_net)
        ren_pct = round((p_renewables / max(0.1, delivered)) * 100.0, 1) if delivered > 0 else 100.0

        solar_kw_list.append(p_solar)
        wind_kw_list.append(p_wind)
        heating_kw_list.append(p_heating)
        total_load_kw_list.append(total_load)
        net_balance_list.append(net_balance)
        battery_soc_list.append(current_soc)
        generator_kw_list.append(p_gen)
        renewable_pct_list.append(min(100.0, ren_pct))

    df["solar_output_kw"] = solar_kw_list
    df["wind_output_kw"] = wind_kw_list
    df["heating_demand_kw"] = heating_kw_list
    df["station_load_kw"] = total_load_kw_list
    df["net_balance_kw"] = net_balance_list
    df["battery_soc_pct"] = battery_soc_list
    df["generator_output_kw"] = generator_kw_list
    df["renewable_share_pct"] = renewable_pct_list

    df.to_csv(OUTPUT_SCADA_CSV, index=False)
    print(f"[SIAPS AI] High-Fidelity Microgrid SCADA Dataset generated with {len(df):,} hourly rows!")
    print(f"[SIAPS AI] Saved to: {OUTPUT_SCADA_CSV}")

if __name__ == "__main__":
    generate_microgrid_scada_from_real_weather()
