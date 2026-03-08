import { useState, useMemo, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AIRecommendationBox } from "@/components/shared/AIRecommendationBox";
import { WeatherWidget } from "@/components/shared/WeatherWidget";
import { HarvestReadinessScore } from "@/components/shared/HarvestReadinessScore";
import { SpoilageRiskMeter } from "@/components/shared/SpoilageRiskMeter";
import { StatCard } from "@/components/shared/StatCard";
import { AICopilot } from "@/components/shared/AICopilot";
import { StarRating } from "@/components/shared/StarRating";
import { RatingBadge } from "@/components/shared/RatingBadge";
import { RatingPromptDialog } from "@/components/shared/RatingPromptDialog";
import { AI_RECOMMENDATIONS, STORAGE_UNITS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useTransportBooking, AVAILABLE_VEHICLES, AvailableVehicle } from "@/context/TransportBookingContext";
import { useStorageBooking, StorageType } from "@/context/StorageBookingContext";
import { useRole, FarmerProfile } from "@/context/RoleContext";
import { useRating } from "@/context/RatingContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend } from "recharts";

const PRICE_HISTORY = [
  { day: "Sep 20", price: 22 }, { day: "Sep 25", price: 24 }, { day: "Oct 1", price: 26 },
  { day: "Oct 5", price: 25 }, { day: "Oct 10", price: 28 }, { day: "Oct 15", price: 32 },
];

// ── Market trends & AI prediction data ───────────────────────────────────────
const PRICE_TREND_12W = [
  { week: "W1 Aug", tomato: 18, onion: 14, chilli: 32, rice: 22 },
  { week: "W2 Aug", tomato: 20, onion: 15, chilli: 34, rice: 22 },
  { week: "W3 Aug", tomato: 19, onion: 16, chilli: 33, rice: 23 },
  { week: "W4 Aug", tomato: 21, onion: 17, chilli: 36, rice: 23 },
  { week: "W1 Sep", tomato: 23, onion: 18, chilli: 38, rice: 24 },
  { week: "W2 Sep", tomato: 25, onion: 19, chilli: 37, rice: 24 },
  { week: "W3 Sep", tomato: 26, onion: 21, chilli: 39, rice: 24 },
  { week: "W4 Sep", tomato: 28, onion: 22, chilli: 41, rice: 25 },
  { week: "W1 Oct", tomato: 30, onion: 24, chilli: 43, rice: 25 },
  { week: "W2 Oct", tomato: 29, onion: 25, chilli: 42, rice: 26 },
  { week: "W3 Oct", tomato: 32, onion: 26, chilli: 44, rice: 26 },
  { week: "W4 Oct", tomato: 35, onion: 27, chilli: 47, rice: 27 },
];

const BUYER_DEMAND = [
  { market: "Hyd Rythu Bazar", demand: 92, buyers: 28, avgQty: 12 },
  { market: "Secunderabad", demand: 84, buyers: 21, avgQty: 9 },
  { market: "Warangal Local", demand: 61, buyers: 14, avgQty: 7 },
  { market: "Karimnagar APMC", demand: 78, buyers: 18, avgQty: 10 },
  { market: "Nizamabad Hub", demand: 69, buyers: 16, avgQty: 8 },
];

const AI_PREDICTIONS = [
  { crop: "Tomato",   currentPrice: 32, predictedHigh: 42, predictedLow: 28, confidence: 87, bestWindow: "Oct 20–25", signal: "SELL NOW" },
  { crop: "Onion",    currentPrice: 27, predictedHigh: 35, predictedLow: 24, confidence: 81, bestWindow: "Nov 1–7",   signal: "HOLD" },
  { crop: "Chilli",   currentPrice: 44, predictedHigh: 52, predictedLow: 40, confidence: 76, bestWindow: "Oct 28–Nov 3", signal: "HOLD" },
  { crop: "Turmeric", currentPrice: 88, predictedHigh: 96, predictedLow: 82, confidence: 72, bestWindow: "Nov 5–12", signal: "HOLD" },
];

// ── Nearby farmers mock data ──────────────────────────────────────────────────
interface NearbyFarmer {
  id: string; name: string; village: string;
  lat: number; lng: number;
  crop: string; area: string;
  harvestDate: string; phone: string;
  rating: number; tradeGroup?: string;
}

const NEARBY_FARMERS: NearbyFarmer[] = [
  { id: "F1", name: "Prakash Rao",   village: "Hanamkonda", lat: 18.0031, lng: 79.5540, crop: "Tomato",   area: "4.2 ac", harvestDate: "Oct 18", phone: "98765 11223", rating: 4.5, tradeGroup: "Tomato Growers Cluster" },
  { id: "F2", name: "Anand Reddy",   village: "Kazipet",    lat: 17.9524, lng: 79.5100, crop: "Tomato",   area: "2.8 ac", harvestDate: "Oct 20", phone: "97654 22334", rating: 4.2, tradeGroup: "Tomato Growers Cluster" },
  { id: "F3", name: "Laxmi Devi",    village: "Narsampet",  lat: 17.9260, lng: 79.8960, crop: "Onion",    area: "3.5 ac", harvestDate: "Nov 5",  phone: "96543 33445", rating: 4.7 },
  { id: "F4", name: "Raju Nair",     village: "Parkal",     lat: 18.1980, lng: 79.7150, crop: "Chilli",   area: "5.0 ac", harvestDate: "Oct 28", phone: "95432 44556", rating: 4.3 },
  { id: "F5", name: "Meena Bai",     village: "Bhupalpally",lat: 18.4390, lng: 79.9780, crop: "Turmeric", area: "6.1 ac", harvestDate: "Dec 10", phone: "94321 55667", rating: 4.8 },
  { id: "F6", name: "Gopi Krishna",  village: "Mahabubabad",lat: 17.5990, lng: 80.0040, crop: "Rice",     area: "7.3 ac", harvestDate: "Nov 20", phone: "93210 66778", rating: 4.1 },
  { id: "F7", name: "Sunita Patel",  village: "Kodad",      lat: 17.7000, lng: 79.9500, crop: "Tomato",   area: "2.1 ac", harvestDate: "Oct 22", phone: "92109 77889", rating: 4.4, tradeGroup: "Tomato Growers Cluster" },
];

const CROP_COLORS_MAP: Record<string, string> = {
  Tomato: "#ef4444", Onion: "#a78bfa", Chilli: "#f97316",
  Turmeric: "#eab308", Rice: "#84cc16", Wheat: "#d97706",
};

