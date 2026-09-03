# Developer Setup Guide: Continuing on Your GPU/CPU Laptop

This guide walks you through setting up and running **SIAPS (Smart Integrated Autonomous Power System)** on your other laptop from this exact stage.

---

## 1. Prerequisites on the New Laptop

Make sure the new laptop has:
1. **Git** ([git-scm.com](https://git-scm.com/))
2. **Node.js 20+** ([nodejs.org](https://nodejs.org/))
3. **Python 3.10+** ([python.org](https://python.org/))
4. *(Optional)* **CUDA Toolkit & PyTorch** if you plan to train custom deep learning models on your GPU.

---

## 2. Step 1: Clone the Repository

Open PowerShell / Terminal on your new laptop and clone your GitHub repository:

```bash
git clone https://github.com/ShravanDeb/SIH-2026-PS-26061.git
cd SIH-2026-PS-26061
```

---

## 3. Step 2: Set Up the Python AI Backend

Create a Python virtual environment and install the dependencies:

```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# 3. Install backend dependencies (all 100% free open-source)
pip install -r backend/requirements.txt
```

---

## 4. Step 3: Set Up the React UI Frontend

Install frontend packages using npm or pnpm:

```bash
npm install
```

---

## 5. Step 4: Running the System

You will run two terminals:

### Terminal 1: Start the Real-Time AI Backend Server
```bash
# Make sure venv is activated:
.\venv\Scripts\activate
uvicorn backend.main:app --reload --port 8000
```
- **Live Swagger API Documentation:** Open `http://localhost:8000/docs` in your browser.
- **WebSocket 1 Hz Telemetry Stream:** Running at `ws://localhost:8000/ws/telemetry`.

### Terminal 2: Start the React Frontend Dashboard
```bash
npm run dev
```
- Open `http://localhost:5173` (or the port shown in your terminal) to view the live dashboard!

---

## 6. How Your GPU Will Help Future Extensions

Because your new laptop has a dedicated GPU and powerful CPU, you can take Phase 2 and Phase 3 even further:
1. **Train PyTorch Vibration Autoencoders**: Train high-frequency bearing failure neural networks on raw vibration time-series data using CUDA acceleration.
2. **Run Local High-Parameter LLMs**: Run local reasoning models (e.g. Llama 3.3 8B / Mistral 7B via vLLM or HuggingFace) entirely on your GPU VRAM with zero external cloud dependencies.
3. **Deep Reinforcement Learning (RL)**: Train a continuous action-space policy (e.g., PPO or Soft Actor-Critic via Stable-Baselines3) for dynamic multi-microgrid islanding and black-start coordination.

---

*Repository maintained at [https://github.com/ShravanDeb/SIH-2026-PS-26061](https://github.com/ShravanDeb/SIH-2026-PS-26061)*
