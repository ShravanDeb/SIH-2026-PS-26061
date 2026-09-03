import requests
import json
import sys

OLLAMA_URL = "http://localhost:11434/api/tags"

def test_ollama():
    print("==================================================")
    print("       SIAPS Local Ollama Diagnostic Tool         ")
    print("==================================================")
    print(f"Checking connection to Ollama at {OLLAMA_URL} ...")
    
    try:
        res = requests.get(OLLAMA_URL, timeout=3)
        if res.status_code == 200:
            data = res.json()
            models = data.get("models", [])
            print("Status: [CONNECTED]")
            print(f"Detected {len(models)} installed model(s):")
            for m in models:
                name = m.get("name")
                size_gb = round(m.get("size", 0) / (1024**3), 2)
                print(f"  - {name} ({size_gb} GB)")
            
            if not models:
                print("\n[NOTE] Ollama is running, but no models are downloaded yet.")
                print("Run: ollama run llama3.2")
            else:
                print("\nReady! Your SIAPS backend will automatically use your local Ollama AI.")
        else:
            print(f"Status: Received HTTP {res.status_code}")
    except requests.exceptions.ConnectionError:
        print("Status: [NOT DETECTED]")
        print("\nOllama is not running on localhost:11434.")
        print("1. Download & install from: https://ollama.com/download")
        print("2. Run in a terminal: ollama run llama3.2")
        print("3. Re-run this test script: python backend/test_ollama.py")

if __name__ == "__main__":
    test_ollama()
