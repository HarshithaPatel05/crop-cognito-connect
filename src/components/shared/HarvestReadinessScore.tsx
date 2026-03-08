import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface HarvestReadinessScoreProps {
  score: number;
  factors?: { label: string; value: number; color: string }[];
}

export function HarvestReadinessScore({ score, factors }: HarvestReadinessScoreProps) {
  const getColor = (s: number) => s >= 75 ? "hsl(var(--primary))" : s >= 45 ? "hsl(var(--accent))" : "hsl(var(--destructive))";
  const getLabel = (s: number) => s >= 75 ? "Ready to Harvest" : s >= 45 ? "Almost Ready" : "Not Ready";
  const getBadgeClass = (s: number) => s >= 75 ? "bg-agro-green-light text-primary border-primary/30" : s >= 45 ? "bg-accent/20 text-accent-foreground border-accent/30" : "bg-destructive/10 text-destructive border-destructive/30";

  const defaultFactors = [
    { label: "Crop Maturity", value: score - 5, color: "bg-primary" },
    { label: "Weather Score", value: 72, color: "bg-agro-sky" },
    { label: "Market Demand", value: 85, color: "bg-accent" },
    { label: "Price Signal", value: 78, color: "bg-secondary" },
  ];
  const displayFactors = factors || defaultFactors;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Harvest Readiness Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big score circle */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke={getColor(score)} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 201} 201`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-foreground">{score}</span>
            </div>
          </div>
          <div>
            <Badge variant="outline" className={`${getBadgeClass(score)} font-medium`}>{getLabel(score)}</Badge>
            <p className="text-xs text-muted-foreground mt-1">Based on 5 AI factors</p>
          </div>
        </div>
        {/* Factor bars */}
        <div className="space-y-2">
          {displayFactors.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">{f.label}</span>
                <span className="font-medium">{f.value}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full">
                <div className={`h-1.5 ${f.color} rounded-full transition-all duration-700`} style={{ width: `${f.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
