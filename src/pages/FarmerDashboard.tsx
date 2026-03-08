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
import { AIRecommendationBox } from "@/components/shared/AIRecommendationBox";
import { WeatherWidget } from "@/components/shared/WeatherWidget";
import { HarvestReadinessScore } from "@/components/shared/HarvestReadinessScore";
import { SpoilageRiskMeter } from "@/components/shared/SpoilageRiskMeter";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { AI_RECOMMENDATIONS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
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

export default function FarmerDashboard() {
  const { toast } = useToast();
  const [smsCmd, setSmsCmd] = useState("");
  const [farmData, setFarmData] = useState({
    name: "Ramesh Kumar", village: "Warangal", crop: "Tomato", variety: "Hybrid F1",
    area: "3.5", sowingDate: "2024-07-15", harvestDate: "2024-10-15",
  });

  const handleSMS = () => {
    if (!smsCmd.trim()) return;
    toast({ title: "SMS Command Processed ✅", description: `Data updated from: "${smsCmd}"`, });
    setSmsCmd("");
  };

  const handleAction = (label: string) => {
    toast({ title: `${label}`, description: "Feature initiated successfully" });
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
            <Tabs defaultValue="overview">
              <TabsList className="bg-muted">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="register">Farm Details</TabsTrigger>
                <TabsTrigger value="market">Market Intel</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Crop Growth Status */}
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

                {/* Price trend chart */}
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

                {/* Quick Actions */}
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Quick Actions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {QUICK_ACTIONS.map((a) => (
                        <Button key={a.label} variant="outline" size="sm" className="h-auto py-3 flex-col gap-1 text-xs border-border hover:border-primary hover:bg-agro-green-light/20" onClick={() => handleAction(a.label)}>
                          <span className="text-xl">{a.icon}</span>
                          <span className="text-center leading-tight">{a.label}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* SMS Entry */}
                <Card className="border-dashed border-primary/40">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📱</span>
                      <CardTitle className="text-sm font-medium">SMS Data Entry</CardTitle>
                      <Badge variant="outline" className="text-xs ml-auto bg-agro-green-light text-primary border-primary/30">Low Connectivity Mode</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">Type SMS command to update dashboard:</p>
                    <div className="flex gap-2">
                      <Input
                        value={smsCmd}
                        onChange={(e) => setSmsCmd(e.target.value)}
                        placeholder='e.g. CROP TOMATO 2ACRE HARVEST OCT10'
                        className="text-xs font-mono"
                        onKeyDown={(e) => e.key === "Enter" && handleSMS()}
                      />
                      <Button size="sm" onClick={handleSMS} className="bg-primary">Send</Button>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {["CROP TOMATO 3ACRE", "HARVEST OCT15", "PRICE 28 KG"].map((ex) => (
                        <button key={ex} onClick={() => setSmsCmd(ex)} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground hover:bg-primary/10 transition-colors">{ex}</button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
                          <Badge variant="outline" className="text-xs bg-agro-green-light text-primary border-primary/30">{m.demand}</Badge>
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
      <VoiceAssistant />
    </AppLayout>
  );
}
