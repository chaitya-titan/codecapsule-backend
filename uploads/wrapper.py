import builtins
import os
import sys
import io

# -------------- CONFIG --------------
SANDBOX_DIR = os.environ.get("SANDBOX_DIR", "/tmp/sandbox")
os.makedirs(SANDBOX_DIR, exist_ok=True)
# -------------------------------------

# ---- 1. Prompt Detection ----
original_input = builtins.input

def hooked_input(prompt=""):
    print(f"__PROMPT__{prompt}", flush=True)  # marker for backend
    return original_input(prompt)

builtins.input = hooked_input

# ---- 2. Safe File Writes ----
original_open = builtins.open

def sandbox_open(file, mode="r", *args, **kwargs):
    # Only redirect writes / append / create
    if any(flag in mode for flag in ["w", "a", "x", "+"]):
        # If absolute path OR path tries to escape sandbox
        if os.path.isabs(file) or ".." in os.path.normpath(file):
            filename_only = os.path.basename(file)
            file = os.path.join(SANDBOX_DIR, filename_only)
        else:
            file = os.path.join(SANDBOX_DIR, file)
        # Ensure directory exists
        os.makedirs(os.path.dirname(file), exist_ok=True)
    return original_open(file, mode, *args, **kwargs)

builtins.open = sandbox_open

# ---- 3. Redirect cwd ----
os.chdir(SANDBOX_DIR)

# ---- 4. Execute user script ----
script_path = sys.argv[1]
with open(script_path, "r") as f:
    code = f.read()

exec(code, {})