const QUICK_ACTIONS = [
  { icon: "📋", label: "List Crop for Sale" },
  { icon: "🚚", label: "Find Transport" },
  { icon: "💰", label: "Apply for Loan" },
  { icon: "📸", label: "Upload Crop Image" },
  { icon: "🏪", label: "Book Storage" },
  { icon: "📜", label: "View Certificates" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:          { label: "⏳ Pending",          color: "bg-muted text-muted-foreground" },
  "counter-sent":   { label: "💬 Counter Received", color: "bg-accent/20 text-foreground border-accent/40" },
  accepted:         { label: "✅ Owner Accepted",    color: "bg-primary/10 text-primary border-primary/30" },
  rejected:         { label: "❌ Rejected",          color: "bg-destructive/10 text-destructive border-destructive/30" },
  "farmer-accepted":{ label: "🎉 CONFIRMED",         color: "bg-primary/10 text-primary border-primary/30" },
  "farmer-rejected":{ label: "✗ You Declined",       color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const STORAGE_STATUS_META: Record<string, { label: string; color: string }> = {
  pending:   { label: "⏳ Awaiting Approval",   color: "bg-muted text-muted-foreground" },
  approved:  { label: "✅ Approved",             color: "bg-primary/10 text-primary border-primary/30" },
  rejected:  { label: "❌ Rejected",             color: "bg-destructive/10 text-destructive border-destructive/30" },
  active:    { label: "🏪 Active",               color: "bg-primary/10 text-primary border-primary/30" },
  completed: { label: "🎉 Completed",            color: "bg-muted text-foreground" },
  cancelled: { label: "✗ Cancelled",            color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const CROPS_LIST = ["Tomato", "Onion", "Potato", "Chilli", "Turmeric", "Rice", "Wheat", "Millet", "Pulses", "Maize", "Soybean", "Other"];

interface TransportForm {
  product: string; customProduct: string; weightKg: string;
  pickupLocation: string; dropLocation: string;
  date: string; time: string; offeredPrice: string; notes: string; phone: string;
}

interface StorageForm {
  unitId: string;
  crop: string; customCrop: string; weightKg: string;
  checkInDate: string; checkOutDate: string;
  notes: string; phone: string;
}

const EMPTY_TRANSPORT: TransportForm = {
  product: "", customProduct: "", weightKg: "", pickupLocation: "",
  dropLocation: "", date: "", time: "", offeredPrice: "", notes: "", phone: "",
};

const EMPTY_STORAGE: StorageForm = {
  unitId: "", crop: "", customCrop: "", weightKg: "",
  checkInDate: "", checkOutDate: "", notes: "", phone: "",
};

// ── Helper: get the confirmed pickup time for a booking in a conflict ─────────
function b_pickupFor(
  conflict: import("@/context/TransportBookingContext").PickupConflict,
  myBookings: import("@/context/TransportBookingContext").TransportBooking[]
): string | undefined {
  const match = myBookings.find(b => conflict.bookingIds.includes(b.id));
  return match?.confirmedPickupTime ?? match?.time;
}

// ── Simulated tracker waypoints (GPS-style) ───────────────────────────────────
const TRACKER_STAGES = [
  { key: "depot",     label: "Vehicle at Depot",         icon: "🏠", desc: "Vehicle is being prepared at the origin depot." },
  { key: "enroute",   label: "En Route to Pickup",        icon: "🛣️", desc: "Driver is heading to your pickup location." },
  { key: "arrived",   label: "Arrived at Pickup",         icon: "📍", desc: "Vehicle has arrived. Please be ready to load." },
  { key: "loading",   label: "Loading in Progress",       icon: "📦", desc: "Your produce is being loaded onto the vehicle." },
  { key: "transit",   label: "In Transit to Market",      icon: "🚚", desc: "Vehicle is on its way to the destination market." },
  { key: "delivered", label: "Delivered at Destination",  icon: "✅", desc: "Produce delivered successfully." },
];

function VehicleTracker({
  booking,
  vehicle,
}: {
  booking: import("@/context/TransportBookingContext").TransportBooking;
  vehicle: import("@/context/TransportBookingContext").AvailableVehicle;
}) {
  // Simulate a realistic stage based on pickup date/time vs now
  const [stage, setStage] = useState<number>(1); // default: en-route

  // Cycle through stages for demo purposes
  const handleAdvance = () => setStage(s => Math.min(s + 1, TRACKER_STAGES.length - 1));
  const handleReset = () => setStage(0);

  const current = TRACKER_STAGES[stage];
  const isDelivered = stage === TRACKER_STAGES.length - 1;

  return (
    <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3 mt-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📡</span>
          <span className="text-xs font-semibold text-foreground">Live Vehicle Tracker</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
            isDelivered ? "bg-primary/10 text-primary border-primary/30" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
          }`}>
            {isDelivered ? "✅ Delivered" : "🟢 Live"}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">{vehicle.vehicleNo} · {vehicle.ownerName}</span>
      </div>

      {/* Stage progress bar */}
      <div className="flex items-center gap-0.5">
        {TRACKER_STAGES.map((s, i) => (
          <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-all duration-300 ${
              i < stage ? "bg-primary" : i === stage ? "bg-primary/60 animate-pulse" : "bg-muted"
            }`} />
            <span className={`text-[9px] hidden sm:block text-center ${i === stage ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              {s.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Current status */}
      <div className="flex items-start gap-3 bg-background border border-border rounded-lg p-3">
        <span className="text-2xl">{current.icon}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">{current.label}</div>
          <div className="text-xs text-muted-foreground">{current.desc}</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            📍 {booking.pickupLocation} → 🏪 {booking.dropLocation} · 📞 {vehicle.phone}
          </div>
        </div>
      </div>

      {/* Milestone list */}
      <div className="space-y-1">
        {TRACKER_STAGES.map((s, i) => (
          <div key={s.key} className={`flex items-center gap-2 text-xs transition-opacity ${i > stage ? "opacity-30" : ""}`}>
            <span className={`w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0 ${
              i < stage ? "bg-primary text-primary-foreground" :
              i === stage ? "bg-primary/20 text-primary border border-primary/40" :
              "bg-muted text-muted-foreground"
            }`}>
              {i < stage ? "✓" : i + 1}
            </span>
            <span className={i === stage ? "font-semibold text-foreground" : "text-muted-foreground"}>{s.label}</span>
            {i < stage && <span className="text-[10px] text-primary ml-auto">Done</span>}
            {i === stage && <span className="text-[10px] text-primary ml-auto animate-pulse">● Now</span>}
          </div>
        ))}
      </div>

      {/* Demo controls */}
      <div className="flex gap-2 pt-1 border-t border-border">
        <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 flex-1" onClick={handleReset} disabled={stage === 0}>
          ↩ Reset
        </Button>
        <Button size="sm" className="text-[10px] h-6 px-2 flex-1 bg-primary" onClick={handleAdvance} disabled={isDelivered}>
          Next Stage →
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">
        Demo: advance stages to simulate vehicle movement. In production, this updates via GPS.
      </p>
    </div>
  );
}


// ── VehicleCard: used in Find Transport tab ───────────────────────────────────
function VehicleCard({
  v,
  onBook,
  onBroadcast,
  selected,
  onToggleSelect,
}: {
  v: AvailableVehicle;
  onBook: (v: AvailableVehicle) => void;
  onBroadcast: (v: AvailableVehicle) => void;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const freeTon = v.capacityTon - v.currentLoadTon;
  const usedPct = Math.round((v.currentLoadTon / v.capacityTon) * 100);
  const loadColor = usedPct >= 80 ? "bg-destructive" : usedPct >= 50 ? "bg-yellow-500" : "bg-primary";
  const loadTextColor = usedPct >= 80 ? "text-destructive" : usedPct >= 50 ? "text-yellow-600" : "text-primary";

  return (
    <Card className={`border-2 transition-all duration-200 cursor-pointer ${selected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"}`}>
      <CardContent className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? "bg-primary border-primary" : "border-muted-foreground/40"}`}
              onClick={() => onToggleSelect(v.id)}
            >
              {selected && <span className="text-primary-foreground text-xs font-bold">✓</span>}
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">{v.ownerName}</div>
              <div className="text-[10px] text-muted-foreground">{v.vehicleNo} · {v.location}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {v.isRefrigerated && (
              <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/30">❄️ Refrigerated</Badge>
            )}
            <Badge variant="outline" className="text-[10px]">{v.vehicleType}</Badge>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Current Load</span>
            <span className={`font-semibold ${loadTextColor}`}>{usedPct}% full · {freeTon.toFixed(1)}T free</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-2 rounded-full ${loadColor}`} style={{ width: `${usedPct}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground">{v.currentLoadTon}T booked / {v.capacityTon}T total capacity</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="font-bold text-foreground">₹{v.pricePerKm}/km</div>
            <div className="text-[10px] text-muted-foreground">Per KM</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="font-bold text-foreground">₹{v.pricePerTon}/T</div>
            <div className="text-[10px] text-muted-foreground">Per Ton</div>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <div className="font-bold text-foreground">{v.onTimeRate}%</div>
            <div className="text-[10px] text-muted-foreground">On-Time</div>
          </div>
        </div>

        {/* Rating + trips */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-col gap-0.5">
            <RatingBadge targetId={v.id} showReviews={false} size="sm" />
            <span className="text-[10px] text-muted-foreground">{v.totalTrips} trips · {v.onTimeRate}% on-time</span>
          </div>
          <div className="text-[10px] text-muted-foreground">⛽ {v.fuelType}</div>
        </div>

        {/* Routes */}
        <div className="flex flex-wrap gap-1">
          {v.routes.map(r => (
            <span key={r} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">{r}</span>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-1">
          {v.features.map(f => (
            <span key={f} className="text-[10px] bg-primary/5 px-1.5 py-0.5 rounded-full text-primary border border-primary/20">{f}</span>
          ))}
        </div>

        {/* Availability */}
        <div className="text-[10px] text-muted-foreground">🕐 Available: {v.availableFrom} – {v.availableTo} · Min load: {v.minLoadKg}kg</div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1 bg-primary text-xs h-8" onClick={() => onBook(v)}>
            📝 Request This Vehicle
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8 border-border" onClick={() => onBroadcast(v)}>
            📡 Broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FarmerDashboard() {
  const { toast } = useToast();
  const { user } = useRole();
  const { bookings, pickupConflicts, addBooking, addBroadcastBookings, farmerAccept, farmerReject } = useTransportBooking();
  const { bookings: storageBookings, addBooking: addStorageBooking } = useStorageBooking();
  const { addPending, pending: ratingPending, removePending } = useRating();

  // Pending rating prompt — show one at a time
  const [activeRatingPrompt, setActiveRatingPrompt] = useState<string | null>(null);
  const currentRatingPending = ratingPending.find(p => p.bookingId === activeRatingPrompt);

  // Whenever a new pending rating appears, auto-show it
  useEffect(() => {
    if (ratingPending.length > 0 && !activeRatingPrompt) {
      setActiveRatingPrompt(ratingPending[0].bookingId);
    }
  }, [ratingPending, activeRatingPrompt]);

  const fp = (user?.profile ?? {}) as FarmerProfile;

  // Live profile data falling back to demo defaults
  const farmerName     = user?.name         ?? "Ramesh Kumar";
  const farmerLocation = user?.location     ?? "Warangal, Telangana";
  const primaryCrop    = fp.primaryCrop     ?? "Tomato";
  const secondaryCrop  = fp.secondaryCrop   ?? "";
  const farmArea       = fp.farmArea        ? `${fp.farmArea} acres` : "3.5 acres";
  const farmAreaNum    = parseFloat(fp.farmArea ?? "3.5");
  const expectedYield  = (farmAreaNum * 2.5).toFixed(2) + " T";
  const harvestSeason  = fp.harvestSeason   ?? "Kharif";
  const farmingType    = fp.farmingType     ?? "Conventional";
  const soilType       = fp.soilType        ?? "Black Cotton";
  const irrigationType = fp.irrigationType  ?? "Drip";
  const annualYield    = fp.annualYield     ? `${fp.annualYield} T/yr` : "8–10 T/yr";

  const [showTransportDialog, setShowTransportDialog] = useState(false);
  const [showStorageDialog, setShowStorageDialog] = useState(false);
  const [transportForm, setTransportForm] = useState<TransportForm>(EMPTY_TRANSPORT);
  const [storageForm, setStorageForm] = useState<StorageForm>(EMPTY_STORAGE);
  const [activeTab, setActiveTab] = useState("overview");
  const [smsCmd, setSmsCmd] = useState("");

  // ── Crop Photos state ───────────────────────────────────────────────────────
  interface CropPhoto { id: string; url: string; label: string; date: string; note: string; }
  const [cropPhotos, setCropPhotos] = useState<CropPhoto[]>([
    { id: "p1", url: "https://images.unsplash.com/photo-1592921870789-04563d55041c?w=400&q=80", label: "Tomato Field", date: "Oct 10", note: "Stage: Fruit Development" },
    { id: "p2", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80", label: "Ripening Stage", date: "Oct 12", note: "Ready in ~7 days" },
  ]);
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Nearby farmers state ────────────────────────────────────────────────────
  const [selectedFarmer, setSelectedFarmer] = useState<NearbyFarmer | null>(null);
  const [tradeGroupJoined, setTradeGroupJoined] = useState<string[]>([]);
  const [cropFilter, setCropFilter] = useState<string>("All");

  // ── Find Transport state ────────────────────────────────────────────────────
  const [vehicleBookingMode, setVehicleBookingMode] = useState<null | "targeted" | "broadcast">(null);
  const [targetVehicle, setTargetVehicle] = useState<AvailableVehicle | null>(null);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [vehicleFilter, setVehicleFilter] = useState<"all" | "refrigerated" | "available">("all");
  const [vehicleForm, setVehicleForm] = useState<TransportForm>({
    ...EMPTY_TRANSPORT,
    product: primaryCrop,
    pickupLocation: farmerLocation.split(",")[0].trim(),
  });

  const [farmData] = useState({
    name: farmerName, village: farmerLocation.split(",")[0].trim(),
    crop: primaryCrop, variety: "Hybrid F1",
    area: fp.farmArea ?? "3.5", sowingDate: "2024-07-15", harvestDate: "2024-10-15",
  });

  const myTransportBookings = bookings.filter(b => b.farmerName === farmerName);
  const myStorageBookings = storageBookings.filter(b => b.farmerName === farmerName);

  // ── Notification counts ─────────────────────────────────────────────────────
  const pendingCounter = myTransportBookings.filter(b => b.status === "counter-sent").length;
  const pendingAccepted = myTransportBookings.filter(b => b.status === "accepted").length;
  const transportAlerts = pendingCounter + pendingAccepted;
  const pendingStorage = myStorageBookings.filter(b => b.status === "pending").length;

  const setTF = (key: keyof TransportForm, val: string) =>
    setTransportForm(p => ({ ...p, [key]: val }));
  const setSF = (key: keyof StorageForm, val: string) =>
    setStorageForm(p => ({ ...p, [key]: val }));
  const setVF = (key: keyof TransportForm, val: string) =>
    setVehicleForm(p => ({ ...p, [key]: val }));

  // ── Derived storage form calculations ──────────────────────────────────────
  const selectedUnit = STORAGE_UNITS.find(u => String(u.id) === storageForm.unitId);
  const storageDurationDays = storageForm.checkInDate && storageForm.checkOutDate
    ? Math.max(1, Math.round((new Date(storageForm.checkOutDate).getTime() - new Date(storageForm.checkInDate).getTime()) / 86400000))
    : 0;
  const durationMonths = storageDurationDays / 30;
  const estimatedStorageCost = selectedUnit && storageForm.weightKg
    ? Math.round(Number(storageForm.weightKg) * selectedUnit.price * durationMonths)
    : 0;

  // ── Filtered vehicles ───────────────────────────────────────────────────────
  const filteredVehicles = useMemo(() => {
    return AVAILABLE_VEHICLES.filter(v => {
      if (vehicleFilter === "refrigerated") return v.isRefrigerated;
      if (vehicleFilter === "available") return (v.capacityTon - v.currentLoadTon) > 0.5;
      return true;
    });
  }, [vehicleFilter]);

  // ── Crop photo upload handler ───────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      const now = new Date();
      setCropPhotos(prev => [{
        id: `p${Date.now()}`, url,
        label: photoCaption || `${primaryCrop} Photo`,
        date: now.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        note: photoNote || "Just uploaded",
      }, ...prev]);
      setPhotoCaption(""); setPhotoNote("");
      toast({ title: "📸 Crop photo uploaded!", description: "Photo added to your gallery." });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSMS = () => {
    if (!smsCmd.trim()) return;
    toast({ title: "SMS Command Processed ✅", description: `Data updated from: "${smsCmd}"` });
    setSmsCmd("");

  };

  const handleAction = (label: string) => {
    if (label === "Find Transport") { setActiveTab("findtransport"); return; }
    if (label === "Book Storage") { setShowStorageDialog(true); return; }
    toast({ title: label, description: "Feature initiated successfully" });
  };

  const handleToggleVehicleSelect = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleOpenTargeted = (v: AvailableVehicle) => {
    setTargetVehicle(v);
    setVehicleForm({ ...EMPTY_TRANSPORT, product: primaryCrop, pickupLocation: farmData.village, phone: user?.phone ?? "" });
    setVehicleBookingMode("targeted");
  };

  const handleOpenBroadcast = (v?: AvailableVehicle) => {
    // If triggered from a specific vehicle card, pre-select it
    if (v && !selectedVehicleIds.includes(v.id)) {
      setSelectedVehicleIds(prev => [...prev, v.id]);
    }
    setVehicleForm({ ...EMPTY_TRANSPORT, product: primaryCrop, pickupLocation: farmData.village, phone: user?.phone ?? "" });
    setVehicleBookingMode("broadcast");
  };

  const validateVehicleForm = (form: TransportForm) => {
    const product = form.product === "Other" ? form.customProduct : form.product;
    if (!product || !form.weightKg || !form.pickupLocation || !form.dropLocation || !form.date || !form.time || !form.offeredPrice || !form.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmitTargetedVehicle = () => {
    if (!targetVehicle || !validateVehicleForm(vehicleForm)) return;
    const product = vehicleForm.product === "Other" ? vehicleForm.customProduct : vehicleForm.product;
    addBooking({
      farmerName, farmerPhone: vehicleForm.phone,
      product, weightKg: Number(vehicleForm.weightKg),
      pickupLocation: vehicleForm.pickupLocation, dropLocation: vehicleForm.dropLocation,
      date: vehicleForm.date, time: vehicleForm.time,
      offeredPrice: Number(vehicleForm.offeredPrice), notes: vehicleForm.notes,
      targetVehicleId: targetVehicle.id,
    });
    toast({
      title: `🚚 Request Sent to ${targetVehicle.ownerName}!`,
      description: `Booking request submitted. You'll be notified when they respond.`,
    });
    setVehicleBookingMode(null);
    setTargetVehicle(null);
    setActiveTab("transport");
  };

  const handleSubmitBroadcast = () => {
    if (!validateVehicleForm(vehicleForm)) return;
    const ids = selectedVehicleIds.length > 0 ? selectedVehicleIds : AVAILABLE_VEHICLES.map(v => v.id);
    const product = vehicleForm.product === "Other" ? vehicleForm.customProduct : vehicleForm.product;
    addBroadcastBookings(
      {
        farmerName, farmerPhone: vehicleForm.phone,
        product, weightKg: Number(vehicleForm.weightKg),
        pickupLocation: vehicleForm.pickupLocation, dropLocation: vehicleForm.dropLocation,
        date: vehicleForm.date, time: vehicleForm.time,
        offeredPrice: Number(vehicleForm.offeredPrice), notes: vehicleForm.notes,
      },
      ids
    );
    toast({
      title: `📡 Broadcast Sent to ${ids.length} Vehicle${ids.length > 1 ? "s" : ""}!`,
      description: "You'll be notified as each owner responds. First to accept wins the trip.",
    });
    setVehicleBookingMode(null);
    setSelectedVehicleIds([]);
    setActiveTab("transport");
  };

  const handleSubmitTransport = () => {
    const product = transportForm.product === "Other" ? transportForm.customProduct : transportForm.product;
    if (!product || !transportForm.weightKg || !transportForm.pickupLocation || !transportForm.dropLocation || !transportForm.date || !transportForm.time || !transportForm.offeredPrice || !transportForm.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    addBooking({
      farmerName: farmData.name, farmerPhone: transportForm.phone,
      product, weightKg: Number(transportForm.weightKg),
      pickupLocation: transportForm.pickupLocation, dropLocation: transportForm.dropLocation,
      date: transportForm.date, time: transportForm.time,
      offeredPrice: Number(transportForm.offeredPrice), notes: transportForm.notes,
    });
    toast({ title: "🚚 Transport Booking Submitted!", description: "Transport owners will respond shortly." });
    setTransportForm(EMPTY_TRANSPORT);
    setShowTransportDialog(false);
    setActiveTab("transport");
  };

  const handleSubmitStorage = () => {
    const crop = storageForm.crop === "Other" ? storageForm.customCrop : storageForm.crop;
    if (!storageForm.unitId || !crop || !storageForm.weightKg || !storageForm.checkInDate || !storageForm.checkOutDate || !storageForm.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (!selectedUnit) return;
    const availableKg = selectedUnit.capacity - selectedUnit.used;
    if (Number(storageForm.weightKg) > availableKg) {
      toast({ title: `Only ${availableKg.toLocaleString()} kg available in this unit`, variant: "destructive" });
      return;
    }
    addStorageBooking({
      unitId: selectedUnit.id,
      unitName: selectedUnit.name,
      unitLocation: selectedUnit.location,
      storageType: selectedUnit.type as StorageType,
      unitTemp: selectedUnit.temp,
      pricePerKgPerMonth: selectedUnit.price,
      farmerName: farmData.name,
      farmerPhone: storageForm.phone,
      crop,
      weightKg: Number(storageForm.weightKg),
      checkInDate: storageForm.checkInDate,
      checkOutDate: storageForm.checkOutDate,
      durationDays: storageDurationDays,
      notes: storageForm.notes,
      estimatedCost: estimatedStorageCost,
    });
    toast({ title: "🏪 Storage Booking Submitted!", description: `${selectedUnit.name} — manager will approve shortly.` });
    setStorageForm(EMPTY_STORAGE);
    setShowStorageDialog(false);
    setActiveTab("storage");
  };

  return (
    <AppLayout title="Farmer Dashboard" subtitle={`${farmerName} · ${farmerLocation} · ${primaryCrop} Farm`}>
      <div className="space-y-6 animate-fade-in">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Expected Yield" value={expectedYield} subtext={`${farmArea} × 2.5T/acre`} icon="🌾" trend="up" trendValue="+12% vs last season" highlight />
          <StatCard title="Market Price" value="₹28/kg" subtext={`${primaryCrop} · Predicted ₹35/kg in 2 weeks`} icon="📈" trend="up" trendValue="+25% forecast" />
          <StatCard title="Demand Forecast" value="HIGH" subtext="Hyderabad, Bangalore markets" icon="🔥" trend="up" trendValue="Festival season demand" />
          <StatCard title="Days to Harvest" value="7 days" subtext="Oct 15, 2024" icon="📅" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Profile Summary Card ── */}
          {user?.profile && (
            <div className="lg:col-span-3">
              <Card className="border-primary/20 bg-primary/3">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl">👨‍🌾</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground">{farmerName}</div>
                      <div className="text-xs text-muted-foreground">{farmerLocation}</div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1 text-xs flex-1">
                      {[
                        { l: "🌱 Primary Crop", v: primaryCrop },
                        { l: "🌿 Secondary", v: secondaryCrop || "—" },
                        { l: "📐 Farm Area", v: farmArea },
                        { l: "🌾 Season", v: harvestSeason },
                        { l: "🔬 Farming", v: farmingType },
                        { l: "🏗️ Soil", v: soilType },
                        { l: "💧 Irrigation", v: irrigationType },
                        { l: "📦 Annual Yield", v: annualYield },
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
            </div>
          )}
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted flex-wrap h-auto gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="findtransport">🔍 Find Transport</TabsTrigger>
                <TabsTrigger value="transport" className="relative">
                  🚚 My Bookings
                  {transportAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center animate-pulse">
                      {transportAlerts}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="storage" className="relative">
                  🏪 Storage
                  {pendingStorage > 0 && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center animate-pulse">
                      {pendingStorage}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="photos">📸 Crop Photos</TabsTrigger>
                <TabsTrigger value="trends">📊 Market Trends</TabsTrigger>
                <TabsTrigger value="nearby">🗺️ Nearby Farmers</TabsTrigger>
                <TabsTrigger value="register">Farm Details</TabsTrigger>
                <TabsTrigger value="market">Market Intel</TabsTrigger>
              </TabsList>

              {/* ── Overview ── */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Crop Growth Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { stage: "Germination", pct: 100, done: true },
                      { stage: "Vegetative Growth", pct: 100, done: true },
                      { stage: "Flowering", pct: 100, done: true },
                      { stage: "Fruit Development", pct: 85, done: false },
                      { stage: "Maturity", pct: 65, done: false },
                    ].map((s) => (
                      <div key={s.stage}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className={s.done ? "text-primary font-medium" : "text-muted-foreground"}>{s.done ? "✅" : "⏳"} {s.stage}</span>
                          <span className="font-medium">{s.pct}%</span>
                        </div>
                        <Progress value={s.pct} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tomato Price Trend (₹/kg)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={PRICE_HISTORY}>
                        <defs>
                          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[18, 36]} unit="₹" />
                        <Tooltip formatter={(v) => [`₹${v}/kg`, "Price"]} />
                        <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="url(#priceGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Quick Actions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_ACTIONS.map((a) => (
                        <Button key={a.label} variant="outline" size="sm"
                          className="h-auto py-3 flex-col gap-1 text-xs border-border hover:border-primary hover:bg-primary/5"
                          onClick={() => handleAction(a.label)}>
                          <span className="text-xl">{a.icon}</span>
                          <span className="text-center leading-tight">{a.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-dashed border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <CardTitle className="text-sm font-medium">SMS Data Entry</CardTitle>
                      <Badge variant="outline" className="text-xs ml-auto bg-primary/5 text-primary border-primary/30">Low Connectivity Mode</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">Type SMS command to update dashboard:</p>
                    <div className="flex gap-2">
                      <Input value={smsCmd} onChange={(e) => setSmsCmd(e.target.value)}
                        placeholder='e.g. CROP TOMATO 2ACRE HARVEST OCT10'
                        className="text-xs font-mono" onKeyDown={(e) => e.key === "Enter" && handleSMS()} />
                      <Button size="sm" onClick={handleSMS} className="bg-primary">Send</Button>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {["CROP TOMATO 3ACRE", "HARVEST OCT15", "PRICE 28 KG"].map((ex) => (
                        <button key={ex} onClick={() => setSmsCmd(ex)}
                          className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground hover:bg-primary/10 transition-colors">{ex}</button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════════════════════════
                  TAB: FIND TRANSPORT
              ══════════════════════════════════════════════════════════ */}
              <TabsContent value="findtransport" className="mt-4 space-y-4">

                {/* Header + controls */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">Available Transport Vehicles</h3>
                    <p className="text-xs text-muted-foreground">Browse vehicles, check capacity &amp; ratings, then book or broadcast</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["all", "refrigerated", "available"] as const).map(f => (
                      <Button key={f} size="sm" variant={vehicleFilter === f ? "default" : "outline"}
                        className={`text-xs h-7 capitalize ${vehicleFilter === f ? "bg-primary" : ""}`}
                        onClick={() => setVehicleFilter(f)}>
                        {f === "all" ? "All" : f === "refrigerated" ? "❄️ Refrigerated" : "✅ Has Space"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Broadcast-all banner when vehicles are selected */}
                {selectedVehicleIds.length > 0 && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm font-medium text-foreground">
                        📡 <span className="text-primary font-bold">{selectedVehicleIds.length}</span> vehicle{selectedVehicleIds.length > 1 ? "s" : ""} selected for broadcast
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-7 border-destructive/50 text-destructive"
                          onClick={() => setSelectedVehicleIds([])}>Clear</Button>
                        <Button size="sm" className="bg-primary text-xs h-7"
                          onClick={() => handleOpenBroadcast()}>
                          📡 Send Broadcast Request
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Broadcast to ALL button */}
                <Card className="border-dashed border-primary/30">
                  <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <div className="font-semibold text-sm text-foreground">📡 Broadcast to All Vehicles</div>
                      <div className="text-xs text-muted-foreground">Enter your details once — request sent to all {AVAILABLE_VEHICLES.length} available vehicles simultaneously</div>
                    </div>
                    <Button size="sm" className="bg-primary text-xs h-8"
                      onClick={() => { setSelectedVehicleIds(AVAILABLE_VEHICLES.map(v => v.id)); handleOpenBroadcast(); }}>
                      🚀 Broadcast to All ({AVAILABLE_VEHICLES.length})
                    </Button>
                  </CardContent>
                </Card>

                {/* Vehicle grid */}
                <div className="grid grid-cols-1 gap-4">
                  {filteredVehicles.map(v => (
                    <VehicleCard
                      key={v.id}
                      v={v}
                      onBook={handleOpenTargeted}
                      onBroadcast={handleOpenBroadcast}
                      selected={selectedVehicleIds.includes(v.id)}
                      onToggleSelect={handleToggleVehicleSelect}
                    />
                  ))}
                </div>
              </TabsContent>

              {/* ── Transport Bookings ── */}
              <TabsContent value="transport" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">My Transport Bookings</h3>
                  <Button size="sm" className="bg-primary text-xs h-8" onClick={() => setActiveTab("findtransport")}>
                    + Find &amp; Book Vehicle
                  </Button>
                </div>

                {/* ── Pickup Conflict Alerts ── */}
                {pickupConflicts
                  .filter(conflict =>
                    conflict.farmerNames.includes(farmerName) &&
                    conflict.bookingIds.some(id => myTransportBookings.find(b => b.id === id))
                  )
                  .map(conflict => {
                    const vehicle = AVAILABLE_VEHICLES.find(v => v.id === conflict.vehicleId);
                    const otherFarmers = conflict.farmerNames.filter(n => n !== farmerName);
                    return (
                      <Card key={`conflict-${conflict.vehicleId}-${conflict.date}-${conflict.time}`}
                        className="border-2 border-accent/60 bg-accent/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div className="flex-1 space-y-1">
                              <div className="font-semibold text-sm text-foreground">
                                Shared Pickup Schedule Notice
                              </div>
                              <p className="text-xs text-muted-foreground">
                                <span className="font-medium text-foreground">{vehicle?.ownerName ?? "The transport owner"}</span>
                                {" "}({vehicle?.vehicleNo}) has scheduled your pickup along with{" "}
                                <span className="font-medium text-foreground">{otherFarmers.join(", ")}</span>
                                {" "}on the same trip.
                              </p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                  📅 {conflict.date}
                                </span>
                                <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-foreground rounded-full px-3 py-1 text-xs font-semibold">
                                  🕐 Pickup at {conflict.time}
                                </span>
                                {vehicle && (
                                  <span className="inline-flex items-center gap-1.5 bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                                    🚛 {vehicle.vehicleType}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Please be ready at <span className="font-semibold text-foreground">{b_pickupFor(conflict, myTransportBookings) ?? conflict.time}</span>{" "}
                                — the vehicle will service multiple pickups on this route. Contact{" "}
                                {vehicle ? <span className="font-medium text-foreground">{vehicle.ownerName} ({vehicle.phone})</span> : "the owner"} for any queries.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                }

                {myTransportBookings.length === 0 && (
                  <Card className="border-dashed border-border">
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                      <div className="text-4xl mb-3">🚚</div>
                      <p>No transport bookings yet.</p>
                      <Button size="sm" className="mt-4 bg-primary" onClick={() => setActiveTab("findtransport")}>
                        Find a Vehicle
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {myTransportBookings.map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META["pending"];
                  const isCounter = b.status === "counter-sent";
                  const isAccepted = b.status === "accepted";
                  const isConfirmed = b.status === "farmer-accepted";
                  const vehicleInfo = b.targetVehicleId
                    ? AVAILABLE_VEHICLES.find(v => v.id === b.targetVehicleId)
                    : null;
                  const confirmedTime = b.confirmedPickupTime ?? b.time;
                  // Is this booking part of a conflict?
                  const conflict = pickupConflicts.find(c => c.bookingIds.includes(b.id));

                  return (
                    <Card key={b.id} className={`border-2 transition-all ${
                      isConfirmed ? "border-primary bg-primary/5 shadow-md"
                      : isCounter ? "border-accent/50 bg-accent/5"
                      : isAccepted ? "border-primary/40 bg-primary/5"
                      : b.status === "rejected" || b.status === "farmer-rejected" ? "border-destructive/30 opacity-70"
                      : "border-border"
                    }`}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                            <Badge variant="outline" className={`text-xs font-semibold ${meta.color}`}>{meta.label}</Badge>
                            {vehicleInfo && (
                              <Badge variant="outline" className="text-xs border-secondary/40 text-secondary">
                                🚛 {vehicleInfo.ownerName}
                              </Badge>
                            )}
                            {!b.targetVehicleId && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">📡 Broadcast</Badge>
                            )}
                            {conflict && (
                              <Badge className="text-[10px] bg-accent/20 text-foreground border border-accent/40">
                                ⚠️ Shared Trip
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{b.date} · {confirmedTime}</span>
                        </div>

                        {isConfirmed && (
                          <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-xs text-primary font-semibold text-center">
                            🎉 TRIP CONFIRMED — Both you and the transport owner have agreed!
                          </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                          <div><span className="text-muted-foreground">Product</span><br /><span className="font-medium">{b.product}</span></div>
                          <div><span className="text-muted-foreground">Load</span><br /><span className="font-medium">{b.weightKg >= 1000 ? `${b.weightKg / 1000}T` : `${b.weightKg}kg`}</span></div>
                          <div><span className="text-muted-foreground">From</span><br /><span className="font-medium">{b.pickupLocation}</span></div>
                          <div><span className="text-muted-foreground">To</span><br /><span className="font-medium">{b.dropLocation}</span></div>
                          <div><span className="text-muted-foreground">Your Offer</span><br /><span className="font-semibold text-primary">₹{b.offeredPrice}</span></div>
                          {b.counterPrice && (
                            <div><span className="text-muted-foreground">Counter Price</span><br /><span className="font-semibold">₹{b.counterPrice}</span></div>
                          )}
                          {vehicleInfo && (
                            <div><span className="text-muted-foreground">Vehicle</span><br /><span className="font-medium">{vehicleInfo.vehicleNo}</span></div>
                          )}
                          {vehicleInfo && (
                            <div><span className="text-muted-foreground">Capacity</span><br /><span className="font-medium">{vehicleInfo.capacityTon}T</span></div>
                          )}
                        </div>

                        {vehicleInfo && !isConfirmed && b.status !== "rejected" && b.status !== "farmer-rejected" && (
                          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                            <StarRating rating={vehicleInfo.rating} size="sm" showValue />
                            <span>·</span>
                            <span>{vehicleInfo.totalTrips} trips</span>
                            <span>·</span>
                            <span>{vehicleInfo.onTimeRate}% on-time</span>
                            <span>·</span>
                            <span>📞 {vehicleInfo.phone}</span>
                          </div>
                        )}

                        {/* ── Live Vehicle Tracker (confirmed bookings only) ── */}
                        {isConfirmed && vehicleInfo && (
                          <VehicleTracker booking={b} vehicle={vehicleInfo} />
                        )}

                        {isCounter && b.counterNote && (
                          <div className="bg-accent/10 rounded-lg px-3 py-2 text-xs text-foreground border border-accent/30">
                            💬 Transport owner's note: <span className="font-medium">{b.counterNote}</span>
                          </div>
                        )}
                        {isCounter && (
                          <div className="pt-2 border-t border-border flex gap-2 flex-wrap items-center">
                            <p className="text-xs text-muted-foreground flex-1">
                              Owner wants <span className="font-semibold text-foreground">₹{b.counterPrice}</span> (you offered ₹{b.offeredPrice})
                            </p>
                            <Button size="sm" className="bg-primary text-xs h-8"
                              onClick={() => {
                                farmerAccept(b.id);
                                toast({ title: "✅ Counter accepted! Trip Confirmed 🎉", description: `Confirmed at ₹${b.counterPrice}` });
                              }}>
                              ✅ Accept ₹{b.counterPrice}
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive"
                              onClick={() => { farmerReject(b.id); toast({ title: "❌ Counter declined", variant: "destructive" }); }}>
                              ✗ Decline
                            </Button>
                          </div>
                        )}
                        {isAccepted && !isConfirmed && (
                          <div className="pt-2 border-t border-border flex gap-2 flex-wrap items-center">
                            <p className="text-xs text-muted-foreground flex-1">
                              Owner accepted at your price <span className="font-semibold text-foreground">₹{b.offeredPrice}</span> — confirm to finalise?
                            </p>
                            <Button size="sm" className="bg-primary text-xs h-8"
                              onClick={() => {
                                farmerAccept(b.id);
                                toast({ title: "🎉 Trip Confirmed!", description: "Both parties agreed — trip is confirmed!" });
                              }}>
                              ✅ Confirm Trip
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive"
                              onClick={() => { farmerReject(b.id); toast({ title: "Trip cancelled", variant: "destructive" }); }}>
                              Cancel
                            </Button>
                          </div>
                        )}
                        {isConfirmed && vehicleInfo && (
                          <div className="space-y-2 pt-1 border-t border-primary/20">
                            <div className="text-xs text-primary font-medium">
                              ✅ Final price: ₹{b.counterPrice || b.offeredPrice} · {vehicleInfo.ownerName} will contact you at {b.farmerPhone}
                            </div>
                            <div className="bg-muted/40 rounded-lg px-3 py-2">
                              <p className="text-[10px] text-muted-foreground mb-1 font-medium">Farmer Reviews for {vehicleInfo.ownerName}</p>
                              <RatingBadge targetId={vehicleInfo.id} showReviews />
                            </div>
                            <Button size="sm" variant="outline" className="text-xs h-8 border-primary/40 text-primary w-full"
                              onClick={() => {
                                addPending({
                                  bookingId: b.id,
                                  targetId: vehicleInfo.id,
                                  targetType: "transport",
                                  targetName: vehicleInfo.ownerName,
                                  farmerName: b.farmerName,
                                  product: b.product,
                                });
                                setActiveRatingPrompt(b.id);
                              }}>
                              ⭐ Rate this Trip
                            </Button>
                          </div>
                        )}
                        {isConfirmed && !vehicleInfo && (
                          <div className="text-xs text-primary font-medium pt-1 border-t border-primary/20">
                            ✅ Final price: ₹{b.counterPrice || b.offeredPrice} · Transport owner will contact you soon
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>


              {/* ── Storage Bookings ── */}
              <TabsContent value="storage" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">My Storage Bookings</h3>
                  <Button size="sm" className="bg-primary text-xs h-8" onClick={() => setShowStorageDialog(true)}>
                    + Book Storage
                  </Button>
                </div>

                {myStorageBookings.length === 0 ? (
                  <Card className="border-dashed border-border">
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                      <div className="text-4xl mb-3">🏪</div>
                      <p>No storage bookings yet.</p>
                      <Button size="sm" className="mt-4 bg-primary" onClick={() => setShowStorageDialog(true)}>
                        Book Storage Now
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  myStorageBookings.map((b) => {
                    const meta = STORAGE_STATUS_META[b.status] || STORAGE_STATUS_META["pending"];
                    const typeIcon = b.storageType === "Cold Storage" ? "❄️" : b.storageType === "Silo" ? "🛢️" : "🏭";

                    return (
                      <Card key={b.id} className={`border-2 transition-all ${
                        b.status === "approved" || b.status === "active" ? "border-primary/40 bg-primary/5"
                        : b.status === "rejected" || b.status === "cancelled" ? "border-destructive/30 opacity-70"
                        : b.status === "completed" ? "border-border opacity-80"
                        : "border-border"
                      }`}>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                              <Badge variant="outline" className={`text-xs ${meta.color}`}>{meta.label}</Badge>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {typeIcon} {b.storageType}
                            </Badge>
                          </div>

                          <div className="font-semibold text-sm text-foreground">{b.unitName}</div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                            <div><span className="text-muted-foreground">Crop</span><br /><span className="font-medium">{b.crop}</span></div>
                            <div><span className="text-muted-foreground">Quantity</span><br /><span className="font-medium">{b.weightKg >= 1000 ? `${(b.weightKg / 1000).toFixed(1)}T` : `${b.weightKg}kg`}</span></div>
                            <div><span className="text-muted-foreground">Check-in</span><br /><span className="font-medium">{b.checkInDate}</span></div>
                            <div><span className="text-muted-foreground">Check-out</span><br /><span className="font-medium">{b.checkOutDate}</span></div>
                            <div><span className="text-muted-foreground">Duration</span><br /><span className="font-medium">{b.durationDays} days</span></div>
                            <div><span className="text-muted-foreground">Temp</span><br /><span className="font-medium">🌡️ {b.unitTemp}</span></div>
                            <div><span className="text-muted-foreground">Est. Cost</span><br /><span className="font-semibold text-primary">₹{b.estimatedCost.toLocaleString()}</span></div>
                            <div><span className="text-muted-foreground">Rate</span><br /><span className="font-medium">₹{b.pricePerKgPerMonth}/kg/mo</span></div>
                          </div>

                          {b.managerNote && (
                            <div className={`rounded-lg px-3 py-2 text-xs border ${b.status === "rejected" ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-primary/5 border-primary/20 text-foreground"}`}>
                              💬 Manager note: <span className="font-medium">{b.managerNote}</span>
                            </div>
                          )}

                          {b.status === "approved" && (
                            <div className="text-xs text-primary font-medium pt-1 border-t border-primary/20">
                              ✅ Booking approved! Bring your produce to {b.unitName} on {b.checkInDate}.
                            </div>
                          )}
                          {(b.status === "completed" || b.status === "active") && (
                            <div className="space-y-2 pt-1 border-t border-border">
                              <div className="bg-muted/40 rounded-lg px-3 py-2">
                                <p className="text-[10px] text-muted-foreground mb-1 font-medium">Farmer Reviews for {b.unitName}</p>
                                <RatingBadge targetId={String(b.unitId)} showReviews />
                              </div>
                              {b.status === "completed" && (
                                <Button size="sm" variant="outline" className="text-xs h-8 border-primary/40 text-primary w-full"
                                  onClick={() => {
                                    addPending({
                                      bookingId: b.id,
                                      targetId: String(b.unitId),
                                      targetType: "storage",
                                      targetName: b.unitName,
                                      farmerName: b.farmerName,
                                      product: b.crop,
                                    });
                                    setActiveRatingPrompt(b.id);
                                  }}>
                                  ⭐ Rate this Storage
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              {/* ── Farm Details ── */}
              <TabsContent value="register" className="mt-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Farm Registration Details</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Farmer Name", key: "name" },
                      { label: "Village / Location", key: "village" },
                      { label: "Crop Type", key: "crop" },
                      { label: "Crop Variety", key: "variety" },
                      { label: "Farm Area (acres)", key: "area" },
                      { label: "Sowing Date", key: "sowingDate" },
                      { label: "Expected Harvest Date", key: "harvestDate" },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1">
                        <Label className="text-xs">{f.label}</Label>
                        <Input value={(farmData as any)[f.key]} onChange={(_e) => toast({ title: "Update your profile to change farm details" })} className="text-sm" />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <Button className="w-full bg-primary" onClick={() => toast({ title: "Farm details saved ✅" })}>Save Farm Details</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── Market Intel ── */}
              <TabsContent value="market" className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { market: "Hyderabad Rythu Bazar", price: "₹35/kg", demand: "Very High", dist: "142 km" },
                    { market: "Secunderabad Market", price: "₹33/kg", demand: "High", dist: "145 km" },
                    { market: "Warangal Local", price: "₹26/kg", demand: "Medium", dist: "12 km" },
                  ].map((m) => (
                    <Card key={m.market} className="border-border">
                      <CardContent className="p-4">
                        <div className="font-medium text-sm">{m.market}</div>
                        <div className="text-xl font-bold text-primary mt-1">{m.price}</div>
                        <div className="flex justify-between mt-2">
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">{m.demand}</Badge>
                          <span className="text-xs text-muted-foreground">{m.dist}</span>
                        </div>
                        <Button size="sm" className="w-full mt-3 bg-primary text-xs h-7" onClick={() => toast({ title: `Listed in ${m.market}` })}>
                          List Here
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* ══════════════════════════════════════════════════════════
                  TAB: CROP PHOTOS
              ══════════════════════════════════════════════════════════ */}
              <TabsContent value="photos" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Crop Photo Gallery</h3>
                    <p className="text-xs text-muted-foreground">Upload field photos for AI analysis &amp; buyer visibility</p>
                  </div>
                  <Button size="sm" className="bg-primary text-xs h-8" onClick={() => photoInputRef.current?.click()}>
                    📸 Add Photo
                  </Button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>

                {/* Upload form */}
                <Card className="border-dashed border-primary/40 bg-primary/3">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-xs font-medium text-foreground">Add a new crop photo</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Caption</Label>
                        <Input className="h-8 text-xs" placeholder="e.g. Week 8 growth" value={photoCaption} onChange={e => setPhotoCaption(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Note</Label>
                        <Input className="h-8 text-xs" placeholder="e.g. Pest spotted" value={photoNote} onChange={e => setPhotoNote(e.target.value)} />
                      </div>
                    </div>
                    <Button size="sm" className="w-full bg-primary text-xs h-8" onClick={() => photoInputRef.current?.click()}>
                      📁 Choose Photo from Device
                    </Button>
                  </CardContent>
                </Card>

                {/* Gallery grid */}
                <div className="grid grid-cols-2 gap-3">
                  {cropPhotos.map(p => (
                    <Card key={p.id} className="overflow-hidden border-border group">
                      <div className="relative">
                        <img src={p.url} alt={p.label} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute top-1 right-1">
                          <button
                            className="bg-destructive/80 text-destructive-foreground rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setCropPhotos(prev => prev.filter(x => x.id !== p.id))}
                          >✕</button>
                        </div>
                      </div>
                      <CardContent className="p-2 space-y-0.5">
                        <div className="text-xs font-medium text-foreground truncate">{p.label}</div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{p.date}</span>
                          <span className="truncate ml-1">{p.note}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {cropPhotos.length === 0 && (
                    <div className="col-span-2 text-center text-muted-foreground text-sm py-12">
                      <div className="text-4xl mb-2">📷</div>
                      <p>No crop photos yet. Upload your first photo!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ══════════════════════════════════════════════════════════
                  TAB: MARKET TRENDS & AI PREDICTION
              ══════════════════════════════════════════════════════════ */}
              <TabsContent value="trends" className="mt-4 space-y-4">
                {/* AI Pre-harvest Price Predictions */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">🤖 AI Pre-Harvest Price Predictions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AI_PREDICTIONS.map(p => (
                      <Card key={p.crop} className={`border-2 ${p.signal === "SELL NOW" ? "border-primary/40 bg-primary/3" : "border-border"}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-foreground">{p.crop}</span>
                            <Badge className={`text-[10px] ${p.signal === "SELL NOW" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                              {p.signal}
                            </Badge>
                          </div>
                          <div className="flex items-end gap-1 mb-2">
                            <span className="text-2xl font-bold text-primary">₹{p.currentPrice}</span>
                            <span className="text-xs text-muted-foreground mb-1">/kg now</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Predicted range:</span>
                              <span className="font-medium text-foreground">₹{p.predictedLow}–₹{p.predictedHigh}/kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Best sell window:</span>
                              <span className="font-medium text-foreground">{p.bestWindow}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">AI confidence:</span>
                              <div className="flex items-center gap-1">
                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-1.5 bg-primary rounded-full" style={{ width: `${p.confidence}%` }} />
                                </div>
                                <span className="font-medium text-primary">{p.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* 12-week price trend chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">12-Week Price Trends (₹/kg)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={PRICE_TREND_12W}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="week" tick={{ fontSize: 9 }} interval={2} />
                        <YAxis tick={{ fontSize: 9 }} unit="₹" />
                        <Tooltip formatter={(v, n) => [`₹${v}/kg`, n]} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="tomato" stroke="#ef4444" strokeWidth={2} dot={false} name="Tomato" />
                        <Line type="monotone" dataKey="onion" stroke="#a78bfa" strokeWidth={2} dot={false} name="Onion" />
                        <Line type="monotone" dataKey="chilli" stroke="#f97316" strokeWidth={2} dot={false} name="Chilli" />
                        <Line type="monotone" dataKey="rice" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Rice" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Buyer demand by market */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Buyer Demand by Market</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={BUYER_DEMAND} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 9 }} domain={[0, 100]} unit="%" />
                        <YAxis dataKey="market" type="category" tick={{ fontSize: 9 }} width={90} />
                        <Tooltip formatter={(v) => [`${v}%`, "Demand"]} />
                        <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {BUYER_DEMAND.slice(0, 3).map(m => (
                        <div key={m.market} className="bg-muted/50 rounded-lg p-2 text-center text-xs">
                          <div className="font-bold text-foreground">{m.buyers}</div>
                          <div className="text-muted-foreground text-[10px]">Active buyers</div>
                          <div className="font-medium text-muted-foreground text-[10px] truncate">{m.market}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ══════════════════════════════════════════════════════════
                  TAB: NEARBY FARMERS MAP
              ══════════════════════════════════════════════════════════ */}
              <TabsContent value="nearby" className="mt-4 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Nearby Farmers</h3>
                    <p className="text-xs text-muted-foreground">Connect, cluster, and trade together</p>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {["All", "Tomato", "Onion", "Chilli", "Turmeric", "Rice"].map(c => (
                      <Button key={c} size="sm" variant={cropFilter === c ? "default" : "outline"}
                        className={`text-[10px] h-6 px-2 ${cropFilter === c ? "bg-primary" : ""}`}
                        onClick={() => setCropFilter(c)}>
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Map placeholder (interactive list as fallback) */}
                <Card className="overflow-hidden border-border">
                  <div className="bg-muted/40 h-56 relative flex items-center justify-center border-b border-border">
                    {/* Simulated map background */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-10">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="border border-primary/40" />
                      ))}
                    </div>
                    {/* Farmer pins */}
                    {NEARBY_FARMERS
                      .filter(f => cropFilter === "All" || f.crop === cropFilter)
                      .map((f, i) => {
                        const x = 10 + (i * 14) % 80;
                        const y = 10 + (i * 17) % 70;
                        const color = CROP_COLORS_MAP[f.crop] || "hsl(var(--primary))";
                        return (
                          <button key={f.id}
                            style={{ left: `${x}%`, top: `${y}%`, borderColor: color }}
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                            onClick={() => setSelectedFarmer(f)}>
                            <div style={{ backgroundColor: color }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white group-hover:scale-125 transition-transform">
                              {f.name[0]}
                            </div>
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border text-foreground text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
                              {f.name} · {f.crop}
                            </div>
                          </button>
                        );
                      })}
                    <div className="relative z-10 text-center text-muted-foreground text-xs bg-background/80 px-3 py-1.5 rounded-full border border-border">
                      🗺️ Warangal District · Click pins to view farmer details
                    </div>
                  </div>
                  <CardContent className="p-3 text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                    {Object.entries(CROP_COLORS_MAP).map(([crop, color]) => (
                      <span key={crop} className="flex items-center gap-1">
                        <span style={{ backgroundColor: color }} className="w-2.5 h-2.5 rounded-full inline-block" />
                        {crop}
                      </span>
                    ))}
                  </CardContent>
                </Card>

                {/* Selected farmer detail */}
                {selectedFarmer && (
                  <Card className="border-primary/30 bg-primary/3">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div style={{ backgroundColor: CROP_COLORS_MAP[selectedFarmer.crop] || "hsl(var(--primary))" }}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {selectedFarmer.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">{selectedFarmer.name}</div>
                            <div className="text-xs text-muted-foreground">{selectedFarmer.village}</div>
                          </div>
                        </div>
                        <button className="text-muted-foreground text-xs hover:text-foreground" onClick={() => setSelectedFarmer(null)}>✕</button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <div className="font-bold text-foreground">{selectedFarmer.crop}</div>
                          <div className="text-muted-foreground text-[10px]">Crop</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <div className="font-bold text-foreground">{selectedFarmer.area}</div>
                          <div className="text-muted-foreground text-[10px]">Farm Area</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2 text-center">
                          <div className="font-bold text-foreground">{selectedFarmer.harvestDate}</div>
                          <div className="text-muted-foreground text-[10px]">Harvest</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <StarRating rating={selectedFarmer.rating} size="sm" showValue />
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">📞 {selectedFarmer.phone}</span>
                      </div>
                      {selectedFarmer.tradeGroup && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-xs">
                          🤝 Member of: <span className="font-semibold text-primary">{selectedFarmer.tradeGroup}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary text-xs h-7"
                          onClick={() => toast({ title: `📞 Calling ${selectedFarmer.name}`, description: selectedFarmer.phone })}>
                          📞 Contact
                        </Button>
                        {selectedFarmer.tradeGroup && (
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-7 border-primary/40 text-primary"
                            onClick={() => {
                              const g = selectedFarmer.tradeGroup!;
                              if (!tradeGroupJoined.includes(g)) {
                                setTradeGroupJoined(prev => [...prev, g]);
                                toast({ title: `🤝 Joined ${g}!`, description: "You're now part of this trade cluster." });
                              }
                            }}>
                            {tradeGroupJoined.includes(selectedFarmer.tradeGroup) ? "✅ Joined" : "🤝 Join Cluster"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Farmer list */}
                <div className="space-y-2">
                  {NEARBY_FARMERS
                    .filter(f => cropFilter === "All" || f.crop === cropFilter)
                    .map(f => (
                      <Card key={f.id}
                        className={`border cursor-pointer hover:border-primary/40 transition-all ${selectedFarmer?.id === f.id ? "border-primary/50 bg-primary/3" : "border-border"}`}
                        onClick={() => setSelectedFarmer(f)}>
                        <CardContent className="p-3 flex items-center gap-3">
                          <div style={{ backgroundColor: CROP_COLORS_MAP[f.crop] || "hsl(var(--primary))" }}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {f.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-foreground">{f.name}</div>
                            <div className="text-[10px] text-muted-foreground">{f.village} · {f.crop} · {f.area}</div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-[10px] text-muted-foreground">Harvest: {f.harvestDate}</div>
                            {f.tradeGroup && (
                              <Badge className="text-[9px] bg-primary/10 text-primary border border-primary/20 mt-0.5">
                                🤝 Cluster
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* Trade clusters summary */}
                {tradeGroupJoined.length > 0 && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="text-xs font-semibold text-foreground mb-2">✅ Your Trade Clusters</div>
                      {tradeGroupJoined.map(g => (
                        <div key={g} className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0">
                          <span className="text-foreground">🤝 {g}</span>
                          <Badge className="bg-primary text-primary-foreground text-[9px]">Active</Badge>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Clusters enable bulk transport, group negotiation, and joint market listings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

            </Tabs>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <HarvestReadinessScore score={78} />
            <SpoilageRiskMeter level="MEDIUM" factors={{ temp: 32, humidity: 68, storageTime: 3 }} />
            <WeatherWidget />
            <AIRecommendationBox recommendations={AI_RECOMMENDATIONS} />
          </div>
        </div>
      </div>

      {/* ── Book Transport Dialog ── */}
      <Dialog open={showTransportDialog} onOpenChange={setShowTransportDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><span>🚚</span> Book Transport</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-xs">Product / Crop *</Label>
                <Select value={transportForm.product} onValueChange={(v) => setTF("product", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>{CROPS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {transportForm.product === "Other" && (
                <div className="space-y-1">
                  <Label className="text-xs">Specify Crop *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Brinjal" value={transportForm.customProduct} onChange={e => setTF("customProduct", e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Total Load Weight (kg) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 3500" value={transportForm.weightKg} onChange={e => setTF("weightKg", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Warangal" value={transportForm.pickupLocation} onChange={e => setTF("pickupLocation", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Drop Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Hyderabad" value={transportForm.dropLocation} onChange={e => setTF("dropLocation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Date *</Label>
                <Input className="h-9 text-sm" type="date" value={transportForm.date} onChange={e => setTF("date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pickup Time *</Label>
                <Input className="h-9 text-sm" type="time" value={transportForm.time} onChange={e => setTF("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Your Offered Price (₹) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 2800" value={transportForm.offeredPrice} onChange={e => setTF("offeredPrice", e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Transport owner can counter this</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Phone Number *</Label>
                <Input className="h-9 text-sm" type="tel" placeholder="e.g. 98765 43210" value={transportForm.phone} onChange={e => setTF("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Additional Notes</Label>
              <Input className="h-9 text-sm" placeholder="e.g. Urgent, festival delivery..." value={transportForm.notes} onChange={e => setTF("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTransportDialog(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={handleSubmitTransport}>Submit Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Book Storage Dialog ── */}
      <Dialog open={showStorageDialog} onOpenChange={setShowStorageDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><span>🏪</span> Book Storage Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Unit selection */}
            <div className="space-y-1">
              <Label className="text-xs">Storage Facility *</Label>
              <Select value={storageForm.unitId} onValueChange={(v) => setSF("unitId", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Choose a storage unit" /></SelectTrigger>
                <SelectContent>
                  {STORAGE_UNITS.map(u => {
                    const avail = u.capacity - u.used;
                    const pct = Math.round((u.used / u.capacity) * 100);
                    return (
                      <SelectItem key={u.id} value={String(u.id)} disabled={pct >= 95}>
                        {u.type === "Cold Storage" ? "❄️" : u.type === "Silo" ? "🛢️" : "🏭"} {u.name} — {avail.toLocaleString()}kg free · ₹{u.price}/kg/mo{pct >= 95 ? " (Full)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedUnit && (
                <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-center">
                  {[
                    { l: "Type", v: selectedUnit.type },
                    { l: "Temp", v: selectedUnit.temp },
                    { l: "Available", v: `${(selectedUnit.capacity - selectedUnit.used).toLocaleString()} kg` },
                  ].map(s => (
                    <div key={s.l} className="bg-muted/60 rounded p-2">
                      <div className="text-muted-foreground">{s.l}</div>
                      <div className="font-semibold text-foreground">{s.v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Crop & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Crop / Product *</Label>
                <Select value={storageForm.crop} onValueChange={(v) => setSF("crop", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>{CROPS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {storageForm.crop === "Other" && (
                <div className="space-y-1">
                  <Label className="text-xs">Specify *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Brinjal" value={storageForm.customCrop} onChange={e => setSF("customCrop", e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Quantity (kg) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 2000" value={storageForm.weightKg} onChange={e => setSF("weightKg", e.target.value)} />
                {selectedUnit && storageForm.weightKg && Number(storageForm.weightKg) > (selectedUnit.capacity - selectedUnit.used) && (
                  <p className="text-[10px] text-destructive">Exceeds available space ({(selectedUnit.capacity - selectedUnit.used).toLocaleString()} kg)</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Check-in Date *</Label>
                <Input className="h-9 text-sm" type="date" value={storageForm.checkInDate} onChange={e => setSF("checkInDate", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Check-out Date *</Label>
                <Input className="h-9 text-sm" type="date" value={storageForm.checkOutDate} onChange={e => setSF("checkOutDate", e.target.value)} />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <Label className="text-xs">Your Phone Number *</Label>
              <Input className="h-9 text-sm" type="tel" placeholder="e.g. 98765 43210" value={storageForm.phone} onChange={e => setSF("phone", e.target.value)} />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs">Notes / Special Requirements</Label>
              <Input className="h-9 text-sm" placeholder="e.g. Organic batch, handle with care..." value={storageForm.notes} onChange={e => setSF("notes", e.target.value)} />
            </div>

            {/* Cost preview */}
            {estimatedStorageCost > 0 && (
              <div className="bg-primary/5 rounded-lg p-3 text-xs border border-primary/20 space-y-1">
                <div className="font-semibold text-primary">📋 Cost Estimate</div>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>Quantity:</span><span className="text-foreground font-medium">{storageForm.weightKg} kg</span>
                  <span>Duration:</span><span className="text-foreground font-medium">{storageDurationDays} days ({(durationMonths).toFixed(1)} months)</span>
                  <span>Rate:</span><span className="text-foreground font-medium">₹{selectedUnit?.price}/kg/month</span>
                  <span>Total Estimate:</span><span className="text-primary font-bold text-sm">₹{estimatedStorageCost.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStorageDialog(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={handleSubmitStorage}>Submit Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AICopilot />

      {/* ── Targeted Vehicle Booking Dialog ── */}
      <Dialog open={vehicleBookingMode === "targeted"} onOpenChange={(open) => !open && setVehicleBookingMode(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>📝</span> Request Vehicle: {targetVehicle?.ownerName}
            </DialogTitle>
            {targetVehicle && (
              <DialogDescription className="text-xs">
                {targetVehicle.vehicleNo} · {targetVehicle.vehicleType} · {targetVehicle.capacityTon}T
                {targetVehicle.isRefrigerated ? " · ❄️ Refrigerated" : ""}
                · Rating {targetVehicle.rating}/5 · {targetVehicle.totalTrips} trips completed
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-xs">Product / Crop *</Label>
                <Select value={vehicleForm.product} onValueChange={(v) => setVF("product", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>{CROPS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {vehicleForm.product === "Other" && (
                <div className="space-y-1">
                  <Label className="text-xs">Specify Crop *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Brinjal" value={vehicleForm.customProduct} onChange={e => setVF("customProduct", e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Total Load Weight (kg) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 3500" value={vehicleForm.weightKg} onChange={e => setVF("weightKg", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Warangal" value={vehicleForm.pickupLocation} onChange={e => setVF("pickupLocation", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Drop Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Hyderabad" value={vehicleForm.dropLocation} onChange={e => setVF("dropLocation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Date *</Label>
                <Input className="h-9 text-sm" type="date" value={vehicleForm.date} onChange={e => setVF("date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pickup Time *</Label>
                <Input className="h-9 text-sm" type="time" value={vehicleForm.time} onChange={e => setVF("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Your Offered Price (₹) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 2800" value={vehicleForm.offeredPrice} onChange={e => setVF("offeredPrice", e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Owner can send a counter offer</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Phone Number *</Label>
                <Input className="h-9 text-sm" type="tel" placeholder="e.g. 98765 43210" value={vehicleForm.phone} onChange={e => setVF("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Additional Notes</Label>
              <Input className="h-9 text-sm" placeholder="e.g. Urgent, fragile produce..." value={vehicleForm.notes} onChange={e => setVF("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setVehicleBookingMode(null)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={handleSubmitTargetedVehicle}>
              📤 Send Request to {targetVehicle?.ownerName}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Broadcast Booking Dialog ── */}
      <Dialog open={vehicleBookingMode === "broadcast"} onOpenChange={(open) => !open && setVehicleBookingMode(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>📡</span> Broadcast Request to Multiple Vehicles
            </DialogTitle>
            <DialogDescription className="text-xs">
              {selectedVehicleIds.length > 0
                ? `Your request will be sent to ${selectedVehicleIds.length} selected vehicle${selectedVehicleIds.length > 1 ? "s" : ""}. The first to accept confirms the trip.`
                : `Your request will be broadcast to all ${AVAILABLE_VEHICLES.length} available vehicles.`}
            </DialogDescription>
          </DialogHeader>
          {/* Vehicle list preview */}
          <div className="flex flex-wrap gap-1 pb-3 border-b border-border">
            {(selectedVehicleIds.length > 0 ? selectedVehicleIds : AVAILABLE_VEHICLES.map(v => v.id)).map(id => {
              const veh = AVAILABLE_VEHICLES.find(x => x.id === id);
              return veh ? (
                <span key={id} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">🚛 {veh.ownerName}</span>
              ) : null;
            })}
          </div>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-xs">Product / Crop *</Label>
                <Select value={vehicleForm.product} onValueChange={(v) => setVF("product", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>{CROPS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {vehicleForm.product === "Other" && (
                <div className="space-y-1">
                  <Label className="text-xs">Specify Crop *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Brinjal" value={vehicleForm.customProduct} onChange={e => setVF("customProduct", e.target.value)} />
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">Total Load Weight (kg) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 3500" value={vehicleForm.weightKg} onChange={e => setVF("weightKg", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Warangal" value={vehicleForm.pickupLocation} onChange={e => setVF("pickupLocation", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Drop Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Hyderabad" value={vehicleForm.dropLocation} onChange={e => setVF("dropLocation", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Date *</Label>
                <Input className="h-9 text-sm" type="date" value={vehicleForm.date} onChange={e => setVF("date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pickup Time *</Label>
                <Input className="h-9 text-sm" type="time" value={vehicleForm.time} onChange={e => setVF("time", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Your Offered Price (₹) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 2800" value={vehicleForm.offeredPrice} onChange={e => setVF("offeredPrice", e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Each owner can counter individually</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Phone Number *</Label>
                <Input className="h-9 text-sm" type="tel" placeholder="e.g. 98765 43210" value={vehicleForm.phone} onChange={e => setVF("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Additional Notes</Label>
              <Input className="h-9 text-sm" placeholder="e.g. Urgent, festival delivery..." value={vehicleForm.notes} onChange={e => setVF("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setVehicleBookingMode(null)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={handleSubmitBroadcast}>
              📡 Broadcast to {selectedVehicleIds.length > 0 ? selectedVehicleIds.length : AVAILABLE_VEHICLES.length} Vehicles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AppLayout>
  );
}
