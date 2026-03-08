import { useRating } from "@/context/RatingContext";
import { StarRating } from "@/components/shared/StarRating";

interface RatingBadgeProps {
  targetId: string;
  showReviews?: boolean;
  size?: "sm" | "md";
}

export function RatingBadge({ targetId, showReviews = false, size = "sm" }: RatingBadgeProps) {
  const { getAggregated } = useRating();
  const { avg, count, reviews } = getAggregated(targetId);

  if (count === 0) return <span className="text-xs text-muted-foreground">No reviews yet</span>;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <StarRating rating={avg} size={size} showValue />
        <span className="text-[10px] text-muted-foreground">({count} review{count !== 1 ? "s" : ""})</span>
      </div>
      {showReviews && reviews.length > 0 && (
        <div className="space-y-2 mt-2">
          {reviews.slice(0, 3).map((r) => (
            <div key={r.id} className="bg-muted/50 rounded-lg px-3 py-2 border border-border/50">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[11px] font-medium">{r.farmerName}</span>
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-xs ${s <= r.stars ? "text-accent" : "text-muted-foreground/30"}`}>★</span>
                  ))}
                </div>
              </div>
              {r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {r.tags.map(t => (
                    <span key={t} className="text-[9px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5">{t}</span>
                  ))}
                </div>
              )}
              {r.comment && <p className="text-[10px] text-muted-foreground leading-snug">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
