import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRating, RatingPending } from "@/context/RatingContext";
import { useToast } from "@/hooks/use-toast";

const TRANSPORT_TAGS = ["On Time", "Good Handling", "Friendly Driver", "Clean Vehicle", "Communicated Well", "Professional", "Budget Friendly", "Reliable"];
const STORAGE_TAGS = ["Temperature Maintained", "Clean Facility", "Helpful Staff", "Easy Process", "Cold Chain", "Safe & Secure", "Good Communication"];

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

interface RatingPromptDialogProps {
  pending: RatingPending;
  onClose: () => void;
}

export function RatingPromptDialog({ pending, onClose }: RatingPromptDialogProps) {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { submitReview, removePending } = useRating();
  const { toast } = useToast();

  const tagPool = pending.targetType === "transport" ? TRANSPORT_TAGS : STORAGE_TAGS;
  const displayStars = hovered || stars;

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSkip = () => { removePending(pending.bookingId); onClose(); };

  const handleSubmit = () => {
    if (stars === 0) {
      toast({ variant: "destructive", title: "Please select a star rating" });
      return;
    }
    submitReview({
      targetId: pending.targetId,
      targetType: pending.targetType,
      targetName: pending.targetName,
      bookingId: pending.bookingId,
      farmerName: pending.farmerName,
      stars,
      comment: comment.trim(),
      tags: selectedTags,
    });
    toast({ title: "⭐ Review submitted! Thank you for your feedback." });
    onClose();
  };

  const icon = pending.targetType === "transport" ? "🚚" : "🏪";

  return (
    <Dialog open onOpenChange={(o) => !o && handleSkip()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>{icon}</span> Rate your {pending.targetType === "transport" ? "trip" : "storage"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Booking #{pending.bookingId} · <strong>{pending.targetName}</strong> · {pending.product}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Star selector */}
          <div className="flex flex-col items-center gap-1 py-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setStars(s)}
                  className={`text-4xl transition-all hover:scale-110 ${
                    s <= displayStars ? "text-accent drop-shadow-sm" : "text-muted-foreground/30"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-sm font-medium text-primary h-5">
              {displayStars > 0 ? STAR_LABELS[displayStars] : "Tap to rate"}
            </span>
          </div>

          {/* Quick tags */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium">What went well? (optional)</p>
            <div className="flex flex-wrap gap-1.5">
              {tagPool.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Add a comment (optional)</p>
            <Textarea
              placeholder={`Share your experience with ${pending.targetName}…`}
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 300))}
              className="text-sm min-h-[70px] resize-none"
            />
            <p className="text-[10px] text-muted-foreground text-right mt-1">{comment.length}/300</p>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-row">
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Skip
          </Button>
          <Button size="sm" onClick={handleSubmit} className="flex-1 bg-primary">
            ⭐ Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
