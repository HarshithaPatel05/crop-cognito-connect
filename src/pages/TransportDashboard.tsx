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
import { VEHICLES } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const BOOKINGS = [
  { id: "TR001", farmer: "Ramesh Kumar", from: "Warangal", to: "Hyderabad", crop: "Tomato", weight: "3.5T", date: "Oct 15", status: "pending" },
  { id: "TR002", farmer: "Sunita Devi", from: "Karimnagar", to: "Hyderabad", crop: "Onion", weight: "2T", date: "Oct 18", status: "confirmed" },
  { id: "TR003", farmer: "Prakash Rao", from: "Nizamabad", to: "Chennai", crop: "Chilli", weight: "800kg", date: "Oct 20", status: "in-transit" },
];

const DELIVERIES = [
  { id: "DEL001", from: "Warangal", to: "Hyderabad", status: "delivered", progress: 100, eta: "Delivered Oct 12" },
  { id: "DEL002", from: "Karimnagar", to: "Hyderabad", status: "in-transit", progress: 65, eta: "ETA: 4 hours" },
  { id: "DEL003", from: "Nizamabad", to: "Chennai", status: "pickup", progress: 15, eta: "ETA: Oct 22" },
];

const LOAD_SHARE = [
  { farmer: "Sunita Devi", crop: "Onion", from: "Karimnagar", to: "Hyderabad", weight: "1.5T", date: "Oct 18", saving: "₹1,200" },
  { farmer: "Meena Bai", crop: "Turmeric", from: "Adilabad", to: "Hyderabad", weight: "800kg", date: "Oct 21", saving: "₹900" },
];

export default function TransportDashboard() {
  const { toast } = useToast();
  const [regForm, setRegForm] = useState({ type: "", capacity: "", location: "", route: "" });

  return (
    <AppLayout title="Transport Dashboard" subtitle="Vehicle management · Booking requests · Delivery tracking">
      <div className="space-y-6 animate-fade-in">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Available Vehicles" value="24" icon="🚚" trend="stable" trendValue="In your region" highlight />
          <StatCard title="Active Bookings" value="8" icon="📦" />
          <StatCard title="Deliveries Today" value="12" icon="✅" trend="up" trendValue="+3 from yesterday" />
          <StatCard title="Avg Distance" value="145 km" icon="📍" />
        </div>

        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles">🚚 Available Vehicles</TabsTrigger>
            <TabsTrigger value="bookings">📋 Booking Requests</TabsTrigger>
            <TabsTrigger value="tracking">📍 Delivery Tracking</TabsTrigger>
            <TabsTrigger value="loadshare">🤝 Load Sharing</TabsTrigger>
            <TabsTrigger value="register">➕ Register Vehicle</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLES.map((v) => (
                <Card key={v.id} className={`border-2 ${v.status === "available" ? "border-primary/30" : "border-muted"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="text-3xl">{v.type === "Refrigerated" ? "❄️🚚" : "🚚"}</div>
                      <Badge variant="outline" className={v.status === "available" ? "bg-agro-green-light text-primary border-primary/30" : "bg-muted text-muted-foreground border-border"}>
                        {v.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{v.owner}</div>
                      <div className="text-xs text-muted-foreground">{v.type} · {v.capacity}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">📍 {v.location}</div>
                    <div className="space-y-0.5">
                      {v.routes.map((r) => (
                        <Badge key={r} variant="outline" className="text-xs mr-1 border-border">{r}</Badge>
                      ))}
                    </div>
                    <StarRating rating={v.rating} />
                    {v.status === "available" && (
                      <Button size="sm" className="w-full bg-primary text-xs" onClick={() => toast({ title: `Vehicle booked: ${v.owner}` })}>
                        Book Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["ID", "Farmer", "Route", "Crop", "Weight", "Date", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {BOOKINGS.map((b) => (
                        <tr key={b.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs">{b.id}</td>
                          <td className="px-4 py-3">{b.farmer}</td>
                          <td className="px-4 py-3 text-xs">{b.from} → {b.to}</td>
                          <td className="px-4 py-3">{b.crop}</td>
                          <td className="px-4 py-3">{b.weight}</td>
                          <td className="px-4 py-3">{b.date}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${b.status === "confirmed" ? "bg-agro-green-light text-primary border-primary/30" : b.status === "in-transit" ? "bg-agro-sky/10 text-agro-sky border-agro-sky/30" : "bg-muted text-muted-foreground"}`}>
                              {b.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {b.status === "pending" && (
                              <Button size="sm" className="bg-primary text-xs h-7" onClick={() => toast({ title: "Booking accepted!" })}>Accept</Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="mt-4 space-y-4">
            {DELIVERIES.map((d) => (
              <Card key={d.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                      <span className="font-medium text-sm">{d.from} → {d.to}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{d.eta}</span>
                      <Badge variant="outline" className={`text-xs ${d.status === "delivered" ? "bg-agro-green-light text-primary" : d.status === "in-transit" ? "bg-agro-sky/10 text-agro-sky" : "bg-muted"}`}>{d.status}</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full transition-all duration-700" style={{ width: `${d.progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>📦 Pickup</span><span>🚚 In Transit</span><span>✅ Delivered</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="loadshare" className="mt-4 space-y-4">
            <div className="bg-agro-green-light/20 border border-primary/20 rounded-lg p-4 text-sm">
              <div className="font-semibold text-primary mb-1">💡 Save on Transport Costs</div>
              <p className="text-muted-foreground text-xs">Share loads with nearby farmers going to the same market. Split transport costs and reduce carbon footprint.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {LOAD_SHARE.map((ls) => (
                <Card key={ls.farmer} className="border-primary/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium text-sm">{ls.farmer}</div>
                        <div className="text-xs text-muted-foreground">{ls.crop} · {ls.weight}</div>
                      </div>
                      <Badge className="bg-primary text-xs">Save {ls.saving}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{ls.from} → {ls.to} · {ls.date}</div>
                    <Button size="sm" variant="outline" className="w-full border-primary/30 text-primary text-xs" onClick={() => toast({ title: "Load sharing request sent!" })}>
                      Request Load Share
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <Card className="max-w-lg">
              <CardHeader><CardTitle className="text-sm">Register Your Vehicle</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">Vehicle Type</Label>
                  <Select onValueChange={(v) => setRegForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mini">Mini Truck (1-3T)</SelectItem>
                      <SelectItem value="large">Large Truck (5-10T)</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated Van</SelectItem>
                      <SelectItem value="tempo">Tempo / Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label className="text-xs">Load Capacity</Label><Input placeholder="e.g. 5 Ton" /></div>
                <div className="space-y-1"><Label className="text-xs">Current Location</Label><Input placeholder="City / Village" /></div>
                <div className="space-y-1"><Label className="text-xs">Available Routes</Label><Input placeholder="e.g. Warangal → Hyderabad" /></div>
                <Button className="w-full bg-primary" onClick={() => toast({ title: "Vehicle registered! ✅" })}>Register Vehicle</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
