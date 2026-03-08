import React, { createContext, useContext, useState } from "react";

export type StorageBookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "completed"
  | "cancelled";

export type StorageType = "Cold Storage" | "Warehouse" | "Silo";

export interface StorageBooking {
  id: string;
  // Unit details
  unitId: number;
  unitName: string;
  unitLocation: string;
  storageType: StorageType;
  unitTemp: string;
  pricePerKgPerMonth: number;
  // Farmer-submitted fields
  farmerName: string;
  farmerPhone: string;
  crop: string;
  weightKg: number;
  checkInDate: string;   // ISO date
  checkOutDate: string;  // ISO date
  durationDays: number;
  notes: string;
  // Manager response
  status: StorageBookingStatus;
  managerNote?: string;
  // Computed
  estimatedCost: number;
  createdAt: string;
}

interface StorageBookingContextValue {
  bookings: StorageBooking[];
  addBooking: (b: Omit<StorageBooking, "id" | "status" | "createdAt">) => void;
  approveBooking: (id: string, note?: string) => void;
  rejectBooking: (id: string, note?: string) => void;
  completeBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
}

const StorageBookingContext = createContext<StorageBookingContextValue | null>(null);

// Seed data for manager to see immediately
const SEED: StorageBooking[] = [
  {
    id: "SB-0101",
    unitId: 1,
    unitName: "AgroStore Warangal",
    unitLocation: "Warangal",
    storageType: "Cold Storage",
    unitTemp: "2-8°C",
    pricePerKgPerMonth: 8,
    farmerName: "Sunita Devi",
    farmerPhone: "91234 56789",
    crop: "Tomato",
    weightKg: 1200,
    checkInDate: "2024-10-16",
    checkOutDate: "2024-10-30",
    durationDays: 14,
    notes: "Handle with care – organic certified batch",
    status: "pending",
    estimatedCost: 3360,
    createdAt: new Date().toISOString(),
  },
  {
    id: "SB-0102",
    unitId: 2,
    unitName: "FarmSafe Karimnagar",
    unitLocation: "Karimnagar",
    storageType: "Warehouse",
    unitTemp: "Ambient",
    pricePerKgPerMonth: 3,
    farmerName: "Prakash Rao",
    farmerPhone: "98765 11111",
    crop: "Chilli (Dry)",
    weightKg: 800,
    checkInDate: "2024-10-18",
    checkOutDate: "2024-11-18",
    durationDays: 31,
    notes: "",
    status: "pending",
    estimatedCost: 2480,
    createdAt: new Date().toISOString(),
  },
  {
    id: "SB-0100",
    unitId: 4,
    unitName: "GrainStore Nizamabad",
    unitLocation: "Nizamabad",
    storageType: "Silo",
    unitTemp: "Controlled",
    pricePerKgPerMonth: 2,
    farmerName: "Ramesh Kumar",
    farmerPhone: "99887 43210",
    crop: "Millet",
    weightKg: 1200,
    checkInDate: "2024-09-15",
    checkOutDate: "2024-12-15",
    durationDays: 91,
    notes: "",
    status: "active",
    estimatedCost: 7280,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

export function StorageBookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<StorageBooking[]>(SEED);

  const addBooking = (b: Omit<StorageBooking, "id" | "status" | "createdAt">) => {
    const newBooking: StorageBooking = {
      ...b,
      id: `SB-${Date.now().toString().slice(-4)}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const approveBooking = (id: string, note?: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "approved", managerNote: note } : b))
    );
  };

  const rejectBooking = (id: string, note?: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "rejected", managerNote: note } : b))
    );
  };

  const completeBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "completed" } : b))
    );
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
    );
  };

  return (
    <StorageBookingContext.Provider
      value={{ bookings, addBooking, approveBooking, rejectBooking, completeBooking, cancelBooking }}
    >
      {children}
    </StorageBookingContext.Provider>
  );
}

export function useStorageBooking() {
  const ctx = useContext(StorageBookingContext);
  if (!ctx) throw new Error("useStorageBooking must be used within StorageBookingProvider");
  return ctx;
}
