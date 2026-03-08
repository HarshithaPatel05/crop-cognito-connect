import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpoilageRiskMeter } from "@/components/shared/SpoilageRiskMeter";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { STORAGE_UNITS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const MY_BOOKINGS = [
  { id: "STR001", facility: "AgroStore Warangal", crop: "Tomato", qty: "2,000 kg", checkin: "Oct 10", checkout: "Oct 20", daysLeft: 12, risk: "LOW" as const, temp: "4°C" },
  { id: "STR002", facility: "FarmSafe Karimnagar", crop: "Onion", qty: "5,000 kg", checkin: "Sep 28", checkout: "Oct 28", daysLeft: 3, risk: "MEDIUM" as const, temp: "Ambient" },
];

const INVENTORY = [
  { facility: "AgroStore Warangal", crop: "Tomato", qty: 2000, entered: "Oct 10", safeUntil: "Oct 22", status: "good" },
  { facility: "FarmSafe Karimnagar", crop: "Onion", qty: 5000, entered: "Sep 28", safeUntil: "Oct 28", status: "alert" },
  { facility: "GrainStore Nizamabad", crop: "Millet", qty: 1200, entered: "Sep 15", safeUntil: "Dec 15", status: "good" },
];

export default function StorageDashboard() {
  const { toast } = useToast();

  return (
    <AppLayout title="Storage Dashboard" subtitle="Cold storage · Warehouses · Inventory tracking">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Storage Booked" value="2 Units" icon="🏪" highlight />
          <StatCard title="Total Inventory" value="8,200 kg" icon="📦" />
          <StatCard title="Cold Storage %" value="68%" subtext="ChillVault Hyderabad" icon="❄️" trend="up" trendValue="Near capacity" />
          <StatCard title="Expiring Soon" value="1 Batch" subtext="Within 3 days" icon="⚠️" />
        </div>

        <Tabs defaultValue="facilities">
          <TabsList>
            <TabsTrigger value="facilities">🏪 Available Facilities</TabsTrigger>
            <TabsTrigger value="bookings">📋 My Bookings</TabsTrigger>
            <TabsTrigger value="inventory">📦 Inventory</TabsTrigger>
          </TabsList>

          <TabsContent value="facilities" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STORAGE_UNITS.map((unit) => {
                const usedPct = Math.round((unit.used / unit.capacity) * 100);
                const available = unit.capacity - unit.used;
                return (
                  <Card key={unit.id} className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{unit.name}</h3>
                          <p className="text-xs text-muted-foreground">📍 {unit.location}</p>
                        </div>
                        <Badge variant="outline" className={`text-xs ${unit.type === "Cold Storage" ? "bg-agro-sky/10 text-agro-sky border-agro-sky/30" : unit.type === "Silo" ? "bg-agro-brown-light text-secondary border-secondary/30" : "bg-muted text-muted-foreground"}`}>
                          {unit.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Capacity</div><div className="font-medium">{unit.capacity.toLocaleString()} kg</div></div>
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Available</div><div className="font-medium text-primary">{available.toLocaleString()} kg</div></div>
                        <div className="bg-muted rounded p-2"><div className="text-muted-foreground">Rate</div><div className="font-medium">₹{unit.price}/kg/m</div></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Occupancy</span>
                          <span className={`font-medium ${usedPct > 80 ? "text-destructive" : "text-primary"}`}>{usedPct}%</span>
                        </div>
                        <Progress value={usedPct} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">🌡️ {unit.temp}</div>
                        <Button size="sm" className="bg-primary text-xs" disabled={usedPct >= 95} onClick={() => toast({ title: `Booking request sent to ${unit.name}` })}>
                          {usedPct >= 95 ? "Full" : "Book Storage"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 space-y-4">
            {MY_BOOKINGS.map((b) => (
              <Card key={b.id} className={`border-2 ${b.daysLeft <= 5 ? "border-accent/50" : "border-border"}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{b.facility}</span>
                        <Badge variant="outline" className="text-xs">{b.id}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.crop} · {b.qty} · Temp: {b.temp}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Check-in: {b.checkin} → Check-out: {b.checkout}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {b.daysLeft <= 5 && (
                        <Badge className="bg-accent text-accent-foreground text-xs">⚠️ {b.daysLeft} days left</Badge>
                      )}
                      <SpoilageRiskMeter level={b.risk} compact />
                    </div>
                  </div>
                  {b.daysLeft <= 5 && (
                    <div className="mt-3 bg-accent/10 border border-accent/30 rounded p-2 text-xs text-accent-foreground">
                      ⚠️ Storage expiring soon. Move to market or extend booking.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="inventory" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Facility", "Crop", "Quantity", "Date Entered", "Safe Until", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {INVENTORY.map((item) => (
                        <tr key={item.crop + item.facility} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 text-sm">{item.facility}</td>
                          <td className="px-4 py-3">{item.crop}</td>
                          <td className="px-4 py-3">{item.qty.toLocaleString()} kg</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.entered}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.safeUntil}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${item.status === "good" ? "bg-agro-green-light text-primary border-primary/30" : "bg-accent/20 text-accent-foreground border-accent/30"}`}>
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
