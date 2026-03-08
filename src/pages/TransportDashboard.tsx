import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StarRating } from "@/components/shared/StarRating";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { useToast } from "@/hooks/use-toast";
import { useTransportBooking } from "@/context/TransportBookingContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

// ── Static demo data ──────────────────────────────────────────────────────────
const ACTIVE_TRIPS = [
  {
    id: "TR-001", farmer: "Prakash Rao", from: "Nizamabad", to: "Chennai",
    crop: "Chilli", weight: "800kg", weightKg: 800, agreedPrice: 1400,
    status: "in-transit", progress: 65, eta: "4 hrs remaining",
    startTime: "06:00 AM", driver: "Vijay Kumar",
  },
  {
    id: "TR-002", farmer: "Anand Reddy", from: "Warangal", to: "Hyderabad",
    crop: "Tomato", weight: "2T", weightKg: 2000, agreedPrice: 2200,
    status: "pickup", progress: 10, eta: "ETA 2 hrs",
    startTime: "09:00 AM", driver: "Self",
  },
];

const COMPLETED_TRIPS = [
  { id: "TR-098", farmer: "Laxmi Devi", route: "Karimnagar → Hyderabad", crop: "Onion", earned: 1800, rating: 5, date: "Oct 12", weightKg: 1500 },
  { id: "TR-097", farmer: "Raju Nair", route: "Warangal → Pune", crop: "Turmeric", earned: 4200, rating: 4, date: "Oct 10", weightKg: 3000 },
  { id: "TR-096", farmer: "Gopi Krishna", route: "Adilabad → Nagpur", crop: "Soybean", earned: 3100, rating: 5, date: "Oct 8", weightKg: 2500 },
];

// Potential loads that could fill remaining vehicle space on same routes
const EXTRA_LOAD_POOL = [
  { id: "XL-01", farmer: "Meena Bai", crop: "Turmeric", from: "Karimnagar", to: "Hyderabad", weightKg: 600, date: "2024-10-15", time: "07:30", offeredPrice: 700, match: 96 },
  { id: "XL-02", farmer: "Ravi Shankar", crop: "Chilli", from: "Warangal", to: "Hyderabad", weightKg: 400, date: "2024-10-18", time: "08:30", offeredPrice: 500, match: 88 },
  { id: "XL-03", farmer: "Anita Reddy", crop: "Potato", from: "Karimnagar", to: "Hyderabad", weightKg: 1000, date: "2024-10-15", time: "06:30", offeredPrice: 1100, match: 81 },
  { id: "XL-04", farmer: "Suresh Patel", crop: "Onion", from: "Warangal", to: "Pune", weightKg: 800, date: "2024-10-22", time: "05:00", offeredPrice: 950, match: 74 },
];

const SCHEDULE_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#06b6d4", "#8b5cf6"];

const CROP_COLORS: Record<string, string> = {
  Tomato: "#ef4444", Onion: "#a78bfa", Chilli: "#f97316",
  Turmeric: "#eab308", Rice: "#84cc16", Wheat: "#d97706",
};

