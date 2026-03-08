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
  // Which vehicle this booking is targeted to (null = broadcast to all)
  targetVehicleId?: string | null;
  // Timestamps
  createdAt: string;
}

// ── Available transport vehicles registry ─────────────────────────────────────
export interface AvailableVehicle {
  id: string;
  ownerName: string;
  vehicleType: string;
  vehicleNo: string;
  capacityTon: number;
  currentLoadTon: number; // already booked load
  isRefrigerated: boolean;
  routes: string[];       // operating routes
  pricePerKm: number;     // ₹/km
  pricePerTon: number;    // ₹/ton
  minLoadKg: number;
  rating: number;         // out of 5
  totalTrips: number;
  location: string;
  availableFrom: string;  // "05:00"
  availableTo: string;
  phone: string;
  fuelType: string;
  features: string[];     // ["GPS Tracked", "Insured", "24/7 Available"]
  onTimeRate: number;     // percent
}

export const AVAILABLE_VEHICLES: AvailableVehicle[] = [
  {
    id: "V-001",
    ownerName: "Vijay Logistics",
    vehicleType: "Large Truck (10T)",
    vehicleNo: "TS 09 EA 4512",
    capacityTon: 10,
    currentLoadTon: 2.5,
    isRefrigerated: false,
    routes: ["Warangal", "Hyderabad", "Karimnagar", "Pune"],
    pricePerKm: 45,
    pricePerTon: 320,
    minLoadKg: 500,
    rating: 4.8,
    totalTrips: 312,
    location: "Warangal",
    availableFrom: "05:00",
    availableTo: "22:00",
    phone: "99887 11223",
    fuelType: "Diesel",
    features: ["GPS Tracked", "Insured", "Experienced Driver"],
    onTimeRate: 94,
  },
  {
    id: "V-002",
    ownerName: "Ravi Transport Co.",
    vehicleType: "Mini Truck (3T)",
    vehicleNo: "TS 11 BF 7201",
    capacityTon: 3,
    currentLoadTon: 0.5,
    isRefrigerated: false,
    routes: ["Karimnagar", "Hyderabad", "Nizamabad"],
    pricePerKm: 28,
    pricePerTon: 260,
    minLoadKg: 200,
    rating: 4.5,
    totalTrips: 178,
    location: "Karimnagar",
    availableFrom: "06:00",
    availableTo: "20:00",
    phone: "98877 22334",
    fuelType: "Diesel",
    features: ["GPS Tracked", "24/7 Support"],
    onTimeRate: 91,
  },
  {
    id: "V-003",
    ownerName: "ColdChain Agro Pvt Ltd",
    vehicleType: "Refrigerated Truck (8T)",
    vehicleNo: "TS 04 CK 9931",
    capacityTon: 8,
    currentLoadTon: 1.0,
    isRefrigerated: true,
    routes: ["Warangal", "Hyderabad", "Chennai", "Bangalore"],
    pricePerKm: 62,
    pricePerTon: 480,
    minLoadKg: 800,
    rating: 4.9,
    totalTrips: 221,
    location: "Warangal",
    availableFrom: "04:00",
    availableTo: "23:00",
    phone: "97766 44555",
    fuelType: "Diesel",
    features: ["❄️ Refrigerated -2°C", "GPS Tracked", "Insured", "Certified"],
    onTimeRate: 97,
  },
  {
    id: "V-004",
    ownerName: "Suresh Carriers",
    vehicleType: "Medium Truck (5T)",
    vehicleNo: "TS 07 DM 3344",
    capacityTon: 5,
    currentLoadTon: 3.8,
    isRefrigerated: false,
    routes: ["Nizamabad", "Adilabad", "Nagpur", "Hyderabad"],
    pricePerKm: 38,
    pricePerTon: 290,
    minLoadKg: 400,
    rating: 4.2,
    totalTrips: 95,
    location: "Nizamabad",
    availableFrom: "07:00",
    availableTo: "21:00",
    phone: "96655 88712",
    fuelType: "CNG",
    features: ["GPS Tracked", "Budget Friendly"],
    onTimeRate: 88,
  },
  {
    id: "V-005",
    ownerName: "Lakshmi Roadways",
    vehicleType: "Large Truck (12T)",
    vehicleNo: "TS 02 EK 5500",
    capacityTon: 12,
    currentLoadTon: 0,
    isRefrigerated: false,
    routes: ["Warangal", "Karimnagar", "Hyderabad", "Pune", "Mumbai"],
    pricePerKm: 55,
    pricePerTon: 350,
    minLoadKg: 1000,
    rating: 4.6,
    totalTrips: 407,
    location: "Warangal",
    availableFrom: "05:00",
    availableTo: "22:00",
    phone: "99001 77834",
    fuelType: "Diesel",
    features: ["GPS Tracked", "Insured", "Long Haul Specialist", "24/7 Available"],
    onTimeRate: 93,
  },
  {
    id: "V-006",
    ownerName: "Green Agri Movers",
    vehicleType: "Refrigerated Van (2T)",
    vehicleNo: "TS 13 GF 1122",
    capacityTon: 2,
    currentLoadTon: 0.2,
    isRefrigerated: true,
    routes: ["Khammam", "Hyderabad", "Warangal"],
    pricePerKm: 22,
    pricePerTon: 420,
    minLoadKg: 100,
    rating: 4.3,
    totalTrips: 64,
    location: "Khammam",
    availableFrom: "06:00",
    availableTo: "20:00",
    phone: "98123 56789",
    fuelType: "Electric",
    features: ["❄️ Refrigerated", "Electric Vehicle", "Eco-Friendly"],
    onTimeRate: 90,
  },
];

interface TransportBookingContextValue {
  bookings: TransportBooking[];
  addBooking: (b: Omit<TransportBooking, "id" | "status" | "createdAt">) => void;
  addBroadcastBookings: (
    base: Omit<TransportBooking, "id" | "status" | "createdAt" | "targetVehicleId">,
    vehicleIds: string[]
  ) => void;
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
    targetVehicleId: null,
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
    targetVehicleId: null,
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

  // Broadcast to all selected vehicles (creates one booking per vehicle)
  const addBroadcastBookings = (
    base: Omit<TransportBooking, "id" | "status" | "createdAt" | "targetVehicleId">,
    vehicleIds: string[]
  ) => {
    const newBookings: TransportBooking[] = vehicleIds.map((vid) => ({
      ...base,
      targetVehicleId: vid,
      id: `BK-${Date.now().toString().slice(-4)}-${vid}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }));
    setBookings((prev) => [...newBookings, ...prev]);
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
      value={{ bookings, addBooking, addBroadcastBookings, sendCounter, acceptBooking, rejectBooking, farmerAccept, farmerReject }}
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
