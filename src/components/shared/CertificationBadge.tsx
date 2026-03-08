import { Badge } from "@/components/ui/badge";

type CertType = "organic" | "gradeA" | "govt" | null;

interface CertificationBadgeProps {
  type: CertType;
}

export function CertificationBadge({ type }: CertificationBadgeProps) {
  if (!type) return null;
  const config = {
    organic: { label: "🌿 Organic", className: "bg-agro-green-light text-primary border-primary/30" },
    gradeA: { label: "⭐ Grade A", className: "bg-accent/20 text-accent-foreground border-accent/30" },
    govt: { label: "🏛️ Govt Verified", className: "bg-agro-sky/10 text-agro-sky border-agro-sky/30" },
  };
  const c = config[type];
  return <Badge variant="outline" className={`text-xs ${c.className}`}>{c.label}</Badge>;
}
