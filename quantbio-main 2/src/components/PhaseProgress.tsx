import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface Phase {
  id: number;
  title: string;
  weeks: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  deliverables: string[];
}

const phases: Phase[] = [
  {
    id: 1,
    title: 'Quantum Life Engine (QLE)',
    weeks: 'Weeks 2-3',
    status: 'completed',
    progress: 100,
    deliverables: ['ete_curve.png', 'unit tests', 'metrics.json']
  },
  {
    id: 2,
    title: 'Quantum-Metabolic Network (Q-MNet)',
    weeks: 'Weeks 4-6',
    status: 'completed',
    progress: 100,
    deliverables: ['cohort_metrics.parquet', 'params_used.yaml']
  },
  {
    id: 3,
    title: 'Cohort & Benchmark Analysis',
    weeks: 'Weeks 7-9',
    status: 'in-progress',
    progress: 75,
    deliverables: ['benchmark_comparison.pdf', 'resilience_plot.png']
  },
  {
    id: 4,
    title: 'Experimental Perturbation Validation',
    weeks: 'Weeks 10-11',
    status: 'pending',
    progress: 0,
    deliverables: ['validation_directionality.pdf']
  }
];

const getStatusIcon = (status: Phase['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-success" />;
    case 'in-progress':
      return <Clock className="h-5 w-5 text-warning" />;
    case 'pending':
      return <Circle className="h-5 w-5 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: Phase['status']) => {
  switch (status) {
    case 'completed':
      return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    case 'in-progress':
      return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
    case 'pending':
      return <Badge variant="outline">Pending</Badge>;
  }
};

export const PhaseProgress = () => {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Research Phase Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {phases.map((phase) => (
          <div key={phase.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(phase.status)}
                <div>
                  <h4 className="font-medium text-foreground">
                    Phase {phase.id}: {phase.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{phase.weeks}</p>
                </div>
              </div>
              {getStatusBadge(phase.status)}
            </div>
            <Progress value={phase.progress} className="h-2" />
            <div className="flex flex-wrap gap-1 mt-2">
              {phase.deliverables.map((deliverable, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {deliverable}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
