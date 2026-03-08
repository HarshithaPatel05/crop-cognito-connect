import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AIRecommendationBox } from "@/components/shared/AIRecommendationBox";
import { WeatherWidget } from "@/components/shared/WeatherWidget";
import { HarvestReadinessScore } from "@/components/shared/HarvestReadinessScore";
import { SpoilageRiskMeter } from "@/components/shared/SpoilageRiskMeter";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { AI_RECOMMENDATIONS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useTransportBooking } from "@/context/TransportBookingContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PRICE_HISTORY = [
  { day: "Sep 20", price: 22 }, { day: "Sep 25", price: 24 }, { day: "Oct 1", price: 26 },
  { day: "Oct 5", price: 25 }, { day: "Oct 10", price: 28 }, { day: "Oct 15", price: 32 },
];

const QUICK_ACTIONS = [
  { icon: "📋", label: "List Crop for Sale" },
  { icon: "🚚", label: "Request Transport" },
  { icon: "💰", label: "Apply for Loan" },
  { icon: "📸", label: "Upload Crop Image" },
  { icon: "🏪", label: "Book Storage" },
  { icon: "📜", label: "View Certificates" },
];

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending:          { label: "⏳ Pending",          color: "bg-muted text-muted-foreground" },
  "counter-sent":   { label: "💬 Counter Received", color: "bg-accent/20 text-foreground border-accent/40" },
  accepted:         { label: "✅ Accepted",          color: "bg-primary/10 text-primary border-primary/30" },
  rejected:         { label: "❌ Rejected",          color: "bg-destructive/10 text-destructive border-destructive/30" },
  "farmer-accepted":{ label: "🎉 Trip Confirmed",   color: "bg-primary/10 text-primary border-primary/30" },
  "farmer-rejected":{ label: "✗ You Declined",      color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const CROPS_LIST = ["Tomato", "Onion", "Potato", "Chilli", "Turmeric", "Rice", "Wheat", "Millet", "Pulses", "Maize", "Soybean", "Other"];

interface BookingForm {
  product: string;
  customProduct: string;
  weightKg: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  time: string;
  offeredPrice: string;
  notes: string;
  phone: string;
}

const EMPTY_FORM: BookingForm = {
  product: "", customProduct: "", weightKg: "", pickupLocation: "",
  dropLocation: "", date: "", time: "", offeredPrice: "", notes: "", phone: "",
};

export default function FarmerDashboard() {
  const { toast } = useToast();
  const { bookings, addBooking, farmerAccept, farmerReject } = useTransportBooking();

  const [smsCmd, setSmsCmd] = useState("");
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState("overview");

  const [farmData, setFarmData] = useState({
    name: "Ramesh Kumar", village: "Warangal", crop: "Tomato", variety: "Hybrid F1",
    area: "3.5", sowingDate: "2024-07-15", harvestDate: "2024-10-15",
  });

  // Only show bookings belonging to the logged-in farmer (mock: Ramesh Kumar)
  const myBookings = bookings.filter(b => b.farmerName === "Ramesh Kumar");
  const pendingCounter = myBookings.filter(b => b.status === "counter-sent").length;

  const handleSMS = () => {
    if (!smsCmd.trim()) return;
    toast({ title: "SMS Command Processed ✅", description: `Data updated from: "${smsCmd}"` });
    setSmsCmd("");
  };

  const handleAction = (label: string) => {
    if (label === "Request Transport") {
      setShowBookDialog(true);
      return;
    }
    toast({ title: `${label}`, description: "Feature initiated successfully" });
  };

  const setF = (key: keyof BookingForm, val: string) =>
    setForm(p => ({ ...p, [key]: val }));

  const handleSubmitBooking = () => {
    const product = form.product === "Other" ? form.customProduct : form.product;
    if (!product || !form.weightKg || !form.pickupLocation || !form.dropLocation || !form.date || !form.time || !form.offeredPrice || !form.phone) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    addBooking({
      farmerName: farmData.name,
      farmerPhone: form.phone,
      product,
      weightKg: Number(form.weightKg),
      pickupLocation: form.pickupLocation,
      dropLocation: form.dropLocation,
      date: form.date,
      time: form.time,
      offeredPrice: Number(form.offeredPrice),
      notes: form.notes,
    });
    toast({ title: "🚚 Transport Booking Submitted!", description: "Transport owners will respond shortly." });
    setForm(EMPTY_FORM);
    setShowBookDialog(false);
    setActiveTab("bookings");
  };

  return (
    <AppLayout title="Farmer Dashboard" subtitle="Ramesh Kumar · Warangal · Tomato Farm">
      <div className="space-y-6 animate-fade-in">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Expected Yield" value="8.75 T" subtext="3.5 acres × 2.5T/acre" icon="🌾" trend="up" trendValue="+12% vs last season" highlight />
          <StatCard title="Market Price" value="₹28/kg" subtext="Predicted ₹35/kg in 2 weeks" icon="📈" trend="up" trendValue="+25% forecast" />
          <StatCard title="Demand Forecast" value="HIGH" subtext="Hyderabad, Bangalore markets" icon="🔥" trend="up" trendValue="Festival season demand" />
          <StatCard title="Days to Harvest" value="7 days" subtext="Oct 15, 2024" icon="📅" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted flex-wrap h-auto gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="bookings" className="relative">
                  🚚 My Bookings
                  {pendingCounter > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-foreground text-[9px] font-bold rounded-full px-1 leading-4 min-w-[16px] text-center">
                      {pendingCounter}
                    </span>
                  )}
                </TabsTrigger>
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
                            <stop offset="5%" stopColor="hsl(123,45%,34%)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(123,45%,34%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[18, 36]} unit="₹" />
                        <Tooltip formatter={(v) => [`₹${v}/kg`, "Price"]} />
                        <Area type="monotone" dataKey="price" stroke="hsl(123,45%,34%)" fill="url(#priceGrad)" strokeWidth={2} />
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

              {/* ── My Bookings ── */}
              <TabsContent value="bookings" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">My Transport Bookings</h3>
                  <Button size="sm" className="bg-primary text-xs h-8" onClick={() => setShowBookDialog(true)}>
                    + New Booking
                  </Button>
                </div>

                {myBookings.length === 0 && (
                  <Card className="border-dashed border-border">
                    <CardContent className="py-12 text-center text-muted-foreground text-sm">
                      <div className="text-4xl mb-3">🚚</div>
                      <p>No transport bookings yet.</p>
                      <Button size="sm" className="mt-4 bg-primary" onClick={() => setShowBookDialog(true)}>
                        Book Transport Now
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {myBookings.map((b) => {
                  const meta = STATUS_META[b.status] || STATUS_META["pending"];
                  const isCounter = b.status === "counter-sent";
                  const isResolved = ["accepted", "rejected", "farmer-accepted", "farmer-rejected"].includes(b.status);

                  return (
                    <Card key={b.id} className={`border-2 transition-all ${
                      isCounter ? "border-accent/50 bg-accent/5"
                      : b.status === "farmer-accepted" ? "border-primary/40 bg-primary/5"
                      : b.status === "rejected" || b.status === "farmer-rejected" ? "border-destructive/30 opacity-70"
                      : "border-border"
                    }`}>
                      <CardContent className="p-4 space-y-3">
                        {/* Header row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{b.id}</span>
                            <Badge variant="outline" className={`text-xs ${meta.color}`}>{meta.label}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{b.date} · {b.time}</span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
                          <div><span className="text-muted-foreground">Product</span><br /><span className="font-medium">{b.product}</span></div>
                          <div><span className="text-muted-foreground">Load</span><br /><span className="font-medium">{b.weightKg >= 1000 ? `${b.weightKg / 1000}T` : `${b.weightKg}kg`}</span></div>
                          <div><span className="text-muted-foreground">From</span><br /><span className="font-medium">{b.pickupLocation}</span></div>
                          <div><span className="text-muted-foreground">To</span><br /><span className="font-medium">{b.dropLocation}</span></div>
                          <div><span className="text-muted-foreground">Your Offer</span><br /><span className="font-semibold text-primary">₹{b.offeredPrice}</span></div>
                          {b.counterPrice && (
                            <div><span className="text-muted-foreground">Counter Price</span><br /><span className="font-semibold text-accent-foreground">₹{b.counterPrice}</span></div>
                          )}
                        </div>

                        {/* Counter note */}
                        {isCounter && b.counterNote && (
                          <div className="bg-accent/10 rounded-lg px-3 py-2 text-xs text-foreground border border-accent/30">
                            💬 Transport owner's note: <span className="font-medium">{b.counterNote}</span>
                          </div>
                        )}

                        {/* Counter-offer action buttons */}
                        {isCounter && (
                          <div className="pt-2 border-t border-border flex gap-2 flex-wrap items-center">
                            <p className="text-xs text-muted-foreground flex-1">
                              Transport owner wants <span className="font-semibold text-foreground">₹{b.counterPrice}</span> (you offered ₹{b.offeredPrice})
                            </p>
                            <Button size="sm" className="bg-primary text-xs h-8"
                              onClick={() => { farmerAccept(b.id); toast({ title: "✅ Counter accepted!", description: `Trip confirmed for ₹${b.counterPrice}` }); }}>
                              ✅ Accept ₹{b.counterPrice}
                            </Button>
                            <Button size="sm" variant="outline"
                              className="text-xs h-8 border-destructive/50 text-destructive"
                              onClick={() => { farmerReject(b.id); toast({ title: "❌ Counter declined", variant: "destructive" }); }}>
                              ✗ Decline
                            </Button>
                          </div>
                        )}

                        {b.status === "farmer-accepted" && (
                          <div className="text-xs text-primary font-medium pt-1 border-t border-primary/20">
                            🎉 Trip confirmed at ₹{b.counterPrice || b.offeredPrice} — transport owner will contact you soon.
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
                        <Input
                          value={(farmData as any)[f.key]}
                          onChange={(e) => setFarmData(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="text-sm"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <Button className="w-full bg-primary" onClick={() => toast({ title: "Farm details saved ✅" })}>
                        Save Farm Details
                      </Button>
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
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🚚</span> Book Transport
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Product */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-xs">Product / Crop *</Label>
                <Select value={form.product} onValueChange={(v) => setF("product", v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROPS_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {form.product === "Other" && (
                <div className="space-y-1">
                  <Label className="text-xs">Specify Crop *</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Brinjal" value={form.customProduct} onChange={e => setF("customProduct", e.target.value)} />
                </div>
              )}

              {/* Weight */}
              <div className="space-y-1">
                <Label className="text-xs">Total Load Weight (kg) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 3500" value={form.weightKg} onChange={e => setF("weightKg", e.target.value)} />
              </div>
            </div>

            {/* Route */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Warangal" value={form.pickupLocation} onChange={e => setF("pickupLocation", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Drop Location *</Label>
                <Input className="h-9 text-sm" placeholder="e.g. Hyderabad" value={form.dropLocation} onChange={e => setF("dropLocation", e.target.value)} />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Pickup Date *</Label>
                <Input className="h-9 text-sm" type="date" value={form.date} onChange={e => setF("date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Pickup Time *</Label>
                <Input className="h-9 text-sm" type="time" value={form.time} onChange={e => setF("time", e.target.value)} />
              </div>
            </div>

            {/* Price & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Your Offered Price (₹) *</Label>
                <Input className="h-9 text-sm" type="number" placeholder="e.g. 2800" value={form.offeredPrice} onChange={e => setF("offeredPrice", e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Transport owner can counter this</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Phone Number *</Label>
                <Input className="h-9 text-sm" type="tel" placeholder="e.g. 98765 43210" value={form.phone} onChange={e => setF("phone", e.target.value)} />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label className="text-xs">Additional Notes</Label>
              <Input className="h-9 text-sm" placeholder="e.g. Urgent, festival delivery, handle with care..." value={form.notes} onChange={e => setF("notes", e.target.value)} />
            </div>

            {/* Summary */}
            {form.weightKg && form.offeredPrice && (
              <div className="bg-primary/5 rounded-lg p-3 text-xs border border-primary/20 space-y-1">
                <div className="font-medium text-primary">📋 Booking Summary</div>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>Load:</span><span className="text-foreground font-medium">{Number(form.weightKg) >= 1000 ? `${Number(form.weightKg)/1000}T` : `${form.weightKg}kg`}</span>
                  <span>Route:</span><span className="text-foreground font-medium">{form.pickupLocation || "—"} → {form.dropLocation || "—"}</span>
                  <span>Offered:</span><span className="text-foreground font-medium">₹{form.offeredPrice}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowBookDialog(false)}>Cancel</Button>
            <Button size="sm" className="bg-primary" onClick={handleSubmitBooking}>Submit Booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <VoiceAssistant />
    </AppLayout>
  );
}
