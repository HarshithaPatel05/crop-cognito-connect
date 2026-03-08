import React, { createContext, useContext, useState } from "react";

export type BookingStatus =
  | "pending"
  | "counter-sent"
  | "accepted"
  | "rejected"
  | "farmer-accepted"
  | "farmer-rejected";

export interface TransportBooking {
  id: string;
  // Farmer-submitted fields
  farmerName: string;
  farmerPhone: string;
  product: string;
  weightKg: number;
  pickupLocation: string;
  dropLocation: string;
  date: string;       // ISO date string
  time: string;       // e.g. "06:00"
  offeredPrice: number;
  notes: string;
  // Transport owner response
  status: BookingStatus;
  counterPrice?: number;
  counterNote?: string;
  // Timestamps
  createdAt: string;
}

interface TransportBookingContextValue {
  bookings: TransportBooking[];
  addBooking: (b: Omit<TransportBooking, "id" | "status" | "createdAt">) => void;
  sendCounter: (id: string, counterPrice: number, counterNote: string) => void;
  acceptBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  farmerAccept: (id: string) => void;
  farmerReject: (id: string) => void;
}

const TransportBookingContext = createContext<TransportBookingContextValue | null>(null);

// Seed data so transport owner sees something out of the box
const SEED: TransportBooking[] = [
  {
    id: "BK-4821",
    farmerName: "Ramesh Kumar",
    farmerPhone: "98765 43210",
    product: "Tomato",
    weightKg: 3500,
    pickupLocation: "Warangal",
    dropLocation: "Hyderabad",
    date: "2024-10-15",
    time: "06:00",
    offeredPrice: 2800,
    notes: "Urgent – festival stock",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "BK-4822",
    farmerName: "Sunita Devi",
    farmerPhone: "91234 56789",
    product: "Onion",
    weightKg: 2000,
    pickupLocation: "Karimnagar",
    dropLocation: "Hyderabad",
    date: "2024-10-18",
    time: "08:00",
    offeredPrice: 1900,
    notes: "",
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

export function TransportBookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<TransportBooking[]>(SEED);

  const addBooking = (b: Omit<TransportBooking, "id" | "status" | "createdAt">) => {
    const newBooking: TransportBooking = {
      ...b,
      id: `BK-${Date.now().toString().slice(-4)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const sendCounter = (id: string, counterPrice: number, counterNote: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "counter-sent", counterPrice, counterNote } : b
      )
    );
  };

  const acceptBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "accepted" } : b))
    );
  };

  const rejectBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "rejected" } : b))
    );
  };

  const farmerAccept = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "farmer-accepted" } : b))
    );
  };

  const farmerReject = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "farmer-rejected" } : b))
    );
  };

  return (
    <TransportBookingContext.Provider
      value={{ bookings, addBooking, sendCounter, acceptBooking, rejectBooking, farmerAccept, farmerReject }}
    >
      {children}
    </TransportBookingContext.Provider>
  );
}

export function useTransportBooking() {
  const ctx = useContext(TransportBookingContext);
  if (!ctx) throw new Error("useTransportBooking must be used within TransportBookingProvider");
  return ctx;
}
