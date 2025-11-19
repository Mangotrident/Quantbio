import { ENAQTChart } from '@/components/ENAQTChart';
import { MetricsGrid } from '@/components/MetricsGrid';
import { PhaseProgress } from '@/components/PhaseProgress';
import { ValidationStatus } from '@/components/ValidationStatus';
import { DatasetOverview } from '@/components/DatasetOverview';
import { QuantumSimulator } from '@/components/QuantumSimulator';
import { Activity, Dna } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Dna className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">QEMD Platform</h1>
                <p className="text-sm text-muted-foreground">Quantum Energy Metabolism Disease Research</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
                <Activity className="h-4 w-4 text-success animate-pulse" />
                <span className="text-sm font-medium text-success">All Systems Validated</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4 py-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm font-medium text-primary">Scientific Validation Framework</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Quantum Bioenergetic Diagnostics
          </h2>
          <p className="text-xl font-semibold text-primary mt-4">
            The first physics based platform for early disease detection.
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mt-4">
            Patient omics are transformed into quantum level simulations of mitochondrial energy flow, revealing early breakdowns in coherence and transport efficiency physics based biomarkers that emerge long before genetic or clinical signals.
          </p>
        </section>

        {/* Key Metrics */}
        <section>
          <h3 className="text-2xl font-bold text-foreground mb-6">Key Physics Metrics</h3>
          <MetricsGrid />
        </section>

        {/* ENAQT Chart */}
        <section>
          <ENAQTChart />
        </section>

        {/* Interactive Quantum Simulator */}
        <section>
          <QuantumSimulator />
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Phase Progress */}
          <PhaseProgress />
          
          {/* Validation Status */}
          <ValidationStatus />
        </div>

        {/* Dataset Overview */}
        <section>
          <DatasetOverview />
        </section>

        {/* Scientific Framework */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-card border border-border">
            <h4 className="font-semibold text-lg text-foreground mb-2">Quantum Regime</h4>
            <p className="text-sm text-muted-foreground">
              Electron tunneling across Fe–S clusters in Complex I–III and CoQ cycle operates within 1–2 nm, fs–ps coherence windows.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h4 className="font-semibold text-lg text-foreground mb-2">Mechanistic Hypothesis</h4>
            <p className="text-sm text-muted-foreground">
              Disease perturbs quantum channels, flattening or shifting ENAQT (γ) peak → reduced ETE and τ₍c₎.
            </p>
          </div>
          <div className="p-6 rounded-lg bg-card border border-border">
            <h4 className="font-semibold text-lg text-foreground mb-2">Omics Mapping</h4>
            <p className="text-sm text-muted-foreground">
              Protein abundance → εᵢ (site energy) | Supercomplex connectivity → Jᵢⱼ (coupling) | Redox stress → γ (dephasing)
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            QEMD Platform — Precision Quantum Biomarker Discovery | Target: ROC ≥ 0.80, AUC gain &gt; 0.10
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
