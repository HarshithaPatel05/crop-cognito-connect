import { useState } from "react";
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

const ACTIVE_TRIPS = [
  {
    id: "TR-001", farmer: "Prakash Rao", from: "Nizamabad", to: "Chennai",
    crop: "Chilli", weight: "800kg", agreedPrice: 1400,
    status: "in-transit", progress: 65, eta: "4 hrs remaining",
    startTime: "06:00 AM", driver: "Vijay Kumar",
  },
  {
    id: "TR-002", farmer: "Anand Reddy", from: "Warangal", to: "Hyderabad",
    crop: "Tomato", weight: "2T", agreedPrice: 2200,
    status: "pickup", progress: 10, eta: "ETA 2 hrs",
    startTime: "09:00 AM", driver: "Self",
  },
];

const COMPLETED_TRIPS = [
  { id: "TR-098", farmer: "Laxmi Devi", route: "Karimnagar → Hyderabad", crop: "Onion", earned: 1800, rating: 5, date: "Oct 12" },
  { id: "TR-097", farmer: "Raju Nair", route: "Warangal → Pune", crop: "Turmeric", earned: 4200, rating: 4, date: "Oct 10" },
  { id: "TR-096", farmer: "Gopi Krishna", route: "Adilabad → Nagpur", crop: "Soybean", earned: 3100, rating: 5, date: "Oct 8" },
];

const LOAD_SHARE = [
  { farmer: "Sunita Devi", crop: "Onion", from: "Karimnagar", to: "Hyderabad", weight: "1.5T", date: "Oct 18", saving: "₹1,200", match: 92 },
  { farmer: "Meena Bai", crop: "Turmeric", from: "Adilabad", to: "Hyderabad", weight: "800kg", date: "Oct 21", saving: "₹900", match: 78 },
];

