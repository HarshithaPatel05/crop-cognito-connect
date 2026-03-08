interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md";
  showValue?: boolean;
}

export function StarRating({ rating, max = 5, size = "sm", showValue = true }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const starSize = size === "sm" ? "text-sm" : "text-lg";

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((star) => (
          <span key={star} className={`${starSize} ${star <= Math.floor(rating) ? "text-accent" : star - 0.5 <= rating ? "text-accent/60" : "text-muted"}`}>
            ★
          </span>
        ))}
      </div>
      {showValue && <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}
