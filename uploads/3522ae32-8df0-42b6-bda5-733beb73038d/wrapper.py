import builtins
import os
import sys
import websocket
import threading
import json

# -------------- CONFIG --------------
EXEC_ID = os.environ.get("EXEC_ID", "default")
BACKEND_WS_URL = os.environ.get("BACKEND_WS_URL", f"ws://host.docker.internal:8000/ws/{EXEC_ID}")
GENERATED_DIR = f"/generated/{EXEC_ID}"

# Ensure generated folder exists
os.makedirs(GENERATED_DIR, exist_ok=True)
# -------------------------------------

# ---- 1. WebSocket Client Setup ----
ws = websocket.WebSocket()

def connect_ws():
    try:
        ws.connect(BACKEND_WS_URL)
    except Exception as e:
        print(f"[wrapper.py] WS connection failed: {e}", flush=True)

# Run connection in background thread
threading.Thread(target=connect_ws, daemon=True).start()

# ---- 2. Override print to send to backend ----
original_print = builtins.print

def custom_print(*args, **kwargs):
    message = " ".join(str(a) for a in args)
    try:
        ws.send(json.dumps({"type": "stdout", "message": message}))
    except Exception:
        pass  # WS may not be connected yet
    original_print(*args, **kwargs)

builtins.print = custom_print

# ---- 3. Override input to request from backend ----
original_input = builtins.input

def custom_input(prompt=""):
    try:
        # Send prompt marker to backend
        ws.send(json.dumps({"type": "input_request", "prompt": prompt}))
        # Wait for response
        response = ws.recv()
        data = json.loads(response)
        return data.get("input", "")
    except Exception:
        # fallback to normal input if WS fails
        return original_input(prompt)

builtins.input = custom_input

# ---- 4. Override open() to redirect file writes ----
original_open = builtins.open

def sandbox_open(file, mode="r", *args, **kwargs):
    if any(flag in mode for flag in ["w", "a", "x", "+"]):
        filename_only = os.path.basename(file)
        file = os.path.join(GENERATED_DIR, filename_only)
        os.makedirs(os.path.dirname(file), exist_ok=True)
    return original_open(file, mode, *args, **kwargs)

builtins.open = sandbox_open

# ---- 5. Execute user script ----
script_path = sys.argv[1]
with open(script_path, "r") as f:
    code = f.read()

exec(code, {"__name__": "__main__"})
