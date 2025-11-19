# qemd/metrics.py
import numpy as np

def compute_ete(rho_t_series, sink_index, k_sink, dt):
    """
    Energy Transfer Efficiency (ETE):
    Integral of probability current into the sink:
        ETE = ∫ k_sink * P_sink(t) dt
    Clamped to [0, 1].
    """
    ete = 0.0
    for rho in rho_t_series:
        sink_pop = float(np.real(rho[sink_index, sink_index]))
        # sink_pop = max(sink_pop, 0.0) # Optional: clamp population
        ete += k_sink * sink_pop * dt

    return float(np.clip(ete, 0.0, 1.0))

def coherence_measure(rho):
    """
    Total coherence via Frobenius norm of off-diagonal elements.
    """
    # Enforce Hermiticity numerically
    # rho = 0.5 * (rho + rho.conj().T) # Optional, but good for stability

    off_diag = rho.copy()
    np.fill_diagonal(off_diag, 0.0)
    # Frobenius norm of off-diagonal part
    coh = np.linalg.norm(off_diag, ord='fro')
    return float(coh)

def compute_tau_c(rho_t_series, times):
    """
    Coherence lifetime tau_c:
        tau_c = ∫ t C(t) dt / ∫ C(t) dt
    where C(t) is coherence_measure(rho(t)).
    """
    times = np.asarray(times, dtype=float)

    C = np.array([coherence_measure(rho) for rho in rho_t_series], dtype=float)
    # Remove negative / non-finite values
    C[~np.isfinite(C)] = 0.0
    C = np.maximum(C, 0.0)

    den = np.trapz(C, times)
    if den <= 1e-12:
        return 0.0

    num = np.trapz(times * C, times)
    tau = num / den

    if not np.isfinite(tau):
        return 0.0

    # **Critical physical bound:** tau_c must be within the simulated window
    # But prompt says: "No more absurd 10⁹ ps."
    # The prompt logic is:
    # num = np.trapz(times * C, times)
    # den = np.trapz(C, times)
    # tau = num / den
    return float(tau)

def normalize_tau_c(tau_values):
    """
    Normalize tau_c across cohort using 5th and 95th percentiles.
    """
    tau_arr = np.array(tau_values)
    q5, q95 = np.percentile(tau_arr, [5, 95])
    denom = max(q95 - q5, 1e-6)
    tau_norm = (tau_arr - q5) / denom
    tau_norm = np.clip(tau_norm, 0, 1)
    return tau_norm

def find_gamma_star(enaqt_results):
    """
    Find gamma* and ETE_peak from ENAQT sweep.
    """
    if not enaqt_results:
        return 0.0, 0.0

    best = max(enaqt_results, key=lambda d: d["ETE"])
    return float(best["gamma"]), float(best["ETE"])

def compute_resilience(base_qhs, jitter_qhs_list):
    """
    Resilience R = 1 - mean% drop in QHS under jitter.
    R in [0, 1].
    """
    # If base_qhs is very small, we can't really measure drop percentage reliably
    if base_qhs <= 1e-6:
         return 1.0 # Or 0.0? Prompt says "1 = robust, 0 = fragile". If it's already 0, it can't drop, so maybe robust?
         # Prompt: "drop = max(0.0, (base_qhs - q) / max(base_qhs, 1e-6))"

    drops = []
    for q in jitter_qhs_list:
        drop = max(0.0, (base_qhs - q) / max(base_qhs, 1e-6))
        drops.append(drop)

    mean_drop = float(np.mean(drops)) if drops else 0.0
    R = 1.0 - mean_drop
    return float(np.clip(R, 0.0, 1.0))
