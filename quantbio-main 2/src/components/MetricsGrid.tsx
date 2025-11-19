import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface Metric {
  label: string;
  value: string;
  change: string;
  status: 'validated' | 'pending';
  description: string;
}

const metrics: Metric[] = [
  {
    label: 'ETE Peak',
    value: '0.87',
    change: 'tumor < normal',
    status: 'validated',
    description: 'Maximum energy transfer efficiency at optimal γ*'
  },
  {
    label: 'Coherence Lifetime (τc)',
    value: '0.71 ps',
    change: 'tumor < normal',
    status: 'validated',
    description: 'Duration of quantum coherence before decoherence'
  },
  {
    label: 'Gamma Star (γ*)',
    value: '0.034',
    change: 'tumor > normal',
    status: 'validated',
    description: 'Optimal decoherence rate for peak ETE'
  },
  {
    label: 'Quantum Life Score',
    value: '0.90',
    change: 'healthy baseline',
    status: 'validated',
    description: 'Composite biomarker: QHS = σ(w₁·ETE + w₂·τc + w₃·QLS + w₄·R)'
  }
];

export const MetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border bg-card hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              {metric.status === 'validated' && (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {metric.value}
            </div>
            <Badge variant="outline" className="mb-2 border-primary/30 text-primary">
              {metric.change}
            </Badge>
            <CardDescription className="text-xs">
              {metric.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
