import React, { createContext, useContext, useState } from "react";

export type ReviewTarget = "transport" | "storage";

export interface Review {
  id: string;
  targetId: string;           // vehicleId (V-001) or unitId (string)
  targetType: ReviewTarget;
  targetName: string;
  bookingId: string;
  farmerName: string;
  stars: number;              // 1-5
  comment: string;
  tags: string[];             // e.g. ["On Time", "Good Handling"]
  createdAt: string;
}

export interface RatingPending {
  bookingId: string;
  targetId: string;
  targetType: ReviewTarget;
  targetName: string;
  farmerName: string;
  product: string;
}

interface RatingContextValue {
  reviews: Review[];
  pending: RatingPending[];
  addPending: (p: RatingPending) => void;
  removePending: (bookingId: string) => void;
  submitReview: (r: Omit<Review, "id" | "createdAt">) => void;
  getAggregated: (targetId: string) => { avg: number; count: number; reviews: Review[] };
}

const RatingContext = createContext<RatingContextValue | null>(null);

// Seed some existing reviews so dashboards show live ratings immediately
const SEED_REVIEWS: Review[] = [
  {
    id: "RV-001", targetId: "V-001", targetType: "transport", targetName: "Vijay Logistics",
    bookingId: "BK-SEED1", farmerName: "Prakash Rao",
    stars: 5, comment: "Delivered on time, very careful with tomatoes. Highly recommend!",
    tags: ["On Time", "Good Handling", "Friendly Driver"], createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "RV-002", targetId: "V-001", targetType: "transport", targetName: "Vijay Logistics",
    bookingId: "BK-SEED2", farmerName: "Anand Reddy",
    stars: 4, comment: "Good service, slight delay but informed us beforehand.",
    tags: ["On Time", "Communicated Well"], createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "RV-003", targetId: "V-003", targetType: "transport", targetName: "ColdChain Agro Pvt Ltd",
    bookingId: "BK-SEED3", farmerName: "Laxmi Devi",
    stars: 5, comment: "Cold chain maintained perfectly. All chilli arrived fresh.",
    tags: ["Cold Chain", "On Time", "Professional"], createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "RV-004", targetId: "1", targetType: "storage", targetName: "AgroStore Warangal",
    bookingId: "SB-SEED1", farmerName: "Ramesh Kumar",
    stars: 5, comment: "Perfect cold storage. Tomatoes stayed fresh for 2 weeks!",
    tags: ["Temperature Maintained", "Clean Facility", "Helpful Staff"], createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "RV-005", targetId: "2", targetType: "storage", targetName: "FarmSafe Karimnagar",
    bookingId: "SB-SEED2", farmerName: "Sunita Devi",
    stars: 4, comment: "Good warehouse, easy check-in and check-out process.",
    tags: ["Easy Process", "Clean Facility"], createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "RV-006", targetId: "V-002", targetType: "transport", targetName: "Ravi Transport Co.",
    bookingId: "BK-SEED4", farmerName: "Meena Bai",
    stars: 4, comment: "Budget friendly and reliable. Will use again.",
    tags: ["Budget Friendly", "Reliable"], createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

export function RatingProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [pending, setPending] = useState<RatingPending[]>([]);

  const addPending = (p: RatingPending) => {
    setPending((prev) => {
      if (prev.some((x) => x.bookingId === p.bookingId)) return prev;
      return [...prev, p];
    });
  };

  const removePending = (bookingId: string) =>
    setPending((prev) => prev.filter((p) => p.bookingId !== bookingId));

  const submitReview = (r: Omit<Review, "id" | "createdAt">) => {
    const newReview: Review = {
      ...r,
      id: `RV-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    removePending(r.bookingId);
  };

  const getAggregated = (targetId: string) => {
    const filtered = reviews.filter((r) => r.targetId === targetId);
    const avg = filtered.length ? filtered.reduce((s, r) => s + r.stars, 0) / filtered.length : 0;
    return { avg, count: filtered.length, reviews: filtered };
  };

  return (
    <RatingContext.Provider value={{ reviews, pending, addPending, removePending, submitReview, getAggregated }}>
      {children}
    </RatingContext.Provider>
  );
}

export function useRating() {
  const ctx = useContext(RatingContext);
  if (!ctx) throw new Error("useRating must be used within RatingProvider");
  return ctx;
}
