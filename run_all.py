import subprocess
import sys
import os
import signal

print("=" * 65)
print("  SIAPS: Smart Integrated Autonomous Power System")
print("  Bharati & Maitri Polar Stations, Antarctica")
print("  Launching Backend (port 8000) & Frontend (port 5173) together...")
print("=" * 65)

is_win = os.name == "nt"

# 1. Launch FastAPI Backend
backend_cmd = [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000"]
backend_proc = subprocess.Popen(backend_cmd)

# 2. Launch Vite Frontend
frontend_cmd = ["npm.cmd" if is_win else "npm", "run", "dev"]
frontend_proc = subprocess.Popen(frontend_cmd)

def handle_exit(signum, frame):
    print("\n[SIAPS] Shutting down services...")
    backend_proc.terminate()
    frontend_proc.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)
signal.signal(signal.SIGTERM, handle_exit)

try:
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    handle_exit(None, None)
