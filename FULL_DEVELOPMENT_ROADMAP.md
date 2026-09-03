# SIAPS Full Step-by-Step Development Roadmap
**Project:** SIAPS — Smart Integrated Autonomous Power System (Svalbard Station Alpha)  
**Hackathon Target:** Smart India Hackathon 2026 (PS-26061)  
**Repository:** [https://github.com/ShravanDeb/SIH-2026-PS-26061](https://github.com/ShravanDeb/SIH-2026-PS-26061)  
**Current Date:** September 2026  

---

## Stage 0: Current Foundation (Completed)
- ✅ Git repository created and synchronized.
- ✅ React 19 + Tailwind CSS v4 frontend built with zero compilation errors.
- ✅ Decoupled Dual-AI Architecture implemented:
  - **System 1: LLM Engine** (`backend/llm/`) for natural language and operator dialogue via Ollama.
  - **System 2: SIAPS AI Core** (`backend/siaps_ai/`) running autonomously at 1 Hz for physical digital twin, forecasting, MILP energy dispatch, vibration FFT, and safety interlocks.
  - **AI Agent Orchestrator** (`backend/orchestrator/`) bridging the operator, the LLM, and SIAPS AI tools with strict safety enforcement.
- ✅ Free open-source stack established (FastAPI, SQLite, Open-Meteo, SciPy, PyTorch, Ollama).

---

## Stage 1: Setup & Run on Your GPU Laptop

### Step 1.1: Clone and Environment Setup
```powershell
# In PowerShell:
git clone https://github.com/ShravanDeb/SIH-2026-PS-26061.git
cd SIH-2026-PS-26061

# Python virtual environment:
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt

# Node frontend packages:
npm install
```

### Step 1.2: Install Ollama & Build the Custom Model
1. Download & install Ollama for Windows from [ollama.com](https://ollama.com).
2. Pull the base model on your GPU:
   ```powershell
   ollama run llama3.2
   ```
3. Build the specialized SIAPS controller model using the repository Modelfile:
   ```powershell
   ollama create siaps-assistant -f backend/ai_models/Modelfile
   ```

### Step 1.3: Launch and Verify
- **Terminal 1 (Backend):**
  ```powershell
  .\venv\Scripts\activate
  uvicorn backend.main:app --reload --port 8000
  ```
  - Open `http://localhost:8000/docs` to test endpoints.
  - Open `http://localhost:8000/api/system-status` to verify both AI systems report `active`.
- **Terminal 2 (Frontend):**
  ```powershell
  npm run dev
  ```
  - Open `http://localhost:5173` to view the mission control dashboard.

---

## Stage 2: Train the 4 Specialized ML Models of SIAPS AI

Unlike the LLM (which handles text), **SIAPS AI** uses 4 distinct numerical machine learning models trained on physical time-series data:

```
┌─────────────────────────────────────────────────────────────┐
│                    TRAINING SIAPS AI                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Solar/Wind Forecaster  ──► XGBoost / LightGBM            │
│ 2. Station Demand Model   ──► PyTorch LSTM / GRU            │
│ 3. Bearing Anomaly Model  ──► PyTorch 1D-CNN Autoencoder    │
│ 4. Battery Health (SOH)   ──► Random Forest / Weibull       │
└─────────────────────────────────────────────────────────────┘
```

### Step 2.1: Model 1 — Renewable Generation Forecaster (XGBoost)
- **Goal:** Predict hourly solar and wind kW for the next 24 hours.
- **Features:** Solar irradiance ($W/m^2$), cloud cover index, ambient temperature, wind speed ($m/s$), wind gust, and hour of day.
- **Training Tool:** `scikit-learn` & `xgboost`.
- **Target File:** Save trained model to `backend/siaps_ai/models/renewable_forecaster.json`.

### Step 2.2: Model 2 — Arctic Station Demand Forecaster (PyTorch LSTM)
- **Goal:** Predict heating and operational electrical demand.
- **Features:** Exterior Arctic temperature, wind chill index, time of day, station occupancy count, scientific experiment schedules.
- **Training Tool:** PyTorch recurrent neural network (LSTM/GRU) trained on GPU.
- **Target File:** Save weights to `backend/siaps_ai/models/demand_lstm.pt`.

### Step 2.3: Model 3 — Turbine Bearing Vibration Anomaly Detector (PyTorch Autoencoder)
- **Goal:** Detect gearbox micro-cracks before mechanical failure.
- **Data:** 10 kHz accelerometer vibration waveform samples.
- **Architecture:** 1D Convolutional Autoencoder. The network learns normal vibration patterns. When bearing damage starts, the reconstruction loss spikes, signaling anomaly.
- **Training Tool:** PyTorch with CUDA acceleration.
- **Target File:** Save weights to `backend/siaps_ai/models/vibration_autoencoder.pt`.

### Step 2.4: Model 4 — Battery State of Health & Degradation Regressor
- **Goal:** Predict remaining capacity and Remaining Useful Life (RUL).
- **Features:** Cumulative kWh throughput, charge/discharge cycle counts, depth of discharge (DOD), cell temperature exposure.
- **Training Tool:** `scikit-learn` Random Forest Regressor.

---

## Stage 3: Fine-Tune the LLM Engine (System 1)

### Step 3.1: Expand the Arctic Mission Training Dataset
- Edit `backend/ai_models/train_dataset.jsonl` to add 50–100 realistic operational scenarios:
  - Severe blizzard incoming: wind gusts > 28 m/s, solar at 0 kW.
  - Battery SOC drops below 25%: dispatch generator, shed non-critical heating.
  - Generator fuel at 15%: prioritize maximum renewable storage.
  - Sensor communication dropout: safe autonomous lock.

### Step 3.2: Fine-Tune with Unsloth / QLoRA on Your GPU
- Run the fine-tuning script on your GPU laptop using 4-bit quantization (takes ~15 minutes on a modern GPU).
- Export to GGUF format:
  ```python
  model.save_pretrained_gguf("siaps_v1_gguf", tokenizer, quantization_method="q4_k_m")
  ```

### Step 3.3: Load into Ollama
```powershell
ollama create siaps-controller-v2 -f backend/ai_models/Modelfile
```

---

## Stage 4: Frontend UI Expansion & Live Interaction

### Step 4.1: Add Interactive AI Mission Chat Drawer to React
- Build a floating chat drawer in `src/components/AIChatModal.tsx` connected to `POST /api/chat`.
- Operators can type in natural language:
  - *"Why did the generator start?"*
  - *"Can we run the science instruments tonight?"*
  - *"Summarize station health for the morning briefing."*
- The AI Agent queries SIAPS AI for ground truth and answers via Ollama in real-time.

### Step 4.2: Fully Wire the Human Approval Views
- Connect `HumanApproval.tsx` and `AIRecommendations.tsx` so clicking **Approve**, **Delay**, or **Reject** triggers real backend requests to `POST /api/recommendations/{id}/action`.
- Enforce operator PIN verification (`1234`) with instant updates in the SQLite audit log.

---

## Stage 5: SIH 2026 Presentation & Demo Mode

### Step 5.1: Create an "Arctic Storm Simulation Mode"
- Add a one-click demo trigger in the dashboard: **"Trigger Blizzard Event"**.
- Demonstrates the entire autonomous pipeline in 60 seconds:
  1. Wind gusts spike to 28 m/s $\rightarrow$ Open-Meteo storm alert triggers.
  2. Wind Turbine T-1 & T-2 auto-feather to prevent destruction.
  3. SIAPS AI Optimizer pre-positions diesel generator to warm-standby.
  4. An AI Recommendation appears requesting Level 2 operator approval.
  5. Operator authorizes action with PIN `1234`.
  6. Generator fires up in 8 seconds; life-support stays uninterrupted.
  7. LLM explains the entire sequence in natural language.

### Step 5.2: Hackathon Deliverables Checklist
- [ ] 2-minute video showing the UI, real 1 Hz WebSocket telemetry, and live Ollama reasoning.
- [ ] Architecture diagram slide highlighting the **Dual-AI decoupled design** (SCADA AI vs LLM).
- [ ] Working offline demo that runs entirely on localhost with zero internet dependence.
