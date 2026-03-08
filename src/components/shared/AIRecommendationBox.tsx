import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AIRecommendationBoxProps {
  recommendations: { id: number; type: string; text: string; confidence: number; icon: string }[];
  title?: string;
}

export function AIRecommendationBox({ recommendations, title = "AI Insights" }: AIRecommendationBoxProps) {
  return (
    <Card className="border-primary/30 ai-glow bg-agro-green-light/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🤖</span>
          <span className="font-semibold text-sm text-primary">{title}</span>
          <Badge className="ml-auto text-xs bg-primary text-primary-foreground">AI Powered</Badge>
        </div>
        <div className="space-y-2">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start gap-2 bg-card rounded-lg p-3 border border-primary/10">
              <span className="text-base flex-shrink-0">{rec.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{rec.text}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 h-1 bg-muted rounded-full">
                    <div
                      className="h-1 bg-primary rounded-full transition-all"
                      style={{ width: `${rec.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{rec.confidence}% confidence</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
