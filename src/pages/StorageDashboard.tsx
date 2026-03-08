import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpoilageRiskMeter } from "@/components/shared/SpoilageRiskMeter";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { STORAGE_UNITS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useStorageBooking } from "@/context/StorageBookingContext";
import { useRole, StorageProfile } from "@/context/RoleContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const CROP_COLORS: Record<string, string> = {
  Tomato: "#ef4444", Onion: "#a78bfa", "Chilli (Dry)": "#f97316",
  Turmeric: "#eab308", Rice: "#84cc16", Wheat: "#d97706", Millet: "#06b6d4",
};
const FALLBACK_COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#f59e0b", "#06b6d4", "#8b5cf6"];

const TYPE_ICON: Record<string, string> = { "Cold Storage": "❄️", Warehouse: "🏭", Silo: "🛢️" };

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-muted text-muted-foreground",
  approved:  "bg-primary/10 text-primary border-primary/30",
  rejected:  "bg-destructive/10 text-destructive border-destructive/30",
  active:    "bg-primary/10 text-primary border-primary/30",
  completed: "bg-muted text-foreground",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};
const STATUS_LABEL: Record<string, string> = {
  pending: "⏳ Pending", approved: "✅ Approved", rejected: "❌ Rejected",
  active: "🏪 Active", completed: "🎉 Completed", cancelled: "✗ Cancelled",
};

// Static inventory for this manager's facilities
const STATIC_INVENTORY = [
  { facility: "AgroStore Warangal", crop: "Tomato", qty: 2000, entered: "Oct 10", safeUntil: "Oct 22", status: "good" },
  { facility: "FarmSafe Karimnagar", crop: "Onion", qty: 5000, entered: "Sep 28", safeUntil: "Oct 28", status: "alert" },
  { facility: "GrainStore Nizamabad", crop: "Millet", qty: 1200, entered: "Sep 15", safeUntil: "Dec 15", status: "good" },
];

