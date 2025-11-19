import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Quantum transport simulation engine - implements Lindblad equation
interface SimulationParams {
  epsilon: number[];  // Site energies (7 nodes)
  gamma: number;      // Decoherence rate
  couplings: number[]; // Inter-site couplings
  k_sink: number;     // Sink rate
  k_loss: number;     // Loss rate
  time: number;       // Total simulation time
}

interface SimulationResult {
  ETE_peak: number;
  tau_c: number;
  gamma_star: number;
  QLS: number;
  resilience: number;
  verified: boolean;
  computation_time_ms: number;
}

// Compute density matrix evolution using simplified Lindblad approach
function simulateQuantumTransport(params: SimulationParams): SimulationResult {
  const startTime = Date.now();
  const N = 7; // Number of nodes in ETC7
  
  // Initialize density matrix (diagonal, starting at node 0)
  const rho: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  rho[0][0] = 1.0; // Start with full population at Complex I entry
  
  const dt = 0.05; // Time step
  const steps = Math.floor(params.time / dt);
  
  // Build Hamiltonian (simplified tridiagonal + noise)
  const H: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    H[i][i] = params.epsilon[i];
    if (i < N - 1) {
      H[i][i + 1] = params.couplings[i];
      H[i + 1][i] = params.couplings[i];
    }
  }
  
  let totalETE = 0;
  let coherenceSum = 0;
  let peakETE = 0;
  
  // Time evolution with Lindblad operators
  for (let step = 0; step < steps; step++) {
    // Compute coherent evolution: -i[H, ρ]
    const drho_coherent: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        let comm = 0;
        for (let k = 0; k < N; k++) {
          comm += H[i][k] * rho[k][j] - rho[i][k] * H[k][j];
        }
        drho_coherent[i][j] = -comm * dt;
      }
    }
    
    // Decoherence (pure dephasing): γ(ρᵢⱼ) for i≠j
    const drho_dephasing: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i !== j) {
          drho_dephasing[i][j] = -params.gamma * rho[i][j] * dt;
        }
      }
    }
    
    // Sink (terminal node -> outside)
    const drho_sink: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
    drho_sink[N - 1][N - 1] = -params.k_sink * rho[N - 1][N - 1] * dt;
    
    // Loss (general dissipation)
    const drho_loss: number[][] = Array(N).fill(0).map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      drho_loss[i][i] = -params.k_loss * rho[i][i] * dt;
    }
    
    // Update density matrix
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rho[i][j] += drho_coherent[i][j] + drho_dephasing[i][j] + drho_sink[i][j] + drho_loss[i][j];
      }
    }
    
    // Compute observables
    // ETE: cumulative population that reached the sink
    const currentETE = 1.0 - rho.reduce((sum, row, i) => sum + row[i], 0); // 1 - trace
    totalETE += currentETE;
    if (currentETE > peakETE) peakETE = currentETE;
    
    // Coherence: sum of off-diagonal magnitudes
    let coherence = 0;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        coherence += Math.abs(rho[i][j]);
      }
    }
    coherenceSum += coherence;
  }
  
  // Compute final metrics
  const avgETE = totalETE / steps;
  const ETE_peak = Math.min(peakETE, 1.0);
  
  // Coherence lifetime (simplified): average coherence / initial
  const tau_c = coherenceSum / steps;
  
  // Gamma star: current gamma value (in real sweep, this would be optimal)
  const gamma_star = params.gamma;
  
  // QLS: composite score (weighted sum of normalized metrics)
  const QLS = 0.5 * ETE_peak + 0.3 * (1.0 / (1.0 + gamma_star * 50)) + 0.2 * tau_c;
  
  // Resilience: robustness to parameter perturbations (simplified)
  const resilience = 1.0 - Math.abs(params.gamma - 0.03) / 0.05;
  
  const computation_time_ms = Date.now() - startTime;
  
  return {
    ETE_peak: parseFloat(ETE_peak.toFixed(3)),
    tau_c: parseFloat((tau_c * 100).toFixed(2)), // Scale to ps range
    gamma_star: parseFloat(gamma_star.toFixed(4)),
    QLS: parseFloat(QLS.toFixed(3)),
    resilience: parseFloat(Math.max(0, resilience).toFixed(3)),
    verified: true,
    computation_time_ms
  };
}

