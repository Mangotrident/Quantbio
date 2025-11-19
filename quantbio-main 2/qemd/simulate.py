# qemd/simulate.py
import numpy as np
from scipy.linalg import expm
from .config import (
    NUM_ETC_SITES, K_SINK, K_LOSS, SINK_INDEX,
    TIME_END, DT, GAMMAS_SWEEP
)
from .metrics import (
    compute_ete,
    compute_tau_c,
)

def build_hamiltonian(epsilon, J):
    """
    Build the N-site Hamiltonian H from site energies and couplings.
    epsilon: list/array of length N
    J: length N-1 nearest-neighbor couplings
    """
    epsilon = np.asarray(epsilon, dtype=float)
    J = np.asarray(J, dtype=float)

    N = len(epsilon)
    H = np.diag(epsilon)

    for i in range(N - 1):
        H[i, i + 1] = J[i]
        H[i + 1, i] = J[i]

    return H.astype(complex)

def build_lindblad_ops(num_sites, gamma, k_sink, k_loss):
    """
    Build Lindblad jump operators L_k:
      - Dephasing at each site (gamma)
      - Non-productive loss from all but sink
      - Sink dissipation at sink site
    """
    L_ops = []

    # 1. Dephasing
    for i in range(num_sites):
        A = np.zeros((num_sites, num_sites), dtype=complex)
        A[i, i] = 1.0
        L_ops.append(np.sqrt(gamma) * A)

    # 2. Loss (non-productive)
    for i in range(num_sites):
        if i == SINK_INDEX:
            continue
        A = np.zeros((num_sites, num_sites), dtype=complex)
        A[i, i] = 1.0
        L_ops.append(np.sqrt(k_loss) * A)

    # 3. Sink dissipation
    A_sink = np.zeros((num_sites, num_sites), dtype=complex)
    A_sink[SINK_INDEX, SINK_INDEX] = 1.0
    L_ops.append(np.sqrt(k_sink) * A_sink)

    return L_ops

def time_evolve(rho0, H, L_ops, T_end, dt):
    """
    Lindblad time evolution using superoperator formalism:
      dρ/dt = L_total(ρ)
    with ρ vectorized and advanced via expm(L_total * dt).
    """
    N = rho0.shape[0]

    I = np.identity(N, dtype=complex)
    L_H = -1j * (np.kron(I, H) - np.kron(H.T, I))

    L_D = np.zeros((N * N, N * N), dtype=complex)
    for Lk in L_ops:
        Lk = np.asarray(Lk, dtype=complex)
        Lk_dag = Lk.conj().T
        Lk_dag_Lk = Lk_dag @ Lk

        term1 = np.kron(Lk.conj(), Lk)
        term2 = 0.5 * (np.kron(I, Lk_dag_Lk) + np.kron(Lk_dag_Lk.T, I))
        L_D += (term1 - term2)

    L_total = L_H + L_D

    times = np.arange(0.0, T_end + dt, dt, dtype=float)
    rho_vec = rho0.flatten()
    rho_t_series = [rho0.copy()]

    U_dt = expm(L_total * dt)

    for _ in times[1:]:
        rho_vec = U_dt @ rho_vec
        if not np.all(np.isfinite(rho_vec)):
            # Numerical blow-up guard
            rho_vec = np.nan_to_num(rho_vec, nan=0.0, posinf=0.0, neginf=0.0)
        rho_new = rho_vec.reshape((N, N))
        rho_t_series.append(rho_new)

    return rho_t_series, times

def compute_ete_for_gamma(params, gamma, T, dt):
    """
    Run a single simulation for a given gamma and compute ETE.
    """
    epsilon = params['epsilon']
    J = params['J']
    # Use params k_sink/k_loss if available, else config defaults
    k_sink = params.get('k_sink', K_SINK)
    k_loss = params.get('k_loss', K_LOSS)

    H = build_hamiltonian(epsilon, J)
    L_ops = build_lindblad_ops(NUM_ETC_SITES, gamma, k_sink, k_loss)

    rho0 = np.zeros((NUM_ETC_SITES, NUM_ETC_SITES), dtype=complex)
    rho0[0, 0] = 1.0

    rho_t_series, _ = time_evolve(rho0, H, L_ops, T, dt)
    ete = compute_ete(rho_t_series, SINK_INDEX, k_sink, dt)
    return float(ete)

def enaqt_sweep(params, gammas=GAMMAS_SWEEP, T=TIME_END, dt=DT):
    """
    Sweep gamma across GAMMAS_SWEEP and build ENAQT curve.
    """
    results = []
    for g in gammas:
        ete = compute_ete_for_gamma(params, g, T, dt)
        results.append({"gamma": float(g), "ETE": float(ete)})
    return results

def run_full_simulation(params):
    """
    Run full simulation using omics-derived gamma.
    Returns:
      - ETE_instant
      - tau_c
      - rho_series
      - times
    """
    epsilon = params['epsilon']
    J = params['J']
    gamma = params['gamma']
    k_sink = params.get('k_sink', K_SINK)
    k_loss = params.get('k_loss', K_LOSS)

    H = build_hamiltonian(epsilon, J)
    L_ops = build_lindblad_ops(NUM_ETC_SITES, gamma, k_sink, k_loss)

    rho0 = np.zeros((NUM_ETC_SITES, NUM_ETC_SITES), dtype=complex)
    rho0[0, 0] = 1.0

    rho_t_series, times = time_evolve(rho0, H, L_ops, TIME_END, DT)

    ete_instant = compute_ete(rho_t_series, SINK_INDEX, k_sink, DT)
    tau_c = compute_tau_c(rho_t_series, times)

    return {
        "ETE_instant": float(ete_instant),
        "tau_c": float(tau_c),
        "rho_series": rho_t_series,
        "times": times,
    }
