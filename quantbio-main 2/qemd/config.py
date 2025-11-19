# qemd/config.py
import numpy as np

# --- Simulation Constants ---
NUM_ETC_SITES = 7   # 7-node ETC model
TIME_END = 500.0    # ps (total evolution time) - Increased from 50.0 to allow transport
DT = 0.05           # ps (time step)

# --- Decoherence (Gamma) Sweep Range for ENAQT Curve ---
GAMMA_MIN = 0.005   # /ps
GAMMA_MAX = 0.05    # /ps
GAMMA_SWEEP_STEPS = 20
GAMMAS_SWEEP = np.linspace(GAMMA_MIN, GAMMA_MAX, GAMMA_SWEEP_STEPS)
GAMMA_MID = 0.02

# --- Dissipation Constants ---
K_SINK = 0.03       # /ps
K_LOSS = 0.005      # /ps
SINK_INDEX = NUM_ETC_SITES - 1  # last site

# --- Mapping Hyperparameters ---
EPS_ALPHA = 0.05    # z-score → ε scale
J_BASE = 0.05       # base coupling
J_BETA = 0.3        # z-score → J scale
GAMMA_LAM = 0.4     # redox z → γ scale
J_MIN_CLIP = 0.02
J_MAX_CLIP = 0.08