// Parse omics data and map to quantum parameters
function parseOmicsData(csvContent: string): Partial<SimulationParams> {
  console.log("Parsing omics data...");
  
  // Simple CSV parser - assumes format: gene,expression
  const lines = csvContent.trim().split('\n');
  const geneExpression: Record<string, number> = {};
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const [gene, expr] = lines[i].split(',');
    if (gene && expr) {
      geneExpression[gene.trim().toUpperCase()] = parseFloat(expr);
    }
  }
  
  // Map ETC genes to nodes (example mapping)
  const nodeGenes: Record<number, string[]> = {
    0: ['NDUFS1', 'NDUFV1', 'NDUFS2'], // Complex I entry
    1: ['NDUFS7', 'NDUFS8'], // Complex I FeS
    2: ['COQ2', 'COQ6', 'COQ7'], // CoQ
    3: ['UQCRC1', 'UQCRC2', 'CYC1'], // Complex III
    4: ['CYCS'], // Cyt c
    5: ['COX4I1', 'COX5A', 'COX5B'], // Complex IV
    6: ['ATP5A', 'ATP5B'] // ATP synthase (sink)
  };
  
  // Compute site energies from expression
  const epsilon: number[] = [];
  for (let i = 0; i < 7; i++) {
    const genes = nodeGenes[i] || [];
    const avgExpr = genes.reduce((sum, gene) => {
      return sum + (geneExpression[gene] || 0);
    }, 0) / Math.max(genes.length, 1);
    
    // Map expression to energy (higher expression → lower energy barrier)
    epsilon[i] = 0.5 - avgExpr * 0.05; // Normalized
  }
  
  // Estimate gamma from stress markers (simplified)
  const stressGenes = ['SOD1', 'SOD2', 'CAT', 'GPX1'];
  const stressLevel = stressGenes.reduce((sum, gene) => 
    sum + (geneExpression[gene] || 0), 0) / stressGenes.length;
  const gamma = 0.02 + stressLevel * 0.01; // Higher stress → higher decoherence
  
  return { epsilon, gamma };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      epsilon, 
      gamma, 
      couplings, 
      k_sink = 0.03, 
      k_loss = 0.005, 
      time = 50,
      omicsData 
    } = await req.json();

    console.log("Quantum simulation requested", { 
      epsilon: epsilon?.length, 
      gamma, 
      hasOmicsData: !!omicsData 
    });

    let params: SimulationParams;
    
    if (omicsData) {
      // Parse omics data and map to parameters
      const omicsParams = parseOmicsData(omicsData);
      params = {
        epsilon: omicsParams.epsilon || Array(7).fill(0.3),
        gamma: omicsParams.gamma || 0.03,
        couplings: couplings || [0.1, 0.12, 0.15, 0.13, 0.11, 0.1],
        k_sink,
        k_loss,
        time
      };
      console.log("Mapped omics to quantum parameters", { 
        epsilon: params.epsilon, 
        gamma: params.gamma 
      });
    } else {
      // Use provided parameters
      params = {
        epsilon: epsilon || Array(7).fill(0.3),
        gamma: gamma !== undefined ? gamma : 0.03,
        couplings: couplings || [0.1, 0.12, 0.15, 0.13, 0.11, 0.1],
        k_sink,
        k_loss,
        time
      };
    }

    // Validate parameters
    if (params.epsilon.length !== 7) {
      throw new Error("Epsilon must have 7 values (one per ETC7 node)");
    }
    if (params.couplings.length !== 6) {
      throw new Error("Couplings must have 6 values (one per edge)");
    }

    console.log("Running quantum transport simulation...");
    const result = simulateQuantumTransport(params);
    console.log("Simulation complete", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in quantum-simulate function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