export default function StorageDashboard() {
  const { toast } = useToast();
  const { user } = useRole();
  const { bookings, approveBooking, rejectBooking, completeBooking } = useStorageBooking();

  const sp = (user?.profile ?? {}) as StorageProfile;
  const managerName   = user?.name ?? "CoolStore Facilities";
  const facilityName  = sp.warehouseName ?? "My Storage Facility";
  const storageCapTon = parseFloat(sp.storageCapacity ?? "200");
  const storageType   = sp.storageTypes ?? "Cold Storage";
  const tempRange     = sp.tempRange ?? "4–10°C";
  const fssaiNo       = sp.fssaiNo ?? "";
  const unitsCount    = sp.unitsAvailable ?? "4";
  const ratePerTonDay = sp.pricePerTonDay ?? "25";
  const insured       = sp.insuranceCovered ?? "No";

  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});

  // ── Derived data ─────────────────────────────────────────────────────────
  const pendingCount = bookings.filter(b => b.status === "pending").length;
  const activeCount = bookings.filter(b => ["approved", "active"].includes(b.status)).length;

  const approvedBookings = useMemo(() =>
    bookings
      .filter(b => ["approved", "active"].includes(b.status))
      .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()),
    [bookings]
  );

  // Group approved by check-in date
  const byDate = useMemo(() => {
    const map: Record<string, typeof approvedBookings> = {};
    approvedBookings.forEach(b => {
      if (!map[b.checkInDate]) map[b.checkInDate] = [];
      map[b.checkInDate].push(b);
    });
    return map;
  }, [approvedBookings]);

  // Compute capacity per unit from approved/active bookings
  const unitLoads = useMemo(() => {
    const map: Record<number, number> = {};
    approvedBookings.forEach(b => {
      map[b.unitId] = (map[b.unitId] || 0) + b.weightKg;
    });
    return map;
  }, [approvedBookings]);

  // Bar chart: bookings by check-in date
  const dailyData = useMemo(() => {
    const map: Record<string, { date: string; bookings: number; totalKg: number; revenue: number }> = {};
    approvedBookings.forEach(b => {
      const label = new Date(b.checkInDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      if (!map[b.checkInDate]) map[b.checkInDate] = { date: label, bookings: 0, totalKg: 0, revenue: 0 };
      map[b.checkInDate].bookings += 1;
      map[b.checkInDate].totalKg += b.weightKg;
      map[b.checkInDate].revenue += b.estimatedCost;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [approvedBookings]);

  // Crop breakdown pie
  const cropPieData = useMemo(() => {
    const map: Record<string, number> = {};
    approvedBookings.forEach(b => { map[b.crop] = (map[b.crop] || 0) + b.weightKg; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [approvedBookings]);

  const totalScheduledRevenue = approvedBookings.reduce((s, b) => s + b.estimatedCost, 0);
  const totalScheduledKg = approvedBookings.reduce((s, b) => s + b.weightKg, 0);

  const handleApprove = (id: string) => {
    approveBooking(id, managerNotes[id] || "");
    toast({ title: "✅ Booking Approved", description: "Farmer has been notified." });
  };

  const handleReject = (id: string) => {
    rejectBooking(id, managerNotes[id] || "Booking could not be accommodated at this time.");
    toast({ title: "❌ Booking Rejected", variant: "destructive" });
  };

  return (
    <AppLayout title="Storage Manager Dashboard" subtitle={`${facilityName} · ${storageType} · ${tempRange}${fssaiNo ? ` · FSSAI ${fssaiNo}` : ""}`}>
      <div className="space-y-6 animate-fade-in">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Pending Requests" value={String(pendingCount)} icon="📋" highlight={pendingCount > 0} />
          <StatCard title="Active Bookings" value={String(activeCount)} icon="🏪" trend="stable" trendValue="Currently stored" />
          <StatCard title="Scheduled Revenue" value={`₹${(totalScheduledRevenue / 1000).toFixed(1)}K`} icon="💰" trend="up" trendValue="From confirmed bookings" highlight />
          <StatCard title="Total Scheduled" value={`${(totalScheduledKg / 1000).toFixed(1)}T`} icon="⚖️" trend="stable" trendValue="Across all units" />
        </div>

        {/* ── Profile Summary Banner ── */}
        {user?.profile && (
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-3xl">🏪</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground">{facilityName}</div>
                  <div className="text-xs text-muted-foreground">{user?.location}</div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-1 text-xs flex-1">
                  {[
                    { l: "🏗️ Type", v: storageType },
                    { l: "⚖️ Capacity", v: `${storageCapTon}T` },
                    { l: "🌡️ Temp Range", v: tempRange },
                    { l: "🔢 Units/Cells", v: unitsCount },
                    { l: "₹ Rate/Ton/Day", v: ratePerTonDay ? `₹${ratePerTonDay}` : "—" },
                    { l: "🛡️ Insured", v: insured },
                    { l: "📜 FSSAI", v: fssaiNo || "—" },
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
              📅 Schedule & Capacity
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                  {activeCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              📋 Booking Requests
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="facilities">🏪 Facilities</TabsTrigger>
            <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════════════
              TAB: SCHEDULE & CAPACITY
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="schedule" className="mt-4 space-y-5">

            {/* Capacity per unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STORAGE_UNITS.map(unit => {
                const scheduledKg = unitLoads[unit.id] || 0;
                const totalUsedKg = unit.used + scheduledKg;
                const usedPct = Math.min(100, Math.round((totalUsedKg / unit.capacity) * 100));
                const remainingKg = Math.max(0, unit.capacity - totalUsedKg);
                const isNearFull = usedPct >= 80;

                return (
                  <Card key={unit.id} className={`border ${isNearFull ? "border-destructive/30 bg-destructive/3" : "border-primary/20 bg-primary/3"}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{TYPE_ICON[unit.type]}</span>
                            <span className="font-semibold text-sm">{unit.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">📍 {unit.location} · 🌡️ {unit.temp}</div>
                        </div>
                        <Badge className={`text-xs ${isNearFull ? "bg-destructive/10 text-destructive border border-destructive/30" : "bg-primary/10 text-primary border border-primary/30"}`}>
                          {isNearFull ? "⚠️ Near Full" : "🟢 Available"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        {[
                          { l: "Total", v: `${(unit.capacity / 1000).toFixed(0)}T` },
                          { l: "Booked", v: `${(totalUsedKg / 1000).toFixed(1)}T`, primary: true },
                          { l: "Free", v: `${(remainingKg / 1000).toFixed(1)}T`, accent: remainingKg > 0 },
                        ].map(s => (
                          <div key={s.l} className="bg-background rounded-lg p-2 border border-border">
                            <div className={`font-bold text-base ${s.primary ? "text-primary" : s.accent ? "text-foreground" : "text-muted-foreground"}`}>{s.v}</div>
                            <div className="text-muted-foreground text-[10px]">{s.l}</div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Utilisation</span>
                          <span className={`font-semibold ${isNearFull ? "text-destructive" : "text-primary"}`}>{usedPct}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div className={`h-3 rounded-full transition-all ${isNearFull ? "bg-destructive" : usedPct > 50 ? "bg-primary" : "bg-primary/60"}`}
                            style={{ width: `${usedPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{unit.used.toLocaleString()} kg existing</span>
                          {scheduledKg > 0 && <span className="text-primary">+{scheduledKg.toLocaleString()} kg scheduled</span>}
                        </div>
                      </div>

                      {remainingKg > 0 && (
                        <div className="text-[10px] bg-background border border-border rounded px-2 py-1.5 text-muted-foreground">
                          💡 <strong>{remainingKg.toLocaleString()} kg</strong> available for new bookings · ₹{unit.price}/kg/mo
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Analytics charts */}
            {approvedBookings.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">📊 Intake by Check-in Date</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={dailyData} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} unit="kg" width={50} />
                        <Tooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
                          formatter={(v: number) => [`${v} kg`, "Load"]}
                        />
                        <Bar dataKey="totalKg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">🌾 Crop Mix (by kg)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={cropPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                          {cropPieData.map((entry, i) => (
                            <Cell key={entry.name} fill={CROP_COLORS[entry.name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`${v} kg`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Day-by-day intake schedule */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">📅 Confirmed Intake Schedule</CardTitle>
                  <Badge variant="outline" className="text-xs">{approvedBookings.length} confirmed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {approvedBookings.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <div className="text-4xl mb-3">🏪</div>
                    <p>No confirmed bookings yet. Approve requests to build your schedule.</p>
                  </div>
                ) : (
                  Object.entries(byDate).map(([date, entries]) => {
                    const dayKg = entries.reduce((s, b) => s + b.weightKg, 0);
                    const dateLabel = new Date(date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
                    return (
                      <div key={date} className="border border-border rounded-xl overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2.5 flex items-center justify-between border-b border-border">
                          <div className="flex items-center gap-2">
                            <span>📦</span>
                            <span className="font-semibold text-sm">{dateLabel}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">⚖️ {(dayKg / 1000).toFixed(1)}T intake</span>
                        </div>
                        <div className="divide-y divide-border">
                          {entries.map(b => {
                            const unit = STORAGE_UNITS.find(u => u.id === b.unitId);
                            return (
                              <div key={b.id} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                                <span className="text-xl mt-0.5">{TYPE_ICON[b.storageType]}</span>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm">{b.unitName}</span>
                                    <Badge variant="outline" className={`text-[10px] ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                                    <span>🧑‍🌾 {b.farmerName}</span>
                                    <span>📦 {b.crop} · {b.weightKg >= 1000 ? `${(b.weightKg / 1000).toFixed(1)}T` : `${b.weightKg}kg`}</span>
                                    <span className="text-primary font-medium">💵 ₹{b.estimatedCost.toLocaleString()}</span>
                                    <span>→ out {b.checkOutDate}</span>
                                  </div>
                                </div>
                                {b.status === "approved" && (
                                  <Button size="sm" variant="outline" className="text-[10px] h-7 border-primary/30 text-primary"
                                    onClick={() => { completeBooking(b.id); toast({ title: "✅ Marked as completed" }); }}>
                                    Mark Out
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-dashed border-border">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-semibold">💡 Storage Management Tips</div>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• <strong>Cluster similar crops together</strong> — onion and potato tolerate ambient; tomato and leafy veg need cold.</li>
                  <li>• <strong>Keep 10–15% buffer space</strong> in each unit for emergency intake from local farmers.</li>
                  <li>• <strong>Monitor humidity every 48 hours</strong> — spike above 85% triggers mold risk in grains.</li>
                  <li>• <strong>FIFO rotation</strong> — first in, first out to minimise spoilage losses.</li>
                  <li>• Reject bookings for incompatible crops (e.g., ethylene-producing tomatoes near apples).</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: BOOKING REQUESTS
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="requests" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Farmer Storage Requests</h3>
              <Badge className="bg-destructive/10 text-destructive border border-destructive/20">{pendingCount} Pending</Badge>
            </div>

            {bookings.length === 0 && (
              <Card className="border-dashed border-border">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  <div className="text-4xl mb-3">📋</div>
                  <p>No booking requests yet.</p>
                </CardContent>
              </Card>
            )}

            {bookings.map(b => {
              const isPending = b.status === "pending";
              const isActioned = !isPending;
              return (
                <Card key={b.id} className={`border-2 transition-all ${
                  b.status === "approved" || b.status === "active" ? "border-primary/40 bg-primary/5"
                  : b.status === "rejected" ? "border-destructive/30 bg-destructive/5 opacity-60"
                  : "border-border"
                }`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                      <Badge variant="outline" className={`text-xs ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</Badge>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {TYPE_ICON[b.storageType]} {b.storageType}
                      </Badge>
                    </div>

                    <div className="font-semibold text-sm">{b.unitName} · <span className="text-muted-foreground font-normal text-xs">📍 {b.unitLocation}</span></div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                      <div><span className="text-muted-foreground">Farmer</span><br /><span className="font-medium">{b.farmerName}</span></div>
                      <div><span className="text-muted-foreground">Phone</span><br /><span className="font-medium">{b.farmerPhone}</span></div>
                      <div><span className="text-muted-foreground">Crop</span><br /><span className="font-medium">{b.crop}</span></div>
                      <div><span className="text-muted-foreground">Quantity</span><br /><span className="font-medium">{b.weightKg >= 1000 ? `${(b.weightKg / 1000).toFixed(1)}T` : `${b.weightKg}kg`}</span></div>
                      <div><span className="text-muted-foreground">Check-in</span><br /><span className="font-medium">{b.checkInDate}</span></div>
                      <div><span className="text-muted-foreground">Check-out</span><br /><span className="font-medium">{b.checkOutDate}</span></div>
                      <div><span className="text-muted-foreground">Duration</span><br /><span className="font-medium">{b.durationDays} days</span></div>
                      <div><span className="text-muted-foreground">Est. Revenue</span><br /><span className="font-semibold text-primary">₹{b.estimatedCost.toLocaleString()}</span></div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-muted-foreground italic">📝 Farmer note: {b.notes}</p>
                    )}

                    {b.managerNote && !isPending && (
                      <div className={`rounded px-3 py-2 text-xs border ${b.status === "rejected" ? "bg-destructive/10 border-destructive/30 text-destructive" : "bg-primary/5 border-primary/20 text-foreground"}`}>
                        💬 Your note: {b.managerNote}
                      </div>
                    )}

                    {isPending && (
                      <div className="mt-2 pt-3 border-t border-border space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Note to farmer (optional)</Label>
                          <Input
                            className="h-8 text-xs"
                            placeholder="e.g. Please arrive at 8 AM for check-in"
                            value={managerNotes[b.id] || ""}
                            onChange={e => setManagerNotes(p => ({ ...p, [b.id]: e.target.value }))}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-primary text-xs h-8 flex-1"
                            onClick={() => handleApprove(b.id)}>
                            ✅ Approve Booking
                          </Button>
                          <Button size="sm" variant="outline" className="text-xs h-8 border-destructive/50 text-destructive"
                            onClick={() => handleReject(b.id)}>
                            ✗ Decline
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: FACILITIES
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="facilities" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STORAGE_UNITS.map((unit) => {
                const scheduledExtra = unitLoads[unit.id] || 0;
                const totalUsed = unit.used + scheduledExtra;
                const usedPct = Math.round((totalUsed / unit.capacity) * 100);
                const available = unit.capacity - totalUsed;
                return (
                  <Card key={unit.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{unit.name}</h3>
                          <p className="text-xs text-muted-foreground">📍 {unit.location}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {TYPE_ICON[unit.type]} {unit.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Capacity</div><div className="font-medium">{unit.capacity.toLocaleString()} kg</div></div>
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Available</div><div className={`font-medium ${available < 200 ? "text-destructive" : "text-primary"}`}>{available.toLocaleString()} kg</div></div>
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Rate</div><div className="font-medium">₹{unit.price}/kg/m</div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Occupancy</span>
                          <span className={`font-medium ${usedPct > 80 ? "text-destructive" : "text-primary"}`}>{Math.min(100, usedPct)}%</span>
                        </div>
                        <Progress value={Math.min(100, usedPct)} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">🌡️ {unit.temp}</div>
                        <Badge variant="outline" className={`text-xs ${usedPct >= 95 ? "bg-destructive/10 text-destructive border-destructive/30" : "bg-primary/10 text-primary border-primary/30"}`}>
                          {usedPct >= 95 ? "🔴 Full" : scheduledExtra > 0 ? `+${(scheduledExtra / 1000).toFixed(1)}T scheduled` : "🟢 Open"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════
              TAB: INVENTORY
          ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="inventory" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <StatCard title="Items Near Expiry" value="1 Batch" icon="⚠️" subtext="FarmSafe Karimnagar" />
              <StatCard title="Total Stored" value="8,200 kg" icon="📦" />
              <StatCard title="Spoilage Risk" value="LOW-MED" icon="🌡️" subtext="Monitor Onion batch" />
            </div>

            {/* Active booking inventory */}
            {approvedBookings.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">📋 Live Booking Inventory</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>{["Booking ID", "Farmer", "Facility", "Crop", "Qty", "Check-in", "Check-out", "Status"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                        ))}</tr>
                      </thead>
                      <tbody>
                        {approvedBookings.map(b => (
                          <tr key={b.id} className="border-b border-border hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                            <td className="px-4 py-3 text-xs">{b.farmerName}</td>
                            <td className="px-4 py-3 text-xs">{b.unitName}</td>
                            <td className="px-4 py-3 text-xs">{b.crop}</td>
                            <td className="px-4 py-3 text-xs">{b.weightKg.toLocaleString()} kg</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{b.checkInDate}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">{b.checkOutDate}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-xs ${STATUS_STYLE[b.status]}`}>{STATUS_LABEL[b.status]}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Static inventory */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">🏪 Existing Inventory</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Facility", "Crop", "Quantity", "Date Entered", "Safe Until", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {STATIC_INVENTORY.map(item => (
                        <tr key={item.crop + item.facility} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">{item.facility}</td>
                          <td className="px-4 py-3">{item.crop}</td>
                          <td className="px-4 py-3">{item.qty.toLocaleString()} kg</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.entered}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.safeUntil}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${item.status === "good" ? "bg-primary/10 text-primary border-primary/30" : "bg-accent/20 text-accent-foreground border-accent/30"}`}>
                              {item.status === "good" ? "✅ Good" : "⚠️ Alert"}
                            </Badge>
                          </td>
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
