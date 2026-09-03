# Real Dataset Sources & High-Fidelity Synthetic Modeling
**Project:** SIAPS — Smart Integrated Autonomous Power System (Svalbard Station Alpha)  
**Location:** Svalbard, Arctic Norway (78.22°N, 15.65°E)  
**Target:** SIH 2026 (PS-26061)  

---

## Part 1: Real Open-Access Datasets Available for SIAPS

Yes, real open-access data is available for every component of the microgrid. Below is the verified list of primary open sources:

### 1. Real Svalbard Arctic Weather & Meteorological Data
* **Open-Meteo Historical Weather API (ERA5 Reanalysis)**
  - **Source:** Copernicus Climate Change Service (ECMWF ERA5-Land).
  - **Parameters:** Hourly ambient temperature, direct/diffuse solar irradiance ($\text{W/m}^2$), wind speed ($10\text{m}$), wind gusts, surface pressure, snowfall from 1940 to present.
  - **Cost:** **$0.00 (No API key required)**.
  - **Endpoint:** `https://archive-api.open-meteo.com/v1/archive?latitude=78.22&longitude=15.65`
* **Norwegian Meteorological Institute (MET Norway — Frost API)**
  - **Source:** Official Svalbard Airport weather station (`SN99840`, Longyearbyen).
  - **URL:** [frost.met.no](https://frost.met.no/)
  - **Access:** Free open developer key; historical Arctic storm and blizzard observations.
* **Ny-Ålesund Baseline Surface Radiation Network (BSRN)**
  - **Location:** Ny-Ålesund, Svalbard (78.9°N).
  - **Data:** Ground-truth direct normal irradiance (DNI) and global horizontal irradiance (GHI) measuring polar day/night solar radiation.
  - **URL:** [bsrn.awi.de](https://bsrn.awi.de/)

### 2. Real Wind Turbine SCADA & Bearing Failure Datasets
* **EDP Open Data — Wind Turbine SCADA Dataset**
  - **Description:** 2 years of 10-minute SCADA telemetry from 5 operational wind turbines (temperature, rotor speed, pitch, generator power) including documented **gearbox bearing failures**.
  - **URL:** [edp.com/en/innovation/open-data](https://www.edp.com/en/innovation/open-data)
* **NASA Prognostics Center of Excellence (PCoE) — Bearing Dataset (IMS)**
  - **Description:** Run-to-failure vibration data (accelerometers sampled at $20\text{ kHz}$) tracking bearings from healthy state through inner race micro-cracks to complete failure over 35 days.
  - **URL:** [data.nasa.gov](https://data.nasa.gov/dataset/bearing-dataset)
* **Case Western Reserve University (CWRU) Bearing Data Center**
  - **Description:** Benchmark accelerometer recordings ($12\text{ kHz}$ and $48\text{ kHz}$) of inner race, outer race, and ball element faults under different motor loads.
  - **URL:** [engineering.case.edu/bearingdatacenter](https://engineering.case.edu/bearingdatacenter)

### 3. Real Battery Energy Storage System (BESS) Datasets
* **NASA Ames Li-ion Battery Run-to-Failure Dataset**
  - **Description:** 18650 and prism cell charge/discharge cycles under varying currents and ambient temperatures, recording capacity fading and internal impedance ($R_{\text{int}}$).
  - **URL:** [data.nasa.gov](https://data.nasa.gov/dataset/Li-ion-Battery-Aging-Datasets)
* **Oxford Battery Degradation Dataset**
  - **Description:** Long-term electrochemical aging of LiFePO₄ and NMC cells under dynamic thermal cycles.
  - **URL:** [ora.ox.ac.uk](https://ora.ox.ac.uk/)

---

## Part 2: The High-Fidelity Physics-Informed Pipeline

To achieve **100% station fidelity for Svalbard Station Alpha**, we use a **hybrid strategy**:
1. **Fetch REAL Svalbard Arctic Weather** (hourly temperature, irradiance, wind gusts from the 2024 ERA5 dataset for coordinates $78.22^\circ\text{N}, 15.65^\circ\text{E}$).
2. **Propagate Weather through Physical Microgrid Digital Twin**:
   - **Solar PV ($48\text{ kW}$)**: Accounts for polar night (0 irradiance Nov–Feb), solar elevation angle, and temperature derating ($\gamma = -0.38\%/^\circ\text{C}$).
   - **Wind Turbines ($60\text{ kW}$)**: Aerodynamic $C_p$ cubic curve with automated feathering cutoff when wind gusts exceed $25\text{ m/s}$.
   - **LiFePO₄ Battery ($400\text{ kWh}$)**: Coulomb counting with internal resistance losses ($I^2 R$), Peukert capacity adjustments, and cell temperature delta.
   - **Cabin Thermal Loss**: $Q = U \cdot A \cdot \Delta T \cdot \text{wind\_factor}$ predicting realistic HVAC loads down to $-30^\circ\text{C}$.
   - **Turbine Accelerometer ($10\text{ kHz}$)**: Synthesizes real bearing defect frequencies (BPFI at $118\text{ Hz}$, $1X$ shaft rotation at $0.7\text{ Hz}$, and white noise) matching the NASA IMS bearing degradation profile.

This gives your Machine Learning models **real Arctic climate variance** combined with **precise microgrid physics**.
