import builtins, os, sys

EXEC_ID = os.environ.get("EXEC_ID", "default")
GENERATED_DIR = f"/generated/{EXEC_ID}"
os.makedirs(GENERATED_DIR, exist_ok=True)

# ---- 1. Override print ----
original_print = builtins.print
def custom_print(*args, **kwargs):
    kwargs["flush"] = True  # force flush always
    original_print(*args, **kwargs)
builtins.print = custom_print

# ---- 2. Override input ----
original_input = builtins.input
def hooked_input(prompt=""):
    print(f"__PROMPT__{prompt}", flush=True)  # special marker for backend
    return original_input()  # still read from stdin (backend feeds into it)
builtins.input = hooked_input

# ---- 3. Override open for file writes ----
original_open = builtins.open
def sandbox_open(file, mode="r", *args, **kwargs):
    if any(flag in mode for flag in ["w", "a", "x", "+"]):
        file = os.path.join(GENERATED_DIR, os.path.basename(file))
    return original_open(file, mode, *args, **kwargs)
builtins.open = sandbox_open

# ---- 4. Execute user script ----
script_path = sys.argv[1]
with open(script_path, "r") as f:
    code = f.read()

exec(code, {"__name__": "__main__"})
