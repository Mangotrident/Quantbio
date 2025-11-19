# qemd/mapping.py
import numpy as np
from .config import (
    GAMMA_MIN, GAMMA_MAX, GAMMA_MID,
    EPS_ALPHA, J_BASE, J_BETA, GAMMA_LAM,
    J_MIN_CLIP, J_MAX_CLIP,
    K_SINK, K_LOSS
)

def map_expression_to_epsilon(expr_vec_z, eps0=0.0):
    """
    Maps mean z-scored gene expression to site energy (epsilon).
    epsilon = eps0 + EPS_ALPHA * z_mean
    """
    z = float(np.mean(expr_vec_z))
    epsilon = eps0 + EPS_ALPHA * z
    return float(epsilon)

def map_supercomplex_to_J(edge_expr_z):
    """
    Maps mean z-score of an edge's subunits to coupling J.
    J = J_BASE * (1 + J_BETA * z)
    """
    z = float(edge_expr_z)
    J = J_BASE * (1.0 + J_BETA * z)
    return float(np.clip(J, J_MIN_CLIP, J_MAX_CLIP))

def map_redox_to_gamma(redox_z):
    """
    Maps redox/hypoxia/ROS z-score to decoherence rate gamma.
    """
    z = float(redox_z)
    gamma = GAMMA_MID * (1.0 + GAMMA_LAM * z)
    return float(np.clip(gamma, GAMMA_MIN, GAMMA_MAX))

def get_sink_loss_params():
    """
    Returns sink and loss rates.
    Currently constant, but can be made omics-dependent later.
    """
    return K_SINK, K_LOSS

def get_params_for_sample(omics_data):
    """
    Build ε, J, γ, k_sink, k_loss from an omics sample.

    Expected keys in omics_data (z-scores or arrays of z-scores):
      - 'ci_z', 'ciii_z', 'civ_z'
      - 'ci_ciii_z', 'ciii_civ_z'
      - 'redox_z'
    """

    epsilon = [
        map_expression_to_epsilon(omics_data['ci_z']),
        map_expression_to_epsilon(omics_data['ci_z']),
        map_expression_to_epsilon(omics_data['ci_z']),
        map_expression_to_epsilon(omics_data['ciii_z']),
        map_expression_to_epsilon(omics_data['ciii_z']),
        map_expression_to_epsilon(omics_data['ciii_z']),
        map_expression_to_epsilon(omics_data['civ_z']),
    ]

    J = [
        map_supercomplex_to_J(omics_data['ci_ciii_z']),   # J_01
        map_supercomplex_to_J(omics_data['ci_ciii_z']),   # J_12
        map_supercomplex_to_J(omics_data['ci_ciii_z']),   # J_23
        map_supercomplex_to_J(omics_data['ciii_civ_z']),  # J_34
        map_supercomplex_to_J(omics_data['ciii_civ_z']),  # J_45
        map_supercomplex_to_J(omics_data['ciii_civ_z']),  # J_56
    ]

    gamma = map_redox_to_gamma(omics_data['redox_z'])
    k_sink, k_loss = get_sink_loss_params()

    return {
        "epsilon": epsilon,
        "J": J,
        "gamma": gamma,
        "k_sink": k_sink,
        "k_loss": k_loss
    }
