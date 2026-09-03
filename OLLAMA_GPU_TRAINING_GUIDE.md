# Ollama GPU Training & Development Guide
**Platform:** SIAPS — Smart Integrated Autonomous Power System  
**Hardware:** GPU Laptop (NVIDIA CUDA / High-RAM CPU)  
**Target:** Local LLM Inference, Fine-Tuning, and Station Controller AI  

---

## 1. Setting Up Ollama on Your GPU Laptop

### Step 1: Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com/download):
- On Windows: Run `OllamaSetup.exe`.
- Ollama will automatically detect your NVIDIA GPU and enable CUDA hardware acceleration.

### Step 2: Verify GPU Acceleration
Open PowerShell and run:
```powershell
ollama run llama3.2
```
Type a test message like `"Hello"`. Ollama will download the model (~2.0 GB) and execute inference on your GPU. Type `/bye` to exit.

---

## 2. Build the Custom SIAPS Mission Controller Model

Your repository includes a tailored **`backend/ai_models/Modelfile`** pre-configured with Svalbard Station physics and decision rules.

To build your custom AI model inside Ollama:
```powershell
# From the project root:
ollama create siaps-controller -f backend/ai_models/Modelfile
```

Test it in terminal:
```powershell
ollama run siaps-controller "Telemetry: SOC 76%, Net Balance -14 kW. Weather: Blizzard gusts 28 m/s."
```
It will respond with a structured JSON recommendation following your station's rules.

---

## 3. Connecting the Backend to Your Local Ollama

Your Python backend (`backend/recommendations.py`) is already configured to automatically query your local GPU Ollama instance:
```powershell
# In terminal 1: Ensure Ollama is running in background (default port 11434)
# In terminal 2: Start the SIAPS backend
.\venv\Scripts\activate
$env:OLLAMA_MODEL = "siaps-controller"
uvicorn backend.main:app --reload --port 8000
```

When `uvicorn` runs, any recommendation request will be processed directly by **your GPU via Ollama** in milliseconds!

---

## 4. Fine-Tuning with Your GPU (LoRA / QLoRA)

If you want to fine-tune a model on past Arctic incidents, equipment failure logs, and microgrid actions:

### Using Unsloth (Fastest Free Open-Source GPU Fine-Tuning)
1. Install Unsloth & dependencies on your GPU laptop:
   ```powershell
   pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
   pip install --no-deps trl peft accelerate bitsandbytes
   ```

2. Fine-tune on `backend/ai_models/train_dataset.jsonl`:
   ```python
   from unsloth import FastLanguageModel
   import torch

   model, tokenizer = FastLanguageModel.from_pretrained(
       model_name = "unsloth/Llama-3.2-3B-Instruct",
       max_seq_length = 2048,
       load_in_4bit = True, # Fits easily on 4GB-8GB VRAM
   )

   model = FastLanguageModel.get_peft_model(
       model,
       r = 16,
       target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"],
       lora_alpha = 16,
       lora_dropout = 0,
   )

   # Train on backend/ai_models/train_dataset.jsonl ...
   # Export directly to GGUF for Ollama:
   model.save_pretrained_gguf("siaps_trained_model", tokenizer, quantization_method = "q4_k_m")
   ```

3. Import the trained weights into Ollama:
   ```powershell
   ollama create siaps-finetuned -f Modelfile
   ```

---

## 5. Summary of Workflow on the New Laptop

1. `git clone https://github.com/ShravanDeb/SIH-2026-PS-26061.git`
2. Run `ollama create siaps-controller -f backend/ai_models/Modelfile`
3. Start backend: `uvicorn backend.main:app --reload --port 8000`
4. Start frontend: `npm run dev`

Your GPU laptop will now run the **complete cyber-physical microgrid simulator, real-time physics digital twin, and local GPU-powered AI Mission Controller** with zero external dependencies!
