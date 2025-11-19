# qemd/fusion.py
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import minmax_scale

# Heuristic weights for static fusion
W1_ETE = 1.0
W2_TAU_C = 1.0
W3_GAMMA_STAR = -1.0  # higher gamma* is bad (usually) - wait, prompt says "gamma* shifts right" for disease?
# Prompt: "median(gamma*)_tumor > median(gamma*)_normal" -> So higher gamma* is disease?
# Wait, "Rotenone/antimycin -> ETE ↓, τ_c_norm ↓, γ* shifts right."
# If Rotenone is bad, then "shifts right" (higher gamma*) is bad.
# So W3 should be negative.
W4_RESILIENCE = 0.5
BIAS = 0.0

def fit_qhs_model(features, labels):
    """
    Train a logistic regression model for QHS.
    features: N x 4 (ETE, tau_c_norm, gamma_star_norm, Resilience)
    labels: 0/1 (healthy/disease) - Wait, usually 1 is "good" for Health Score?
    If QHS is "Quantum Health Score", then 1 should be healthy.
    If labels are 0=healthy, 1=disease, then we want P(class=0).
    Or we flip labels: 1=healthy, 0=disease.
    Let's assume labels: 1=Healthy, 0=Disease.
    """
    clf = LogisticRegression(penalty='l2', C=1.0)
    clf.fit(features, labels)
    return clf

def compute_qhs(clf, features):
    """
    Predict QHS using trained model.
    Returns probabilities of class 1 (Healthy).
    """
    return clf.predict_proba(features)[:, 1]

def fuse_qhs_static(ete, tau_norm, gamma_norm, R,
             w1=W1_ETE, w2=W2_TAU_C, w3=W3_GAMMA_STAR, w4=W4_RESILIENCE, b=BIAS):
    """
    Static formula for QHS (no training).
    QHS = sigmoid(w1*ETE + w2*tau + w3*gamma + w4*R + b)
    """
    z = w1*ete + w2*tau_norm + w3*gamma_norm + w4*R + b
    qhs = 1.0 / (1.0 + np.exp(-z))
    return float(qhs)

def normalize_metrics(cohort_metrics):
    """
    Min-max normalize tau_c and gamma* across cohort.
    ETE_peak and resilience already constrained to [0,1] (mostly).
    """
    if not cohort_metrics:
        return []

    tau_c_values = np.array([m['tau_c'] for m in cohort_metrics], dtype=float)
    gamma_star_values = np.array([m['gamma_star'] for m in cohort_metrics], dtype=float)

    # Safe min-max
    def _safe_minmax(v):
        if v.size == 0: return v
        if np.allclose(v, v[0]): return np.zeros_like(v)
        return minmax_scale(v, feature_range=(0, 1))

    tau_c_norm = _safe_minmax(tau_c_values)
    gamma_star_norm = _safe_minmax(gamma_star_values)

    normalized = []
    for i, m in enumerate(cohort_metrics):
        normalized.append({
            "sample_id": m["sample_id"],
            "ETE_peak": float(np.clip(m["ETE_peak"], 0.0, 1.0)),
            "tau_c_norm": float(np.clip(tau_c_norm[i], 0.0, 1.0)),
            "gamma_star_norm": float(np.clip(gamma_star_norm[i], 0.0, 1.0)),
            "resilience": float(np.clip(m["resilience"], 0.0, 1.0)),
        })

    return normalized
