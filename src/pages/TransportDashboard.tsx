import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from "@/components/shared/StarRating";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { useToast } from "@/hooks/use-toast";
import { useTransportBooking } from "@/context/TransportBookingContext";
import { useRole, TransportProfile } from "@/context/RoleContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";

// ── Distance table (approximate km) ──────────────────────────────────────────
const DIST_KM: Record<string, number> = {
  "Warangal|Karimnagar": 100, "Karimnagar|Warangal": 100,
  "Warangal|Hyderabad": 145,  "Hyderabad|Warangal": 145,
  "Karimnagar|Hyderabad": 165,"Hyderabad|Karimnagar": 165,
  "Nizamabad|Hyderabad": 180, "Hyderabad|Nizamabad": 180,
  "Adilabad|Hyderabad": 240,  "Hyderabad|Adilabad": 240,
  "Khammam|Hyderabad": 195,   "Hyderabad|Khammam": 195,
  "Warangal|Chennai": 620,    "Chennai|Warangal": 620,
  "Karimnagar|Chennai": 720,  "Chennai|Karimnagar": 720,
  "Nizamabad|Chennai": 740,   "Chennai|Nizamabad": 740,
  "Warangal|Pune": 680,       "Pune|Warangal": 680,
  "Warangal|Nagpur": 330,     "Nagpur|Warangal": 330,
  "Adilabad|Nagpur": 290,     "Nagpur|Adilabad": 290,
  "Karimnagar|Nizamabad": 60, "Nizamabad|Karimnagar": 60,
};

const AVG_SPEED_KMH = 55;

function getDist(a: string, b: string) {
  const trimA = a.replace(/,.*/, "").trim();
  const trimB = b.replace(/,.*/, "").trim();
  if (trimA === trimB) return 0;
  return DIST_KM[`${trimA}|${trimB}`] || DIST_KM[`${trimB}|${trimA}`] || 130;
}

function minsToTime(totalMins: number): string {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}

function timeStrToMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addMins(time: string, mins: number): string {
  const base = timeStrToMins(time) + mins;
  const h = Math.floor(base / 60) % 24;
  const m = base % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function driveMins(dist: number) {
  return Math.round((dist / AVG_SPEED_KMH) * 60);
}

function fmtDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// ── Route Demand Analytics Data ──────────────────────────────────────────────
const ROUTE_DEMAND_DATA = [
  { route: "Warangal → Hyderabad",   bookings: 38, weightTon: 94,  revenue: 82000,  avgPrice: 2158, growthPct: 18,  topCrop: "Tomato",  distKm: 145, demandScore: 94 },
  { route: "Karimnagar → Hyderabad", bookings: 31, weightTon: 72,  revenue: 64000,  avgPrice: 2064, growthPct: 12,  topCrop: "Onion",   distKm: 165, demandScore: 87 },
  { route: "Nizamabad → Hyderabad",  bookings: 27, weightTon: 61,  revenue: 58000,  avgPrice: 2148, growthPct: 8,   topCrop: "Chilli",  distKm: 180, demandScore: 79 },
  { route: "Adilabad → Nagpur",      bookings: 19, weightTon: 48,  revenue: 49000,  avgPrice: 2578, growthPct: 22,  topCrop: "Soybean", distKm: 290, demandScore: 68 },
  { route: "Warangal → Chennai",     bookings: 14, weightTon: 35,  revenue: 58000,  avgPrice: 4142, growthPct: 31,  topCrop: "Turmeric",distKm: 620, demandScore: 61 },
  { route: "Khammam → Hyderabad",    bookings: 12, weightTon: 28,  revenue: 26000,  avgPrice: 2166, growthPct: 5,   topCrop: "Rice",    distKm: 195, demandScore: 55 },
  { route: "Adilabad → Hyderabad",   bookings: 10, weightTon: 22,  revenue: 24000,  avgPrice: 2400, growthPct: -3,  topCrop: "Wheat",   distKm: 240, demandScore: 48 },
  { route: "Warangal → Pune",        bookings: 8,  weightTon: 20,  revenue: 33000,  avgPrice: 4125, growthPct: 14,  topCrop: "Turmeric",distKm: 680, demandScore: 42 },
];

// Origin & destination demand
const ORIGIN_DEMAND = [
  { city: "Warangal",    bookings: 60, weightTon: 149 },
  { city: "Karimnagar",  bookings: 43, weightTon: 98  },
  { city: "Nizamabad",   bookings: 35, weightTon: 80  },
  { city: "Adilabad",    bookings: 29, weightTon: 70  },
  { city: "Khammam",     bookings: 12, weightTon: 28  },
];
const DEST_DEMAND = [
  { city: "Hyderabad",   bookings: 118, weightTon: 277 },
  { city: "Nagpur",      bookings: 19,  weightTon: 48  },
  { city: "Chennai",     bookings: 14,  weightTon: 35  },
  { city: "Pune",        bookings: 8,   weightTon: 20  },
];

// Weekly demand pattern (Mon–Sun index)
const WEEKLY_DEMAND = [
  { day: "Mon", bookings: 12, avgLoad: 68 },
  { day: "Tue", bookings: 18, avgLoad: 74 },
  { day: "Wed", bookings: 22, avgLoad: 81 },
  { day: "Thu", bookings: 19, avgLoad: 77 },
  { day: "Fri", bookings: 28, avgLoad: 91 },
  { day: "Sat", bookings: 34, avgLoad: 96 },
  { day: "Sun", bookings: 14, avgLoad: 58 },
];

// Month-over-month bookings
const MONTHLY_TREND = [
  { month: "May",  bookings: 48, revenue: 88000  },
  { month: "Jun",  bookings: 54, revenue: 102000 },
  { month: "Jul",  bookings: 61, revenue: 116000 },
  { month: "Aug",  bookings: 58, revenue: 112000 },
  { month: "Sep",  bookings: 72, revenue: 138000 },
  { month: "Oct",  bookings: 90, revenue: 172000 },
];

// Crop demand radar per top route
const CROP_ROUTE_DEMAND = [
  { route: "Wgl→Hyd",  Tomato: 38, Onion: 18, Chilli: 12, Turmeric: 8, Rice: 14 },
  { route: "Kmnr→Hyd", Tomato: 14, Onion: 42, Chilli: 10, Turmeric: 5, Rice: 9  },
  { route: "Nzbd→Hyd", Tomato: 8,  Onion: 16, Chilli: 41, Turmeric: 6, Rice: 10 },
  { route: "Adl→Ngp",  Tomato: 4,  Onion: 6,  Chilli: 5,  Turmeric: 10, Rice: 5 },
  { route: "Wgl→Chn",  Tomato: 6,  Onion: 4,  Chilli: 9,  Turmeric: 28, Rice: 3 },
];

const DEMAND_COLORS = [
  "hsl(var(--primary))", "#f97316", "#eab308", "#06b6d4", "#8b5cf6", "#ef4444", "#84cc16", "#ec4899"
];

// ── Static demo data ──────────────────────────────────────────────────────────
const ACTIVE_TRIPS = [
  { id: "TR-001", farmer: "Prakash Rao", from: "Nizamabad", to: "Chennai", crop: "Chilli", weight: "800kg", weightKg: 800, agreedPrice: 1400, status: "in-transit", progress: 65, eta: "4 hrs remaining", startTime: "06:00 AM", driver: "Vijay Kumar" },
  { id: "TR-002", farmer: "Anand Reddy", from: "Warangal", to: "Hyderabad", crop: "Tomato", weight: "2T", weightKg: 2000, agreedPrice: 2200, status: "pickup", progress: 10, eta: "ETA 2 hrs", startTime: "09:00 AM", driver: "Self" },
];

const COMPLETED_TRIPS = [
  { id: "TR-098", farmer: "Laxmi Devi", route: "Karimnagar → Hyderabad", crop: "Onion", earned: 1800, rating: 5, date: "Oct 12", weightKg: 1500 },
  { id: "TR-097", farmer: "Raju Nair", route: "Warangal → Pune", crop: "Turmeric", earned: 4200, rating: 4, date: "Oct 10", weightKg: 3000 },
  { id: "TR-096", farmer: "Gopi Krishna", route: "Adilabad → Nagpur", crop: "Soybean", earned: 3100, rating: 5, date: "Oct 8", weightKg: 2500 },
];

const EXTRA_LOAD_POOL = [
  { id: "XL-01", farmer: "Meena Bai",    crop: "Turmeric", from: "Karimnagar", to: "Hyderabad", weightKg: 600,  date: "2024-10-15", time: "07:30", offeredPrice: 700,  match: 96 },
  { id: "XL-02", farmer: "Ravi Shankar", crop: "Chilli",   from: "Warangal",  to: "Hyderabad", weightKg: 400,  date: "2024-10-18", time: "08:30", offeredPrice: 500,  match: 88 },
  { id: "XL-03", farmer: "Anita Reddy",  crop: "Potato",   from: "Karimnagar", to: "Hyderabad", weightKg: 1000, date: "2024-10-15", time: "06:30", offeredPrice: 1100, match: 81 },
  { id: "XL-04", farmer: "Suresh Patel", crop: "Onion",    from: "Warangal",  to: "Pune",      weightKg: 800,  date: "2024-10-22", time: "05:00", offeredPrice: 950,  match: 74 },
];

const CROP_COLORS: Record<string, string> = {
  Tomato: "#ef4444", Onion: "#a78bfa", Chilli: "#f97316",
  Turmeric: "#eab308", Rice: "#84cc16", Wheat: "#d97706", Potato: "#84cc16", Soybean: "#06b6d4",
};
const FALLBACK_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#06b6d4", "#8b5cf6"];

type XLStatus = "idle" | "counter-sent" | "confirmed" | "skipped";

// ══════════════════════════════════════════════════════════════════════════════
// ROADMAP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
interface RoadStop {
  id: string;
  type: "depot" | "pickup" | "drop";
  location: string;
  arrivalTime: string; // HH:MM 24h
  farmer?: string;
  crop?: string;
  weightKg?: number;
  price?: number;
  distFromPrev: number; // km
  driveFromPrev: number; // mins
  isExtra?: boolean;
}

function buildRoadmap(
  depotCity: string,
  bookings: Array<{ id: string; farmerName: string; product: string; weightKg: number; pickupLocation: string; dropLocation: string; time: string; counterPrice?: number; offeredPrice: number }>,
  extraLoads: Array<{ id: string; farmer: string; crop: string; weightKg: number; from: string; to: string; time: string; offeredPrice: number; finalPrice?: number }>,
): RoadStop[] {
  // Collect all pickups
  const pickups: RoadStop[] = [
    ...bookings.map(b => ({
      id: b.id, type: "pickup" as const,
      location: b.pickupLocation,
      arrivalTime: b.time,
      farmer: b.farmerName,
      crop: b.product,
      weightKg: b.weightKg,
      price: b.counterPrice ?? b.offeredPrice,
      distFromPrev: 0, driveFromPrev: 0,
    })),
    ...extraLoads.map(xl => ({
      id: xl.id, type: "pickup" as const,
      location: xl.from,
      arrivalTime: xl.time,
      farmer: xl.farmer,
      crop: xl.crop,
      weightKg: xl.weightKg,
      price: xl.finalPrice ?? xl.offeredPrice,
      distFromPrev: 0, driveFromPrev: 0,
      isExtra: true,
    })),
  ].sort((a, b) => timeStrToMins(a.arrivalTime) - timeStrToMins(b.arrivalTime));

  if (pickups.length === 0) return [];

  // Unique drop locations
  const drops = new Set([
    ...bookings.map(b => b.dropLocation),
    ...extraLoads.map(xl => xl.to),
  ]);

  const stops: RoadStop[] = [];

  // Depot
  const firstPickup = pickups[0];
  const depotDist = getDist(depotCity, firstPickup.location);
  const depotDrive = driveMins(depotDist);
  const depotDeparture = timeStrToMins(firstPickup.arrivalTime) - depotDrive;
  stops.push({
    id: "depot", type: "depot", location: depotCity,
    arrivalTime: `${String(Math.floor(depotDeparture / 60)).padStart(2, "0")}:${String(depotDeparture % 60).padStart(2, "0")}`,
    distFromPrev: 0, driveFromPrev: 0,
  });

  // Pickups with drive segments
  let prevLocation = depotCity;
  let prevTimeMins = depotDeparture;

  pickups.forEach(p => {
    const dist = getDist(prevLocation, p.location);
    const drive = driveMins(dist);
    // Arrival is max(scheduled time, prev_time + drive) 
    const earliest = prevTimeMins + drive;
    const scheduled = timeStrToMins(p.arrivalTime);
    const arrMins = Math.max(earliest, scheduled);
    const hh = String(Math.floor(arrMins / 60) % 24).padStart(2, "0");
    const mm = String(arrMins % 60).padStart(2, "0");
    stops.push({ ...p, arrivalTime: `${hh}:${mm}`, distFromPrev: dist, driveFromPrev: drive });
    prevLocation = p.location;
    prevTimeMins = arrMins + 15; // 15 min loading time
  });

  // Drop(s) — combine into one node if same city, else separate
  const dropArr = [...drops];
  dropArr.forEach((dropLoc, idx) => {
    const dist = getDist(prevLocation, dropLoc);
    const drive = driveMins(dist);
    const arrMins = prevTimeMins + drive;
    const hh = String(Math.floor(arrMins / 60) % 24).padStart(2, "0");
    const mm = String(arrMins % 60).padStart(2, "0");
    stops.push({
      id: `drop-${idx}`, type: "drop", location: dropLoc,
      arrivalTime: `${hh}:${mm}`,
      distFromPrev: dist, driveFromPrev: drive,
    });
    prevLocation = dropLoc;
    prevTimeMins = arrMins;
  });

  return stops;
}

function RouteRoadmap({ stops, capacityKg }: { stops: RoadStop[]; capacityKg: number }) {
  if (stops.length === 0) return null;

  let cumulativeKg = 0;
  const enriched = stops.map(s => {
    if (s.type === "pickup" && s.weightKg) cumulativeKg += s.weightKg;
    return { ...s, loadAfter: cumulativeKg };
  });

  const totalKm = stops.slice(1).reduce((s, st) => s + st.distFromPrev, 0);
  const dropStop = stops.find(s => s.type === "drop");
  const depotStop = stops.find(s => s.type === "depot");

  return (
    <div className="space-y-2">
      {/* Route summary bar */}
      <div className="flex items-center gap-4 text-xs bg-muted/40 rounded-lg px-4 py-2.5 border border-border flex-wrap">
        <span className="font-semibold text-foreground">🗺️ Route Summary</span>
        <span className="text-muted-foreground">📍 {depotStop?.location} → 🏪 {dropStop?.location}</span>
        <span className="text-muted-foreground">🛣️ ~{totalKm} km total</span>
        <span className="text-muted-foreground">⏱️ {depotStop?.arrivalTime} → {dropStop?.arrivalTime}</span>
        <span className="text-muted-foreground">📦 {(cumulativeKg / 1000).toFixed(2)}T cargo</span>
      </div>

      {/* Stops timeline */}
      <div className="relative">
        {enriched.map((stop, idx) => {
          const isLast = idx === enriched.length - 1;
          const loadPct = Math.min(100, Math.round((stop.loadAfter / capacityKg) * 100));

          return (
            <div key={stop.id} className="flex gap-0">
              {/* Left: time + connector line */}
              <div className="flex flex-col items-center w-16 flex-shrink-0">
                <div className={`text-[10px] font-bold text-center leading-tight pt-3 ${stop.type === "depot" ? "text-muted-foreground" : stop.type === "drop" ? "text-primary" : "text-foreground"}`}>
                  {minsToTime(timeStrToMins(stop.arrivalTime))}
                </div>
                {/* Dot */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 z-10 ${
                  stop.type === "depot" ? "bg-muted border-border"
                  : stop.type === "drop" ? "bg-primary border-primary"
                  : stop.isExtra ? "bg-accent border-accent"
                  : "bg-primary/80 border-primary"
                }`} />
                {/* Line down */}
                {!isLast && (
                  <div className="w-0.5 bg-border flex-1 min-h-[32px]" />
                )}
              </div>

              {/* Right: card */}
              <div className={`flex-1 pb-3 pt-2 pl-3 ${isLast ? "" : ""}`}>
                {/* Segment info (above card, for all except depot) */}
                {stop.distFromPrev > 0 && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5 -mt-1">
                    <div className="h-px flex-1 border-t border-dashed border-border/60" />
                    <span className="flex-shrink-0 bg-background border border-border rounded px-1.5 py-0.5">
                      🛣️ {stop.distFromPrev} km · ⏱️ {fmtDuration(stop.driveFromPrev)}
                    </span>
                    <div className="h-px flex-1 border-t border-dashed border-border/60" />
                  </div>
                )}

                {stop.type === "depot" && (
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-base">🚛</span>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">DEPARTURE — {stop.location}</div>
                      <div className="text-[10px] text-muted-foreground">Vehicle departs depot</div>
                    </div>
                  </div>
                )}

                {stop.type === "pickup" && (
                  <div className={`rounded-xl border p-3 space-y-1.5 ${stop.isExtra ? "border-accent/40 bg-accent/5" : "border-primary/30 bg-primary/3"}`}>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">📦</span>
                        <span className="font-semibold text-sm text-foreground">{stop.location}</span>
                        {stop.isExtra && <Badge className="text-[9px] bg-accent/20 text-foreground border border-accent/30">+ Extra Load</Badge>}
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">{stop.id}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs">
                      <span className="text-muted-foreground">🧑‍🌾 {stop.farmer}</span>
                      <span>🌾 {stop.crop}</span>
                      <span>⚖️ {stop.weightKg! >= 1000 ? `${(stop.weightKg! / 1000).toFixed(1)}T` : `${stop.weightKg}kg`}</span>
                      <span className="text-primary font-semibold">💵 ₹{stop.price?.toLocaleString()}</span>
                    </div>
                    {/* Running load meter */}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="flex-shrink-0">Truck load after pickup:</span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${loadPct >= 80 ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${loadPct}%` }} />
                      </div>
                      <span className={`flex-shrink-0 font-semibold ${loadPct >= 80 ? "text-destructive" : "text-primary"}`}>{loadPct}%</span>
                    </div>
                  </div>
                )}

                {stop.type === "drop" && (
                  <div className="rounded-xl border-2 border-primary bg-primary/5 p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🏪</span>
                      <div>
                        <div className="font-bold text-sm text-primary">{stop.location} Market — DELIVERY</div>
                        <div className="text-[10px] text-muted-foreground">All cargo unloaded · Trip complete</div>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>📦 {(cumulativeKg / 1000).toFixed(2)}T delivered</span>
                      <span>🛣️ {totalKm} km total</span>
                      <span>⏰ Arrived {minsToTime(timeStrToMins(stop.arrivalTime))}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
export default function TransportDashboard() {
  const { toast } = useToast();
  const { user } = useRole();
  const { bookings, sendCounter, acceptBooking, rejectBooking } = useTransportBooking();

  const tp = (user?.profile ?? {}) as TransportProfile;
  const ownerName   = user?.name ?? "Vijay Logistics";
  const ownerLoc    = user?.location ?? "Warangal, Telangana";
  const vType       = tp.vehicleType ?? "Large Truck (5–10T)";
  const vNo         = tp.vehicleNo   ?? "TS 09 EA 4512";
  const vCap        = parseFloat(tp.capacity ?? "10");
  const isRefrig    = tp.isRefrigerated === "Yes";
  const fuelType    = tp.fuelType ?? "Diesel";
  const routes      = tp.operatingRoutes ?? "Warangal, Karimnagar, Hyderabad, Chennai";
  const driverLic   = tp.driverLicenseNo ?? "";
  const tripsPerMo  = tp.tripsPerMonth ?? "6–15";

  const [myVehicle, setMyVehicle] = useState({
    type: vType, regNo: vNo, capacity: vCap, available: Math.max(1, vCap - 2),
    location: ownerLoc, routes,
    pricePerKm: "45", pricePerTon: "320", minLoad: "500", maxLoad: String(vCap * 1000),
    availableFrom: "05:00", availableTo: "22:00",
    driverName: ownerName, driverPhone: user?.phone ?? "99887 11223", status: "available",
  });

  const [negotiations, setNegotiations] = useState<Record<string, { counter: string; note: string }>>({});

  // ── XL load negotiation state ─────────────────────────────────────────────
  const [xlStatus, setXlStatus] = useState<Record<string, XLStatus>>({});
  const [xlNeg, setXlNeg] = useState<Record<string, { counter: string; note: string }>>({});
  const [xlFinalPrice, setXlFinalPrice] = useState<Record<string, number>>({});
  const [openRoadmap, setOpenRoadmap] = useState<string | null>(null); // date string

  const capacityKg = myVehicle.capacity * 1000;
  const newCount = bookings.filter(b => b.status === "pending").length;

  const approvedBookings = useMemo(() =>
    bookings
      .filter(b => ["accepted", "farmer-accepted"].includes(b.status))
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()),
    [bookings]
  );

  // Confirmed XL loads (agreed by both sides)
  const confirmedXL = useMemo(() =>
    EXTRA_LOAD_POOL.filter(xl => xlStatus[xl.id] === "confirmed"),
    [xlStatus]
  );

  // ── Date-wise groupings ───────────────────────────────────────────────────
  const allDates = useMemo(() => {
    const dateSet = new Set([
      ...approvedBookings.map(b => b.date),
      ...confirmedXL.map(xl => xl.date),
    ]);
    return [...dateSet].sort();
  }, [approvedBookings, confirmedXL]);

  // Per-date: booked kg + confirmed XL kg
  const dateStats = useMemo(() => {
    return allDates.map(date => {
      const dayBookings = approvedBookings.filter(b => b.date === date);
      const dayXL = confirmedXL.filter(xl => xl.date === date);
      const bookedKg = dayBookings.reduce((s, b) => s + b.weightKg, 0);
      const xlKg = dayXL.reduce((s, xl) => s + xl.weightKg, 0);
      const totalKg = bookedKg + xlKg;
      const usedPct = Math.min(100, Math.round((totalKg / capacityKg) * 100));
      const freeKg = Math.max(0, capacityKg - totalKg);
      return { date, dayBookings, dayXL, totalKg, usedPct, freeKg };
    });
  }, [allDates, approvedBookings, confirmedXL, capacityKg]);

  // Overall stats across all dates
  const totalScheduledKg = useMemo(() =>
    approvedBookings.reduce((s, b) => s + b.weightKg, 0) +
    confirmedXL.reduce((s, xl) => s + xl.weightKg, 0),
    [approvedBookings, confirmedXL]
  );
  const overallUsedPct = Math.min(100, Math.round((totalScheduledKg / capacityKg) * 100));
  const overallFreeKg = Math.max(0, capacityKg - totalScheduledKg);
  const totalEarnings = approvedBookings.reduce((s, b) => s + (b.counterPrice ?? b.offeredPrice), 0)
    + confirmedXL.reduce((s, xl) => s + (xlFinalPrice[xl.id] ?? xl.offeredPrice), 0);

  // Per-date chart data
  const dailyChart = useMemo(() =>
    dateStats.map(d => ({
      date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      usedPct: d.usedPct,
      freePct: 100 - d.usedPct,
      totalKg: d.totalKg,
    })),
    [dateStats]
  );

  // Crop pie (all confirmed)
  const cropPie = useMemo(() => {
    const map: Record<string, number> = {};
    approvedBookings.forEach(b => { map[b.product] = (map[b.product] || 0) + b.weightKg; });
    confirmedXL.forEach(xl => { map[xl.crop] = (map[xl.crop] || 0) + xl.weightKg; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [approvedBookings, confirmedXL]);

  const totalEarned = COMPLETED_TRIPS.reduce((s, t) => s + t.earned, 0);

  // XL suggestions eligible per date (fit remaining space)
  function getXLForDate(date: string, freeKg: number) {
    return EXTRA_LOAD_POOL.filter(xl =>
      xl.date === date &&
      xl.weightKg <= freeKg &&
      !["confirmed", "skipped"].includes(xlStatus[xl.id] || "idle")
    );
  }

  // ── XL negotiation handlers ───────────────────────────────────────────────
  const handleXLAccept = (xl: typeof EXTRA_LOAD_POOL[0]) => {
    setXlStatus(p => ({ ...p, [xl.id]: "confirmed" }));
    setXlFinalPrice(p => ({ ...p, [xl.id]: xl.offeredPrice }));
    toast({ title: "✅ Load Added!", description: `${xl.farmer}'s ${xl.weightKg}kg confirmed at ₹${xl.offeredPrice}` });
  };

  const handleXLCounter = (xl: typeof EXTRA_LOAD_POOL[0]) => {
    const counter = xlNeg[xl.id]?.counter;
    if (!counter || isNaN(Number(counter))) {
      toast({ title: "Enter a valid counter price", variant: "destructive" }); return;
    }
    setXlStatus(p => ({ ...p, [xl.id]: "counter-sent" }));
    toast({ title: "💬 Counter Sent to Farmer", description: `Proposed ₹${counter} for ${xl.farmer}'s load` });
  };

  const handleXLFarmerAccept = (xl: typeof EXTRA_LOAD_POOL[0]) => {
    const price = Number(xlNeg[xl.id]?.counter) || xl.offeredPrice;
    setXlStatus(p => ({ ...p, [xl.id]: "confirmed" }));
    setXlFinalPrice(p => ({ ...p, [xl.id]: price }));
    toast({ title: "🎉 Farmer Accepted Counter!", description: `Load confirmed at ₹${price}` });
  };

  const handleXLSkip = (id: string) => setXlStatus(p => ({ ...p, [id]: "skipped" }));

  const handleCounterOffer = (id: string) => {
    const counter = negotiations[id]?.counter;
    if (!counter || isNaN(Number(counter))) {
      toast({ title: "Enter a valid counter price", variant: "destructive" }); return;
    }
    sendCounter(id, Number(counter), negotiations[id]?.note || "");
    toast({ title: "💬 Counter Offer Sent", description: `Sent ₹${counter} for ${id}` });
  };

  return (
    <AppLayout title="Transport Owner Dashboard" subtitle={`${ownerName} · ${vNo} · ${vType}${isRefrig ? " · ❄️ Refrigerated" : ""}`}>
      <div className="space-y-6 animate-fade-in">

        {/* ── Top KPIs ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Confirmed Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon="💵" trend="up" trendValue="From scheduled trips" highlight />
          <StatCard title="Pending Requests" value={String(newCount)} icon="📋" />
          <StatCard title="Confirmed Trips" value={String(approvedBookings.length + confirmedXL.length)} icon="✅" trend="stable" trendValue={`Across ${allDates.length} dates`} />
          <StatCard title="Free Capacity" value={`${(overallFreeKg / 1000).toFixed(1)}T`} icon="⚖️" trend={overallUsedPct > 80 ? "up" : "stable"} trendValue={`${overallUsedPct}% utilised`} />
        </div>

        {/* ── Profile Summary Banner ── */}
        {user?.profile && (
          <Card className="border-secondary/20 bg-secondary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl">🚚</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground">{ownerName}</div>
                  <div className="text-xs text-muted-foreground">{ownerLoc}</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1 text-xs flex-1">
                  {[
                    { l: "🚛 Vehicle Type", v: vType },
                    { l: "🔑 Reg. No.", v: vNo },
                    { l: "⚖️ Capacity", v: `${vCap} Ton` },
                    { l: "❄️ Refrigerated", v: isRefrig ? "Yes" : "No" },
                    { l: "⛽ Fuel", v: fuelType },
                    { l: "🗺️ Routes", v: routes },
                    { l: "📅 Trips/Month", v: tripsPerMo },
                    { l: "🪪 License", v: driverLic || "—" },
                  ].filter(r => r.v && r.v !== "—").map(r => (
                    <div key={r.l}>
                      <div className="text-muted-foreground">{r.l}</div>
                      <div className="font-semibold text-foreground">{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="schedule">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="schedule" className="relative">
              📅 Smart Schedule
              {approvedBookings.length + confirmedXL.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                  {approvedBookings.length + confirmedXL.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              📋 Booking Requests
              {newCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                  {newCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">🚚 Active Trips</TabsTrigger>
            <TabsTrigger value="myvehicle">🔧 My Vehicle</TabsTrigger>
            <TabsTrigger value="earnings">💰 Earnings</TabsTrigger>
            <TabsTrigger value="demand">📊 Route Demand</TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════════
              TAB: SMART SCHEDULE
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="schedule" className="mt-4 space-y-5">

            {/* Overall capacity gauge */}
            <Card className="border-primary/20 bg-primary/3">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">🚛 Overall Vehicle Capacity</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{myVehicle.regNo} · {myVehicle.type}</p>
                  </div>
                  <Badge className={`text-xs font-semibold ${overallUsedPct >= 80 ? "bg-primary text-primary-foreground" : overallUsedPct >= 50 ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/40" : "bg-muted text-muted-foreground"}`}>
                    {overallUsedPct >= 80 ? "Excellent" : overallUsedPct >= 50 ? "Good" : "Low"} Utilisation
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Capacity", value: `${myVehicle.capacity}T`, sub: `${capacityKg.toLocaleString()} kg` },
                    { label: "Scheduled Load", value: `${(totalScheduledKg / 1000).toFixed(2)}T`, sub: `${totalScheduledKg.toLocaleString()} kg`, primary: true },
                    { label: "Free Space", value: `${(overallFreeKg / 1000).toFixed(2)}T`, sub: `${overallFreeKg.toLocaleString()} kg` },
                  ].map(s => (
                    <div key={s.label} className="bg-background rounded-lg p-3 border border-border text-center">
                      <div className={`text-xl font-bold ${s.primary ? "text-primary" : "text-foreground"}`}>{s.value}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Overall load utilisation</span>
                    <span className="font-semibold text-primary">{overallUsedPct}%</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div className={`h-4 rounded-full transition-all duration-500 ${overallUsedPct >= 80 ? "bg-primary" : overallUsedPct >= 50 ? "bg-yellow-500" : "bg-muted-foreground/40"}`}
                      style={{ width: `${overallUsedPct}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date-wise capacity chart */}
            {dailyChart.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Capacity Used % by Date</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={170}>
                      <BarChart data={dailyChart} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="%" width={36} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number, name: string) => [
                            name === "usedPct" ? `${v}% used` : `${v}% free`,
                            name === "usedPct" ? "Booked" : "Free"
                          ]} />
                        <Bar dataKey="usedPct" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="freePct" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">🌾 Cargo Mix by Crop</CardTitle></CardHeader>
                  <CardContent>
                    {cropPie.length > 0 ? (
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie data={cropPie} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                            {cropPie.map((entry, i) => (
                              <Cell key={entry.name} fill={CROP_COLORS[entry.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                            formatter={(v: number) => [`${v} kg`]} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No bookings yet</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Date cards */}
            {dateStats.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  <div className="text-4xl mb-3">📅</div>
                  <p>No confirmed bookings yet.</p>
                  <p className="text-xs mt-1">Accept requests from the Booking Requests tab to build your schedule.</p>
                </CardContent>
              </Card>
            ) : (
              dateStats.map(({ date, dayBookings, dayXL, totalKg, usedPct, freeKg }) => {
                const dateLabel = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
                const xlSuggestions = getXLForDate(date, freeKg);
                const isRoadmapOpen = openRoadmap === date;

                // Build roadmap stops for this date
                const roadmapStops = buildRoadmap(
                  myVehicle.location,
                  dayBookings,
                  dayXL.map(xl => ({
                    ...xl,
                    finalPrice: xlFinalPrice[xl.id],
                  }))
                );

                const statusColor = usedPct >= 90 ? "text-destructive" : usedPct >= 60 ? "text-primary" : "text-yellow-600";
                const barColor = usedPct >= 90 ? "bg-destructive" : usedPct >= 60 ? "bg-primary" : "bg-yellow-500";

                return (
                  <div key={date} className="border border-border rounded-xl overflow-hidden shadow-sm">

                    {/* ── Date header ── */}
                    <div className="bg-muted/40 px-4 py-3 border-b border-border">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span className="font-semibold text-sm text-foreground">{dateLabel}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {dayBookings.length + dayXL.length} load{(dayBookings.length + dayXL.length) !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <Button size="sm" variant="outline"
                          className={`text-xs h-7 gap-1 ${isRoadmapOpen ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                          onClick={() => setOpenRoadmap(isRoadmapOpen ? null : date)}>
                          🗺️ {isRoadmapOpen ? "Hide Roadmap" : "View Roadmap"}
                        </Button>
                      </div>

                      {/* Capacity bar for this date */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Day capacity</span>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">{(totalKg / 1000).toFixed(2)}T loaded</span>
                            <span className={`font-bold ${statusColor}`}>{usedPct}% full</span>
                            {freeKg > 0 && <span className="text-primary font-medium">{(freeKg / 1000).toFixed(2)}T free</span>}
                          </div>
                        </div>
                        <div className="h-3 bg-background border border-border rounded-full overflow-hidden">
                          <div className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
                            style={{ width: `${usedPct}%` }} />
                        </div>
                        <div className="flex text-[10px] text-muted-foreground justify-between">
                          <span>0 kg</span>
                          <span>{myVehicle.capacity}T ({capacityKg.toLocaleString()} kg)</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Confirmed loads ── */}
                    <div className="divide-y divide-border">
                      {[...dayBookings, ...dayXL.map(xl => ({
                        _isXL: true, id: xl.id,
                        farmerName: xl.farmer, farmerPhone: "—",
                        product: xl.crop, weightKg: xl.weightKg,
                        pickupLocation: xl.from, dropLocation: xl.to,
                        date: xl.date, time: xl.time,
                        offeredPrice: xl.offeredPrice,
                        counterPrice: xlFinalPrice[xl.id],
                        status: "confirmed-xl" as any,
                        notes: "", createdAt: "",
                      }))]
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((load: any) => (
                          <div key={load.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors ${load._isXL ? "bg-accent/3" : ""}`}>
                            <div className="flex flex-col items-center min-w-[48px]">
                              <div className="text-xs font-bold text-primary">{load.time}</div>
                              <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm">{load.pickupLocation} → {load.dropLocation}</span>
                                {load._isXL
                                  ? <Badge className="text-[9px] bg-accent/20 text-foreground border border-accent/30">+ Extra Load</Badge>
                                  : <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">✅ Confirmed</Badge>
                                }
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 text-xs text-muted-foreground">
                                <span>🧑‍🌾 {load.farmerName}</span>
                                <span>📦 {load.product} · {load.weightKg >= 1000 ? `${(load.weightKg / 1000).toFixed(1)}T` : `${load.weightKg}kg`}</span>
                                <span className="text-primary font-semibold">💵 ₹{(load.counterPrice ?? load.offeredPrice).toLocaleString()}</span>
                                <span className="font-mono text-[10px]">{load.id}</span>
                              </div>
                              {load.notes && <p className="text-[10px] text-muted-foreground italic">📝 {load.notes}</p>}
                            </div>
                            <div className="hidden sm:block text-[10px] text-right">
                              <div className="text-muted-foreground">{Math.round((load.weightKg / capacityKg) * 100)}% of truck</div>
                              <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min(100, (load.weightKg / capacityKg) * 100)}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* ── Roadmap ── */}
                    {isRoadmapOpen && roadmapStops.length > 0 && (
                      <div className="border-t border-primary/20 bg-primary/3 px-4 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">🗺️</span>
                          <h4 className="font-semibold text-sm">Route Roadmap for {dateLabel}</h4>
                        </div>
                        <RouteRoadmap stops={roadmapStops} capacityKg={capacityKg} />
                      </div>
                    )}

                    {/* ── Extra load suggestions for this date ── */}
                    {freeKg > 0 && xlSuggestions.length > 0 && (
                      <div className="border-t border-dashed border-border bg-muted/20 px-4 py-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">💡</span>
                          <h4 className="font-semibold text-xs text-foreground">
                            Fill Remaining Space — {(freeKg / 1000).toFixed(2)}T free on this date
                          </h4>
                          <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
                            {xlSuggestions.length} matching load{xlSuggestions.length > 1 ? "s" : ""}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {xlSuggestions.map(xl => {
                            const status = xlStatus[xl.id] || "idle";
                            const neg = xlNeg[xl.id] || { counter: "", note: "" };
                            const fitsComfortably = xl.weightKg <= freeKg * 0.8;

                            return (
                              <Card key={xl.id} className={`border ${fitsComfortably ? "border-primary/30 bg-primary/3" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                                <CardContent className="p-4 space-y-2.5">
                                  {/* Header */}
                                  <div className="flex justify-between items-start gap-2">
                                    <div>
                                      <div className="font-semibold text-sm">{xl.farmer}</div>
                                      <div className="text-xs text-muted-foreground">{xl.crop} · {xl.weightKg >= 1000 ? `${xl.weightKg / 1000}T` : `${xl.weightKg}kg`}</div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-xs font-bold text-primary">₹{xl.offeredPrice}</div>
                                      <Badge className={`text-[9px] mt-0.5 ${xl.match >= 90 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                        {xl.match}% match
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div>📍 {xl.from} → {xl.to} · ⏰ {xl.time}</div>
                                    <div>🛣️ ~{getDist(xl.from, xl.to)} km detour</div>
                                  </div>

                                  {/* Space bar */}
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] text-muted-foreground">
                                      <span>Uses {Math.round((xl.weightKg / freeKg) * 100)}% of free space</span>
                                      <span>{xl.weightKg.toLocaleString()} kg</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className={`h-1.5 rounded-full ${fitsComfortably ? "bg-primary" : "bg-yellow-500"}`}
                                        style={{ width: `${Math.min(100, (xl.weightKg / freeKg) * 100)}%` }} />
                                    </div>
                                  </div>

                                  {/* Status: idle → negotiation UI */}
                                  {status === "idle" && (
                                    <div className="space-y-2 pt-1 border-t border-border">
                                      <div className="flex items-end gap-2">
                                        <div className="space-y-1 flex-1">
                                          <Label className="text-[10px] text-muted-foreground">Counter Price (₹)</Label>
                                          <Input className="h-7 text-xs" placeholder={`e.g. ${Math.round(xl.offeredPrice * 1.1)}`}
                                            value={neg.counter}
                                            onChange={e => setXlNeg(p => ({ ...p, [xl.id]: { ...p[xl.id], counter: e.target.value, note: p[xl.id]?.note || "" } }))} />
                                        </div>
                                      </div>
                                      <div className="flex gap-1.5">
                                        <Button size="sm" className="flex-1 bg-primary text-[10px] h-7" onClick={() => handleXLAccept(xl)}>
                                          ✅ Accept ₹{xl.offeredPrice}
                                        </Button>
                                        {neg.counter && (
                                          <Button size="sm" variant="outline" className="text-[10px] h-7 border-accent/50" onClick={() => handleXLCounter(xl)}>
                                            💬 Counter ₹{neg.counter}
                                          </Button>
                                        )}
                                        <Button size="sm" variant="outline" className="text-[10px] h-7 border-border" onClick={() => handleXLSkip(xl.id)}>
                                          Skip
                                        </Button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Status: counter-sent → simulate farmer response */}
                                  {status === "counter-sent" && (
                                    <div className="pt-1 border-t border-border space-y-2">
                                      <div className="text-xs bg-accent/10 border border-accent/20 rounded px-2 py-1.5 text-foreground">
                                        💬 Counter ₹{xlNeg[xl.id]?.counter} sent — awaiting farmer's response
                                      </div>
                                      <div className="text-[10px] text-muted-foreground font-medium">Simulate farmer response:</div>
                                      <div className="flex gap-1.5">
                                        <Button size="sm" className="flex-1 bg-primary text-[10px] h-7" onClick={() => handleXLFarmerAccept(xl)}>
                                          🎉 Farmer Accepts
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-[10px] h-7 border-destructive/50 text-destructive" onClick={() => handleXLSkip(xl.id)}>
                                          ✗ Farmer Declines
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Full capacity message */}
                    {usedPct >= 98 && (
                      <div className="border-t border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-primary font-medium">
                        🎉 Truck is at full capacity for this date — no more loads can be added.
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Tips */}
            <Card className="border-dashed border-border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-semibold">💡 Scheduling Tips</div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• <strong>Cluster nearby pickups</strong> on the same day to reduce empty return kilometres.</li>
                  <li>• <strong>Start at 05:00–06:00 AM</strong> — early departures avoid traffic and reach markets before peak hours.</li>
                  <li>• <strong>Counter-negotiate extra loads</strong> slightly above the offered price for short-route detours.</li>
                  <li>• <strong>Keep 10–15% buffer</strong> for surprise top-ups from farmers on route.</li>
                  <li>• Accept loads ≥80% route match to avoid costly detours.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: BOOKING REQUESTS
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="requests" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Incoming Booking Requests</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 border">{newCount} New</Badge>
            </div>

            {bookings.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  <div className="text-4xl mb-3">📋</div>
                  <p>No booking requests yet.</p>
                </CardContent>
              </Card>
            )}

            {bookings.map((b) => {
              const neg = negotiations[b.id] || { counter: "", note: "" };
              const isActioned = ["accepted", "rejected", "farmer-accepted", "farmer-rejected"].includes(b.status);
              const isCounterSent = b.status === "counter-sent";
              return (
                <Card key={b.id} className={`border-2 transition-all ${
                  b.status === "accepted" || b.status === "farmer-accepted" ? "border-primary/40 bg-primary/5"
                  : b.status === "rejected" || b.status === "farmer-rejected" ? "border-destructive/30 bg-destructive/5 opacity-60"
                  : isCounterSent ? "border-accent/40 bg-accent/5"
                  : "border-border"
                }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                      <Badge variant="outline" className={`text-xs ${
                        b.status === "accepted" || b.status === "farmer-accepted" ? "bg-primary/10 text-primary border-primary/30"
                        : b.status === "rejected" || b.status === "farmer-rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
                        : isCounterSent ? "bg-accent/20 text-foreground border-accent/40"
                        : "bg-muted text-muted-foreground"
                      }`}>
                        {b.status === "counter-sent" ? "💬 Counter Sent"
                        : b.status === "farmer-accepted" ? "🎉 Farmer Accepted"
                        : b.status === "farmer-rejected" ? "✗ Farmer Declined"
                        : b.status === "accepted" ? "✅ Accepted"
                        : b.status === "rejected" ? "❌ Rejected"
                        : "⏳ Pending"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                      <div><span className="text-muted-foreground">Farmer</span><br /><span className="font-medium">{b.farmerName}</span></div>
                      <div><span className="text-muted-foreground">Phone</span><br /><span className="font-medium">{b.farmerPhone}</span></div>
                      <div><span className="text-muted-foreground">Route</span><br /><span className="font-medium">{b.pickupLocation} → {b.dropLocation}</span></div>
                      <div><span className="text-muted-foreground">Load</span><br /><span className="font-medium">{b.product} · {b.weightKg >= 1000 ? `${b.weightKg / 1000}T` : `${b.weightKg}kg`}</span></div>
                      <div><span className="text-muted-foreground">Date / Time</span><br /><span className="font-medium">{b.date} · {b.time}</span></div>
                      <div><span className="text-muted-foreground">Farmer's Price</span><br /><span className="font-semibold text-primary">₹{b.offeredPrice}</span></div>
                      {b.counterPrice && <div><span className="text-muted-foreground">Your Counter</span><br /><span className="font-semibold">₹{b.counterPrice}</span></div>}
                    </div>
                    {b.notes && <p className="text-xs text-muted-foreground italic">📝 {b.notes}</p>}
                    {!isActioned && !isCounterSent && (
                      <div className="pt-3 border-t border-border flex flex-wrap gap-2 items-end">
                        <div className="flex items-end gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Counter Price (₹)</Label>
                            <Input className="h-8 w-36 text-xs" placeholder={`e.g. ${Math.round(b.offeredPrice * 1.15)}`}
                              value={neg.counter}
                              onChange={e => setNegotiations(p => ({ ...p, [b.id]: { ...p[b.id], counter: e.target.value, note: p[b.id]?.note || "" } }))} />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Note (optional)</Label>
                            <Input className="h-8 w-48 text-xs" placeholder="e.g. Fuel surcharge applies"
                              value={neg.note}
                              onChange={e => setNegotiations(p => ({ ...p, [b.id]: { counter: p[b.id]?.counter || "", note: e.target.value } }))} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <Button size="sm" className="bg-primary text-xs h-8"
                            onClick={() => { acceptBooking(b.id); toast({ title: "✅ Booking Accepted!", description: `${b.id} confirmed at ₹${b.offeredPrice}` }); }}>
                            ✅ Accept ₹{b.offeredPrice}
                          </Button>
                          {neg.counter && (
                            <Button size="sm" variant="outline" className="text-xs h-8 border-accent/50" onClick={() => handleCounterOffer(b.id)}>
                              💬 Counter ₹{neg.counter}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive"
                            onClick={() => { rejectBooking(b.id); toast({ title: "❌ Rejected", variant: "destructive" }); }}>
                            ✗ Decline
                          </Button>
                        </div>
                      </div>
                    )}
                    {isCounterSent && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        💬 Counter <span className="font-semibold text-foreground">₹{b.counterPrice}</span> sent — waiting for farmer.
                        {b.counterNote && <span className="ml-1 italic">({b.counterNote})</span>}
                      </div>
                    )}
                    {b.status === "farmer-accepted" && (
                      <div className="text-xs text-primary font-medium pt-2 border-t border-primary/20">
                        🎉 Confirmed at ₹{b.counterPrice || b.offeredPrice} — {b.date} {b.time}. Contact: {b.farmerPhone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: ACTIVE TRIPS
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="active" className="mt-4 space-y-4">
            {ACTIVE_TRIPS.map((t) => (
              <Card key={t.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{t.id}</span>
                        <Badge variant="outline" className={`text-xs ${t.status === "in-transit" ? "bg-primary/10 text-primary border-primary/30" : "bg-muted text-muted-foreground"}`}>
                          {t.status === "in-transit" ? "🚚 In Transit" : "📦 Pickup"}
                        </Badge>
                      </div>
                      <div className="font-semibold text-sm mt-1">{t.from} → {t.to}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">{t.eta}</div>
                      <div className="font-semibold text-primary text-sm">₹{t.agreedPrice}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs mb-4">
                    <div><span className="text-muted-foreground">Farmer</span><br /><span className="font-medium">{t.farmer}</span></div>
                    <div><span className="text-muted-foreground">Cargo</span><br /><span className="font-medium">{t.crop} · {t.weight}</span></div>
                    <div><span className="text-muted-foreground">Driver</span><br /><span className="font-medium">{t.driver}</span></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Trip Progress</span><span>{t.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full">
                      <div className="h-2.5 bg-primary rounded-full" style={{ width: `${t.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                      <span>📦 Pickup</span><span>🛣️ In Transit</span><span>✅ Delivered</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="bg-primary text-xs h-7" onClick={() => toast({ title: "📍 Location updated" })}>Update Location</Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary" onClick={() => toast({ title: "✅ Marked as delivered!" })}>Mark Delivered</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: MY VEHICLE
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="myvehicle" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-primary/3">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">My Vehicle</CardTitle>
                    <Badge className={myVehicle.status === "available" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                      {myVehicle.status === "available" ? "🟢 Available" : "🔴 On Trip"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">🚛</div>
                    <div>
                      <div className="font-bold text-lg">{myVehicle.regNo}</div>
                      <div className="text-sm text-muted-foreground">{myVehicle.type}</div>
                      <div className="text-xs text-muted-foreground">📍 {myVehicle.location}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Total Capacity", val: `${myVehicle.capacity} Ton` },
                      { label: "Available Load", val: `${myVehicle.available} Ton`, primary: true },
                      { label: "Price / km", val: `₹${myVehicle.pricePerKm}` },
                      { label: "Price / Ton", val: `₹${myVehicle.pricePerTon}` },
                    ].map(s => (
                      <div key={s.label} className="bg-muted/50 rounded-lg p-3">
                        <div className="text-muted-foreground mb-0.5">{s.label}</div>
                        <div className={`font-semibold text-base ${s.primary ? "text-primary" : ""}`}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs border-primary/30 text-primary"
                    onClick={() => { setMyVehicle(v => ({ ...v, status: v.status === "available" ? "on-trip" : "available" })); toast({ title: "Status updated!" }); }}>
                    Toggle Availability
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-sm">Update Vehicle & Pricing</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Vehicle Type</Label>
                      <Select defaultValue="Large Truck" onValueChange={(v) => setMyVehicle(p => ({ ...p, type: v }))}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mini Truck">Mini Truck (1–3T)</SelectItem>
                          <SelectItem value="Large Truck">Large Truck (5–10T)</SelectItem>
                          <SelectItem value="Refrigerated Van">❄️ Refrigerated Van</SelectItem>
                          <SelectItem value="Tempo / Auto">Tempo / Auto</SelectItem>
                          <SelectItem value="Tractor Trolley">Tractor Trolley</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Registration No.</Label>
                      <Input className="h-8 text-xs" value={myVehicle.regNo} onChange={e => setMyVehicle(p => ({ ...p, regNo: e.target.value }))} />
                    </div>
                    {[
                      { label: "Total Capacity (Ton)", key: "capacity" },
                      { label: "Available Load (Ton)", key: "available" },
                      { label: "My Price / km (₹)", key: "pricePerKm" },
                      { label: "My Price / Ton (₹)", key: "pricePerTon" },
                      { label: "Min Load (kg)", key: "minLoad" },
                      { label: "Max Load (kg)", key: "maxLoad" },
                    ].map(f => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-xs">{f.label}</Label>
                        <Input className="h-8 text-xs" type="number" value={(myVehicle as any)[f.key]}
                          onChange={e => {
                            const val = ["capacity", "available"].includes(f.key) ? Number(e.target.value) : e.target.value;
                            setMyVehicle(p => ({ ...p, [f.key]: val }));
                          }} />
                      </div>
                    ))}
                    <div className="space-y-1">
                      <Label className="text-xs">Available From</Label>
                      <Input className="h-8 text-xs" type="time" value={myVehicle.availableFrom} onChange={e => setMyVehicle(p => ({ ...p, availableFrom: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Available To</Label>
                      <Input className="h-8 text-xs" type="time" value={myVehicle.availableTo} onChange={e => setMyVehicle(p => ({ ...p, availableTo: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Current Location</Label>
                    <Input className="h-8 text-xs" value={myVehicle.location} onChange={e => setMyVehicle(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Routes (comma-separated cities)</Label>
                    <Input className="h-8 text-xs" value={myVehicle.routes} onChange={e => setMyVehicle(p => ({ ...p, routes: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Driver Name</Label>
                      <Input className="h-8 text-xs" value={myVehicle.driverName} onChange={e => setMyVehicle(p => ({ ...p, driverName: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Driver Phone</Label>
                      <Input className="h-8 text-xs" value={myVehicle.driverPhone} onChange={e => setMyVehicle(p => ({ ...p, driverPhone: e.target.value }))} />
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-xs" size="sm"
                    onClick={() => toast({ title: "✅ Vehicle details saved!" })}>
                    Save Vehicle Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: EARNINGS
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="earnings" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">₹{totalEarned.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-1">Recent Earnings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{COMPLETED_TRIPS.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Trips Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">4.8 ⭐</div>
                  <div className="text-xs text-muted-foreground mt-1">Average Rating</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Completed Trips</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Trip ID", "Farmer", "Route", "Crop", "Earned", "Rating", "Date"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {COMPLETED_TRIPS.map(t => (
                        <tr key={t.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                          <td className="px-4 py-3 text-xs">{t.farmer}</td>
                          <td className="px-4 py-3 text-xs">{t.route}</td>
                          <td className="px-4 py-3 text-xs">{t.crop}</td>
                          <td className="px-4 py-3 font-semibold text-primary text-xs">₹{t.earned.toLocaleString()}</td>
                          <td className="px-4 py-3"><StarRating rating={t.rating} /></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{t.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
