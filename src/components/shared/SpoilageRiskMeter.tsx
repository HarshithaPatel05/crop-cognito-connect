import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpoilageRiskMeterProps {
  level: "LOW" | "MEDIUM" | "HIGH";
  factors?: { temp?: number; humidity?: number; storageTime?: number };
  compact?: boolean;
}

export function SpoilageRiskMeter({ level, factors, compact = false }: SpoilageRiskMeterProps) {
  const config = {
    LOW: { color: "text-primary", bg: "bg-agro-green-light", border: "border-primary/30", barWidth: "33%", barColor: "bg-primary", emoji: "✅", desc: "Safe conditions. No immediate action needed." },
    MEDIUM: { color: "text-accent-foreground", bg: "bg-accent/20", border: "border-accent/30", barWidth: "66%", barColor: "bg-accent", emoji: "⚠️", desc: "Monitor closely. Plan harvest or move to cold storage within 3 days." },
    HIGH: { color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30", barWidth: "100%", barColor: "bg-destructive", emoji: "🚨", desc: "Immediate action required! Risk of significant spoilage." },
  };
  const c = config[level];

  if (compact) {
    return (
      <Badge variant="outline" className={`${c.bg} ${c.color} ${c.border} font-bold`}>
        {c.emoji} {level}
      </Badge>
    );
  }

  return (
    <Card className={`border ${c.border}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Spoilage Risk Meter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className={`${c.bg} rounded-lg p-3 flex items-center gap-3`}>
          <span className="text-2xl">{c.emoji}</span>
          <div>
            <div className={`text-lg font-bold ${c.color}`}>{level} RISK</div>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </div>
        </div>
        {/* Gauge bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>LOW</span><span>MEDIUM</span><span>HIGH</span></div>
          <div className="h-3 bg-gradient-to-r from-primary via-accent to-destructive rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-foreground rounded-full border-2 border-card shadow transition-all duration-700"
              style={{ left: `calc(${c.barWidth} - 8px)` }}
            />
          </div>
        </div>
        {factors && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {factors.temp && <div><div className="text-xs text-muted-foreground">Temperature</div><div className="text-sm font-medium">{factors.temp}°C</div></div>}
            {factors.humidity && <div><div className="text-xs text-muted-foreground">Humidity</div><div className="text-sm font-medium">{factors.humidity}%</div></div>}
            {factors.storageTime && <div><div className="text-xs text-muted-foreground">Storage Days</div><div className="text-sm font-medium">{factors.storageTime}d</div></div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