export default function TransportDashboard() {
  const { toast } = useToast();
  const { bookings, sendCounter, acceptBooking, rejectBooking } = useTransportBooking();

  const [myVehicle, setMyVehicle] = useState({
    type: "Large Truck", regNo: "TS 09 EA 4512", capacity: "10", available: "8",
    location: "Warangal, Telangana", routes: "Warangal, Karimnagar, Hyderabad, Chennai",
    pricePerKm: "45", pricePerTon: "320", minLoad: "500", maxLoad: "10000",
    availableFrom: "05:00", availableTo: "22:00",
    driverName: "Vijay Kumar", driverPhone: "99887 11223", status: "available",
  });

  const [negotiations, setNegotiations] = useState<Record<string, { counter: string; note: string }>>({});

  const handleCounterOffer = (id: string) => {
    const counter = negotiations[id]?.counter;
    if (!counter || isNaN(Number(counter))) {
      toast({ title: "Enter a valid counter price", variant: "destructive" });
      return;
    }
    sendCounter(id, Number(counter), negotiations[id]?.note || "");
    toast({ title: "💬 Counter Offer Sent", description: `Sent ₹${counter} as counter offer for ${id}.` });
  };

  const totalEarned = COMPLETED_TRIPS.reduce((s, t) => s + t.earned, 0);

  // Bookings that are actionable (not yet accepted/rejected by transport or resolved by farmer)
  const actionableBookings = bookings.filter(b =>
    ["pending", "counter-sent", "negotiating"].includes(b.status)
  );
  const newCount = bookings.filter(b => b.status === "pending").length;

  return (
    <AppLayout title="Transport Owner Dashboard" subtitle="Manage your vehicle, bookings & earnings">
      <div className="space-y-6 animate-fade-in">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="This Month Earned" value="₹18,400" icon="💵" trend="up" trendValue="+12% vs last month" highlight />
          <StatCard title="Pending Requests" value={String(newCount)} icon="📋" />
          <StatCard title="Active Trips" value={String(ACTIVE_TRIPS.length)} icon="🚚" trend="stable" trendValue="On route now" />
          <StatCard title="Avg Rating" value="4.8 ⭐" icon="🏆" trend="up" trendValue="Top rated driver" />
        </div>

        <Tabs defaultValue="requests">
          <TabsList className="flex-wrap h-auto gap-1">
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
            <TabsTrigger value="loadshare">🤝 Load Sharing</TabsTrigger>
            <TabsTrigger value="earnings">💰 Earnings</TabsTrigger>
          </TabsList>

          {/* ── Booking Requests ── */}
          <TabsContent value="requests" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Incoming Booking Requests</h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 border">{newCount} New</Badge>
            </div>

            {bookings.length === 0 && (
              <Card className="border-dashed border-border">
                <CardContent className="py-12 text-center text-muted-foreground text-sm">
                  <div className="text-4xl mb-3">📋</div>
                  <p>No booking requests yet. Farmers will appear here once they submit a transport request.</p>
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
                    ? "border-primary/40 bg-primary/3"
                  : b.status === "rejected" || b.status === "farmer-rejected"
                    ? "border-destructive/30 bg-destructive/3 opacity-60"
                  : isCounterSent
                    ? "border-accent/40 bg-accent/3"
                  : b.status === "pending"
                    ? "border-border"
                  : "border-border"
                }`}>
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
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

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-xs">
                      <div><span className="text-muted-foreground">Farmer</span><br /><span className="font-medium">{b.farmerName}</span></div>
                      <div><span className="text-muted-foreground">Phone</span><br /><span className="font-medium">{b.farmerPhone}</span></div>
                      <div><span className="text-muted-foreground">Route</span><br /><span className="font-medium">{b.pickupLocation} → {b.dropLocation}</span></div>
                      <div><span className="text-muted-foreground">Product / Load</span><br /><span className="font-medium">{b.product} · {b.weightKg >= 1000 ? `${b.weightKg/1000}T` : `${b.weightKg}kg`}</span></div>
                      <div><span className="text-muted-foreground">Date</span><br /><span className="font-medium">{b.date}</span></div>
                      <div><span className="text-muted-foreground">Pickup Time</span><br /><span className="font-medium">{b.time}</span></div>
                      <div><span className="text-muted-foreground">Farmer's Price</span><br /><span className="font-semibold text-primary">₹{b.offeredPrice}</span></div>
                      {b.counterPrice && (
                        <div><span className="text-muted-foreground">Your Counter</span><br /><span className="font-semibold text-accent-foreground">₹{b.counterPrice}</span></div>
                      )}
                    </div>

                    {b.notes && (
                      <p className="text-xs text-muted-foreground italic">📝 Farmer note: {b.notes}</p>
                    )}

                    {/* Action row */}
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
                            <Button size="sm" variant="outline"
                              className="text-xs h-8 border-accent/50 text-foreground"
                              onClick={() => handleCounterOffer(b.id)}>
                              💬 Counter ₹{neg.counter}
                            </Button>
                          )}
                          <Button size="sm" variant="outline"
                            className="text-xs h-8 border-destructive/50 text-destructive"
                            onClick={() => { rejectBooking(b.id); toast({ title: "❌ Booking Rejected", variant: "destructive" }); }}>
                            ✗ Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {isCounterSent && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        💬 Counter offer <span className="font-semibold text-foreground">₹{b.counterPrice}</span> sent — waiting for farmer to accept/decline.
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

          {/* ── Active Trips ── */}
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
                    <Button size="sm" className="bg-primary text-xs h-7" onClick={() => toast({ title: "📍 Location updated" })}>
                      Update Location
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-primary/30 text-primary" onClick={() => toast({ title: "✅ Marked as delivered!" })}>
                      Mark Delivered
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── My Vehicle ── */}
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
                          onChange={e => setMyVehicle(p => ({ ...p, [f.key]: e.target.value }))} />
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

          {/* ── Load Sharing ── */}
          <TabsContent value="loadshare" className="mt-4 space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm">
              <div className="font-semibold text-primary mb-1">💡 AI Load Matching</div>
              <p className="text-muted-foreground text-xs">Share loads with nearby farmers going to the same market. Fill your empty space and earn extra while splitting transport costs.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LOAD_SHARE.map((ls) => (
                <Card key={ls.farmer} className="border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{ls.farmer}</div>
                        <div className="text-xs text-muted-foreground">{ls.crop} · {ls.weight}</div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-primary text-xs mb-1">+{ls.saving}</Badge>
                        <div className="text-xs text-muted-foreground">{ls.match}% match</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">📍 {ls.from} → {ls.to} · 📅 {ls.date}</div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-primary text-xs"
                        onClick={() => toast({ title: "✅ Load accepted!", description: `Added ${ls.farmer}'s load to your trip.` })}>
                        Accept Load
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => toast({ title: "Skipped" })}>
                        Skip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Earnings ── */}
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