// ─────────────────────────────────────────────────────────────────────────────
export default function TransportDashboard() {
  const { toast } = useToast();
  const { bookings, sendCounter, acceptBooking, rejectBooking } = useTransportBooking();

  const [myVehicle, setMyVehicle] = useState({
    type: "Large Truck", regNo: "TS 09 EA 4512", capacity: 10, available: 8,
    location: "Warangal, Telangana", routes: "Warangal, Karimnagar, Hyderabad, Chennai",
    pricePerKm: "45", pricePerTon: "320", minLoad: "500", maxLoad: "10000",
    availableFrom: "05:00", availableTo: "22:00",
    driverName: "Vijay Kumar", driverPhone: "99887 11223", status: "available",
  });

  const [negotiations, setNegotiations] = useState<Record<string, { counter: string; note: string }>>({});
  const [acceptedExtras, setAcceptedExtras] = useState<Set<string>>(new Set());

  // ── Derived booking lists ─────────────────────────────────────────────────
  const newCount = bookings.filter(b => b.status === "pending").length;

  const approvedBookings = useMemo(() =>
    bookings.filter(b => ["accepted", "farmer-accepted"].includes(b.status))
      .sort((a, b) => {
        const da = new Date(`${a.date}T${a.time}`).getTime();
        const db = new Date(`${b.date}T${b.time}`).getTime();
        return da - db;
      }),
    [bookings]
  );

  // ── Schedule & capacity calculations ─────────────────────────────────────
  const scheduledLoad = useMemo(() =>
    approvedBookings.reduce((s, b) => s + b.weightKg, 0),
    [approvedBookings]
  );
  const capacityKg = myVehicle.capacity * 1000;
  const usedKg = scheduledLoad;
  const remainingKg = Math.max(0, capacityKg - usedKg);
  const usedPct = Math.min(100, Math.round((usedKg / capacityKg) * 100));

  // Group bookings by date for timeline
  const byDate = useMemo(() => {
    const map: Record<string, typeof approvedBookings> = {};
    approvedBookings.forEach(b => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [approvedBookings]);

  // Bookings per day chart
  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; loads: number; totalKg: number; earned: number }> = {};
    approvedBookings.forEach(b => {
      const label = new Date(b.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!map[b.date]) map[b.date] = { date: label, loads: 0, totalKg: 0, earned: 0 };
      map[b.date].loads += 1;
      map[b.date].totalKg += b.weightKg;
      map[b.date].earned += b.counterPrice ?? b.offeredPrice;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [approvedBookings]);

  // Crop breakdown pie
  const cropPieData = useMemo(() => {
    const map: Record<string, number> = {};
    approvedBookings.forEach(b => {
      map[b.product] = (map[b.product] || 0) + b.weightKg;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [approvedBookings]);

  // Smart route suggestions: find extra loads on same routes that fit remaining space
  const routeSuggestions = useMemo(() => {
    const approvedRoutes = new Set(
      approvedBookings.map(b => `${b.pickupLocation}|${b.dropLocation}`)
    );
    return EXTRA_LOAD_POOL.filter(xl => {
      const matchesRoute = approvedRoutes.has(`${xl.from}|${xl.to}`);
      const fits = xl.weightKg <= remainingKg;
      return matchesRoute && fits && !acceptedExtras.has(xl.id);
    });
  }, [approvedBookings, remainingKg, acceptedExtras]);

  // All suggestions regardless of route (fallback when no matches)
  const allSuggestions = EXTRA_LOAD_POOL.filter(xl =>
    xl.weightKg <= remainingKg && !acceptedExtras.has(xl.id)
  );

  const displaySuggestions = routeSuggestions.length > 0 ? routeSuggestions : allSuggestions;

  const handleAcceptExtra = (xl: typeof EXTRA_LOAD_POOL[0]) => {
    setAcceptedExtras(prev => new Set([...prev, xl.id]));
    toast({
      title: "✅ Load Added to Schedule!",
      description: `${xl.farmer}'s ${xl.weightKg}kg of ${xl.crop} added. ₹${xl.offeredPrice} more earned.`,
    });
  };

  // Schedule efficiency score
  const efficiencyScore = Math.round((usedKg / capacityKg) * 100);
  const efficiencyLabel = efficiencyScore >= 80 ? "Excellent" : efficiencyScore >= 50 ? "Good" : "Low";
  const efficiencyColor = efficiencyScore >= 80 ? "text-primary" : efficiencyScore >= 50 ? "text-yellow-600" : "text-destructive";

  const totalEarned = COMPLETED_TRIPS.reduce((s, t) => s + t.earned, 0);
  const approvedEarnings = approvedBookings.reduce((s, b) => s + (b.counterPrice ?? b.offeredPrice), 0);

  const handleCounterOffer = (id: string) => {
    const counter = negotiations[id]?.counter;
    if (!counter || isNaN(Number(counter))) {
      toast({ title: "Enter a valid counter price", variant: "destructive" });
      return;
    }
    sendCounter(id, Number(counter), negotiations[id]?.note || "");
    toast({ title: "💬 Counter Offer Sent", description: `Sent ₹${counter} as counter offer for ${id}.` });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Transport Owner Dashboard" subtitle="Manage your vehicle, bookings & earnings">
      <div className="space-y-6 animate-fade-in">

        {/* ── Top stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Upcoming Earnings" value={`₹${approvedEarnings.toLocaleString()}`} icon="💵" trend="up" trendValue="From confirmed trips" highlight />
          <StatCard title="Pending Requests" value={String(newCount)} icon="📋" />
          <StatCard title="Confirmed Bookings" value={String(approvedBookings.length)} icon="✅" trend="stable" trendValue="Ready to execute" />
          <StatCard title="Capacity Used" value={`${usedPct}%`} icon="⚖️" trend={usedPct > 80 ? "up" : usedPct > 40 ? "stable" : "down"} trendValue={`${(remainingKg / 1000).toFixed(1)}T free`} />
        </div>

        <Tabs defaultValue="schedule">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="schedule" className="relative">
              📅 Smart Schedule
              {approvedBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                  {approvedBookings.length}
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
          </TabsList>

          {/* ══════════════════════════════════════════════════════════════════
              TAB: SMART SCHEDULE
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="schedule" className="mt-4 space-y-5">

            {/* Vehicle Capacity Gauge */}
            <Card className="border-primary/20 bg-primary/3">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">🚛 Vehicle Load Capacity</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{myVehicle.regNo} · {myVehicle.type}</p>
                  </div>
                  <Badge className={`text-xs font-semibold ${efficiencyScore >= 80 ? "bg-primary text-primary-foreground" : efficiencyScore >= 50 ? "bg-yellow-500/20 text-yellow-700 border border-yellow-500/40" : "bg-muted text-muted-foreground"}`}>
                    {efficiencyLabel} Utilisation
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: "Total Capacity", value: `${myVehicle.capacity}T`, sub: `${capacityKg.toLocaleString()} kg` },
                    { label: "Scheduled Load", value: `${(usedKg / 1000).toFixed(2)}T`, sub: `${usedKg.toLocaleString()} kg`, primary: true },
                    { label: "Remaining Space", value: `${(remainingKg / 1000).toFixed(2)}T`, sub: `${remainingKg.toLocaleString()} kg`, accent: true },
                  ].map(s => (
                    <div key={s.label} className="bg-background rounded-lg p-3 border border-border text-center">
                      <div className={`text-xl font-bold ${s.primary ? "text-primary" : s.accent ? "text-accent-foreground" : "text-foreground"}`}>{s.value}</div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground">{s.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Load utilisation</span>
                    <span className={`font-semibold ${efficiencyColor}`}>{usedPct}%</span>
                  </div>
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all duration-500 ${usedPct >= 80 ? "bg-primary" : usedPct >= 50 ? "bg-yellow-500" : "bg-muted-foreground/40"}`}
                      style={{ width: `${usedPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0</span><span>50%</span><span>{myVehicle.capacity}T</span>
                  </div>
                </div>

                {remainingKg > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
                    <span className="text-lg">💡</span>
                    <span className="text-foreground">You have <strong>{(remainingKg / 1000).toFixed(1)}T</strong> free space. Accept more loads on the same routes to maximise earnings!</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analytics row */}
            {approvedBookings.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Daily load bar chart */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">📊 Load by Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={dailyChartData} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="kg" width={48} />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                            formatter={(v: number) => [`${v} kg`, "Load"]}
                          />
                          <Bar dataKey="totalKg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No confirmed bookings yet</div>
                    )}
                  </CardContent>
                </Card>

                {/* Earnings by date */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">💰 Earnings by Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dailyChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={dailyChartData} barSize={28}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="₹" width={52} />
                          <Tooltip
                            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                            formatter={(v: number) => [`₹${v.toLocaleString()}`, "Earnings"]}
                          />
                          <Bar dataKey="earned" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No confirmed bookings yet</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Crop composition pie */}
            {cropPieData.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">🌾 Load Composition by Crop</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={cropPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {cropPieData.map((entry, i) => (
                          <Cell key={entry.name} fill={CROP_COLORS[entry.name] || SCHEDULE_COLORS[i % SCHEDULE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v} kg`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Day-by-day Trip Schedule Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">📅 Confirmed Trip Schedule</CardTitle>
                  <Badge variant="outline" className="text-xs">{approvedBookings.length} trips confirmed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvedBookings.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <div className="text-4xl mb-3">📋</div>
                    <p>No confirmed bookings yet.</p>
                    <p className="text-xs mt-1">Accept or approve bookings from the Booking Requests tab to build your schedule.</p>
                  </div>
                ) : (
                  Object.entries(byDate).map(([date, trips]) => {
                    const dayLoad = trips.reduce((s, t) => s + t.weightKg, 0);
                    const dayCapacityPct = Math.min(100, Math.round((dayLoad / capacityKg) * 100));
                    const dateLabel = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
                    return (
                      <div key={date} className="border border-border rounded-xl overflow-hidden">
                        {/* Date header */}
                        <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border">
                          <div className="flex items-center gap-2">
                            <span className="text-base">📅</span>
                            <span className="font-semibold text-sm text-foreground">{dateLabel}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>⚖️ {(dayLoad / 1000).toFixed(1)}T loaded</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${dayCapacityPct}%` }} />
                              </div>
                              <span className="text-primary font-medium">{dayCapacityPct}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline of trips that day */}
                        <div className="divide-y divide-border">
                          {trips.sort((a, b) => a.time.localeCompare(b.time)).map((booking, idx) => (
                            <div key={booking.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                              {/* Time column */}
                              <div className="flex flex-col items-center min-w-[44px]">
                                <div className="text-xs font-bold text-primary">{booking.time}</div>
                                <div className="w-px flex-1 bg-border mt-1 min-h-[24px]" />
                                {idx === trips.length - 1 && <span className="text-xs">🏁</span>}
                              </div>

                              {/* Trip info */}
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-foreground">{booking.pickupLocation} → {booking.dropLocation}</span>
                                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                                    {booking.status === "farmer-accepted" ? "🎉 Confirmed" : "✅ Approved"}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                  <span>🧑‍🌾 {booking.farmerName}</span>
                                  <span>📦 {booking.product} · {booking.weightKg >= 1000 ? `${booking.weightKg / 1000}T` : `${booking.weightKg}kg`}</span>
                                  <span className="font-medium text-primary">💵 ₹{(booking.counterPrice ?? booking.offeredPrice).toLocaleString()}</span>
                                  <span>📞 {booking.farmerPhone}</span>
                                </div>
                                {booking.notes && (
                                  <p className="text-[10px] text-muted-foreground italic">📝 {booking.notes}</p>
                                )}
                              </div>

                              {/* Load bar */}
                              <div className="hidden sm:flex flex-col items-end gap-1 min-w-[80px]">
                                <span className="text-[10px] text-muted-foreground">{Math.round((booking.weightKg / capacityKg) * 100)}% of truck</span>
                                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                  <div className="h-2 bg-primary rounded-full" style={{ width: `${Math.min(100, Math.round((booking.weightKg / capacityKg) * 100))}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* ── Route-based Load Suggestions ──────────────────────────────── */}
            {remainingKg > 0 && (
              <Card className="border-accent/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm">🤝 Fill Your Remaining Space</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {routeSuggestions.length > 0
                          ? `Loads on your confirmed routes that fit in ${(remainingKg / 1000).toFixed(1)}T free space`
                          : `Loads that fit in your ${(remainingKg / 1000).toFixed(1)}T free space`}
                      </p>
                    </div>
                    <Badge className="bg-accent/20 text-foreground border border-accent/30 text-xs">
                      {displaySuggestions.length} available
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {displaySuggestions.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <div className="text-3xl mb-2">🎉</div>
                      <p>No more loads available that fit your remaining space.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displaySuggestions.map((xl) => {
                        const fitsComfortably = xl.weightKg <= remainingKg * 0.8;
                        return (
                          <Card key={xl.id} className={`border ${fitsComfortably ? "border-primary/30 bg-primary/3" : "border-yellow-500/30 bg-yellow-500/5"}`}>
                            <CardContent className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="font-semibold text-sm">{xl.farmer}</div>
                                  <div className="text-xs text-muted-foreground">{xl.crop} · {xl.weightKg >= 1000 ? `${xl.weightKg / 1000}T` : `${xl.weightKg}kg`}</div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="text-xs font-bold text-primary">+₹{xl.offeredPrice}</div>
                                  <Badge className={`text-[10px] mt-0.5 ${xl.match >= 90 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {xl.match}% match
                                  </Badge>
                                </div>
                              </div>

                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <div>📍 {xl.from} → {xl.to}</div>
                                <div>📅 {xl.date} · ⏰ {xl.time}</div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>Space needed</span>
                                  <span>{Math.round((xl.weightKg / capacityKg) * 100)}% of truck</span>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className={`h-1.5 rounded-full ${fitsComfortably ? "bg-primary" : "bg-yellow-500"}`}
                                    style={{ width: `${Math.min(100, Math.round((xl.weightKg / remainingKg) * 100))}%` }} />
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                  Uses {Math.round((xl.weightKg / remainingKg) * 100)}% of your free {(remainingKg / 1000).toFixed(1)}T
                                </div>
                              </div>

                              <div className="flex gap-2 pt-1">
                                <Button size="sm" className="flex-1 bg-primary text-xs h-8" onClick={() => handleAcceptExtra(xl)}>
                                  ✅ Add to Schedule
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs h-8 border-border" onClick={() => setAcceptedExtras(prev => new Set([...prev, xl.id]))}>
                                  Skip
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Efficiency Tips */}
            <Card className="border-dashed border-border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-semibold text-foreground">💡 Scheduling Tips</div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• <strong>Cluster nearby pickups</strong> on the same day to reduce empty return kilometres.</li>
                  <li>• <strong>Start at 05:00–06:00 AM</strong> — early departures avoid traffic and reach markets before peak hours.</li>
                  <li>• <strong>Load heavier items first</strong> (soybean, wheat) and lighter produce (tomato, chilli) on top to reduce spoilage.</li>
                  <li>• <strong>Keep 10–15% buffer</strong> in capacity for surprise top-ups from farmers on route.</li>
                  <li>• Accept loads ≥80% route match to avoid detours and extra fuel costs.</li>
                </ul>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB: BOOKING REQUESTS
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="requests" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Incoming Booking Requests</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 border">{newCount} New</Badge>
            </div>

            {bookings.length === 0 && (
              <Card className="border-dashed border-border">
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
                  b.status === "accepted" || b.status === "farmer-accepted"
                    ? "border-primary/40 bg-primary/5"
                  : b.status === "rejected" || b.status === "farmer-rejected"
                    ? "border-destructive/30 bg-destructive/5 opacity-60"
                  : isCounterSent
                    ? "border-accent/40 bg-accent/5"
                  : "border-border"
                }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                      <Badge variant="outline" className={`text-xs ${
                        b.status === "accepted" ? "bg-primary/10 text-primary border-primary/30"
                        : b.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
                        : isCounterSent ? "bg-accent/20 text-foreground border-accent/40"
                        : b.status === "farmer-accepted" ? "bg-primary/10 text-primary border-primary/30"
                        : b.status === "farmer-rejected" ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-muted text-muted-foreground"
                      }`}>
                        {b.status === "counter-sent" ? "💬 Counter Sent — Awaiting Farmer"
                        : b.status === "farmer-accepted" ? "🎉 Farmer Accepted — Trip Confirmed"
                        : b.status === "farmer-rejected" ? "✗ Farmer Declined Counter"
                        : b.status === "accepted" ? "✅ Accepted"
                        : b.status === "rejected" ? "❌ Rejected"
                        : "⏳ Pending"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                      <div><span className="text-muted-foreground">Farmer</span><br /><span className="font-medium">{b.farmerName}</span></div>
                      <div><span className="text-muted-foreground">Phone</span><br /><span className="font-medium">{b.farmerPhone}</span></div>
                      <div><span className="text-muted-foreground">Route</span><br /><span className="font-medium">{b.pickupLocation} → {b.dropLocation}</span></div>
                      <div><span className="text-muted-foreground">Product / Load</span><br /><span className="font-medium">{b.product} · {b.weightKg >= 1000 ? `${b.weightKg / 1000}T` : `${b.weightKg}kg`}</span></div>
                      <div><span className="text-muted-foreground">Date</span><br /><span className="font-medium">{b.date}</span></div>
                      <div><span className="text-muted-foreground">Pickup Time</span><br /><span className="font-medium">{b.time}</span></div>
                      <div><span className="text-muted-foreground">Farmer's Price</span><br /><span className="font-semibold text-primary">₹{b.offeredPrice}</span></div>
                      {b.counterPrice && (
                        <div><span className="text-muted-foreground">Your Counter</span><br /><span className="font-semibold">₹{b.counterPrice}</span></div>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-muted-foreground italic">📝 {b.notes}</p>
                    )}

                    {!isActioned && !isCounterSent && (
                      <div className="mt-2 pt-3 border-t border-border flex flex-wrap gap-2 items-end">
                        <div className="flex items-end gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Your Counter Price (₹)</Label>
                            <Input
                              className="h-8 w-36 text-xs"
                              placeholder={`e.g. ${Math.round(b.offeredPrice * 1.15)}`}
                              value={neg.counter}
                              onChange={(e) => setNegotiations(p => ({ ...p, [b.id]: { ...p[b.id], counter: e.target.value, note: p[b.id]?.note || "" } }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Note (optional)</Label>
                            <Input
                              className="h-8 w-48 text-xs"
                              placeholder="e.g. Fuel surcharge applies"
                              value={neg.note}
                              onChange={(e) => setNegotiations(p => ({ ...p, [b.id]: { counter: p[b.id]?.counter || "", note: e.target.value } }))}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <Button size="sm" className="bg-primary text-xs h-8"
                            onClick={() => { acceptBooking(b.id); toast({ title: "✅ Booking Accepted!", description: `Booking ${b.id} confirmed at ₹${b.offeredPrice}` }); }}>
                            ✅ Accept ₹{b.offeredPrice}
                          </Button>
                          {neg.counter && (
                            <Button size="sm" variant="outline" className="text-xs h-8 border-accent/50"
                              onClick={() => handleCounterOffer(b.id)}>
                              💬 Counter ₹{neg.counter}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive"
                            onClick={() => { rejectBooking(b.id); toast({ title: "❌ Booking Rejected", variant: "destructive" }); }}>
                            ✗ Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {isCounterSent && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        💬 Counter offer <span className="font-semibold text-foreground">₹{b.counterPrice}</span> sent — waiting for farmer.
                        {b.counterNote && <span className="ml-1 italic">(Note: {b.counterNote})</span>}
                      </div>
                    )}

                    {b.status === "farmer-accepted" && (
                      <div className="text-xs text-primary font-medium pt-2 border-t border-primary/20">
                        🎉 Trip confirmed at ₹{b.counterPrice || b.offeredPrice} — {b.date} at {b.time}. Contact farmer: {b.farmerPhone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB: ACTIVE TRIPS
          ══════════════════════════════════════════════════════════════════ */}
          <TabsContent value="active" className="mt-4 space-y-4">
            {ACTIVE_TRIPS.map((t) => (
              <Card key={t.id} className="border-border">
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
                      <div className="h-2.5 bg-primary rounded-full transition-all" style={{ width: `${t.progress}%` }} />
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

          {/* ══════════════════════════════════════════════════════════════════
              TAB: MY VEHICLE
          ══════════════════════════════════════════════════════════════════ */}
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
                  <div className="text-xs space-y-1">
                    {[
                      { l: "Min Load", v: `${myVehicle.minLoad} kg` },
                      { l: "Max Load", v: `${myVehicle.maxLoad} kg` },
                      { l: "Working Hours", v: `${myVehicle.availableFrom} – ${myVehicle.availableTo}` },
                      { l: "Routes", v: myVehicle.routes },
                    ].map(r => (
                      <div key={r.l} className="flex justify-between">
                        <span className="text-muted-foreground">{r.l}</span>
                        <span className="font-medium text-right max-w-[180px]">{r.v}</span>
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
                            const val = f.key === "capacity" || f.key === "available" ? Number(e.target.value) : e.target.value;
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
                    onClick={() => toast({ title: "✅ Vehicle details saved!", description: "Farmers can now see your updated rates." })}>
                    Save Vehicle Details
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ══════════════════════════════════════════════════════════════════
              TAB: EARNINGS
          ══════════════════════════════════════════════════════════════════ */}
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
                  <div className="text-2xl font-bold text-foreground">{COMPLETED_TRIPS.length}</div>
                  <div className="text-xs text-muted-foreground mt-1">Trips Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">4.8 ⭐</div>
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
                      <tr>
                        {["Trip ID", "Farmer", "Route", "Crop", "Earned", "Rating", "Date"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPLETED_TRIPS.map((t) => (
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
