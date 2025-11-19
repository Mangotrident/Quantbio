import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Dataset {
  domain: string;
  name: string;
  samples: number;
  use: string;
  status: 'integrated' | 'pending';
}

const datasets: Dataset[] = [
  { domain: 'Cancer', name: 'TCGA-BRCA (RNA-Seq)', samples: 80, use: 'Primary disease signal', status: 'integrated' },
  { domain: 'Neuro', name: 'AMP-AD (MSSM)', samples: 40, use: 'Secondary validation', status: 'integrated' },
  { domain: 'Proteomics', name: 'CPTAC-BRCA', samples: 20, use: 'ε calibration', status: 'integrated' },
  { domain: 'Perturbation', name: 'GSE138795/153947', samples: 30, use: 'Directionality validation', status: 'integrated' },
  { domain: 'Multi-omics', name: 'PRAD-TCGA + GTEx', samples: 60, use: 'Cross-tissue robustness', status: 'pending' },
  { domain: 'Structural', name: 'ComplexPortal + KEGG', samples: 0, use: 'Graph topology', status: 'integrated' }
];

export const DatasetOverview = () => {
  const totalSamples = datasets.reduce((sum, d) => sum + d.samples, 0);
  const integratedCount = datasets.filter(d => d.status === 'integrated').length;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center justify-between">
          <span>Dataset Overview</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              {totalSamples} samples
            </Badge>
            <Badge variant="outline" className="text-success border-success">
              {integratedCount}/{datasets.length} integrated
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Domain</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Dataset</th>
                <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Samples</th>
                <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Use</th>
                <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2">
                    <Badge variant="secondary" className="text-xs">{dataset.domain}</Badge>
                  </td>
                  <td className="py-3 px-2 font-medium text-foreground">{dataset.name}</td>
                  <td className="py-3 px-2 text-center text-foreground">{dataset.samples || '—'}</td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{dataset.use}</td>
                  <td className="py-3 px-2 text-center">
                    {dataset.status === 'integrated' ? (
                      <Badge className="bg-success/20 text-success border-success/30 text-xs">Integrated</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
