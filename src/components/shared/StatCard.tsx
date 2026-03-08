import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
  highlight?: boolean;
}

export function StatCard({ title, value, subtext, icon, trend, trendValue, className = "", highlight = false }: StatCardProps) {
  return (
    <Card className={`${highlight ? "border-primary/40 bg-primary/5" : ""} ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
            {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
          </div>
          {icon && <span className="text-2xl">{icon}</span>}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === "up" ? "text-primary" : trend === "down" ? "text-destructive" : "text-muted-foreground"}`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
