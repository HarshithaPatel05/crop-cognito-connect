import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { CERTIFICATIONS, CROP_CLUSTER_ALERTS, REGIONAL_PRODUCTION, FARMERS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PENDING_KYC = [
  { farmer: "Vijay Singh", village: "Khammam", doc: "Aadhaar + Land Records", submitted: "Oct 8" },
  { farmer: "Kavita Rao", village: "Warangal", doc: "Farmer ID", submitted: "Oct 10" },
];

const ADVISORIES = [
  { id: 1, region: "Warangal", type: "Oversupply Warning", message: "Tomato oversupply risk — advise farmers to stagger harvest by 2 weeks.", date: "Oct 10", severity: "high" },
  { id: 2, region: "Nizamabad", type: "Price Alert", message: "Chilli prices expected to rise 15% due to export demand. Advise farmers to hold stock.", date: "Oct 9", severity: "medium" },
  { id: 3, region: "All Districts", type: "Weather Advisory", message: "Heavy rainfall forecasted Oct 13-15. Farmers should harvest ripe crops immediately.", date: "Oct 8", severity: "high" },
];

const CLUSTER_TABLE = [
  { village: "Nallabelly", district: "Warangal", crop: "Tomato", farmers: 45, area: "180 acres", status: "oversupply" },
  { village: "Metpally", district: "Karimnagar", crop: "Onion", farmers: 32, area: "128 acres", status: "normal" },
  { village: "Bodhan", district: "Nizamabad", crop: "Chilli", farmers: 28, area: "112 acres", status: "shortage" },
  { village: "Khanapur", district: "Adilabad", crop: "Turmeric", farmers: 19, area: "76 acres", status: "normal" },
  { village: "Sattupally", district: "Khammam", crop: "Potato", farmers: 52, area: "260 acres", status: "oversupply" },
];

export default function FPOPortal() {
  const { toast } = useToast();
  const [certForm, setCertForm] = useState({ farmer: "", crop: "", type: "", notes: "" });
  const [advisory, setAdvisory] = useState("");

  return (
    <AppLayout title="FPO & Agricultural Officer Portal" subtitle="Cluster monitoring · Certifications · KYC approvals · Regional advisories">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Monitored Clusters" value="5" subtext="3 districts active" icon="🏘️" highlight />
          <StatCard title="Certifications Issued" value="3" subtext="This month" icon="📜" trend="up" trendValue="+1 this week" />
          <StatCard title="KYC Pending" value="2" subtext="Awaiting approval" icon="⏳" />
          <StatCard title="Active Advisories" value="3" subtext="2 high severity" icon="🚨" />
        </div>

        <Tabs defaultValue="clusters">
          <TabsList>
            <TabsTrigger value="clusters">🏘️ Crop Clusters</TabsTrigger>
            <TabsTrigger value="production">📊 Regional Production</TabsTrigger>
            <TabsTrigger value="certify">📜 Issue Certificate</TabsTrigger>
            <TabsTrigger value="certifications">📋 Certifications</TabsTrigger>
            <TabsTrigger value="advisory">📢 Advisories</TabsTrigger>
            <TabsTrigger value="kyc">🪪 KYC Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="clusters" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Village", "District", "Crop", "Farmers", "Area", "Status", "Action"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {CLUSTER_TABLE.map((row) => (
                        <tr key={row.village} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{row.village}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.district}</td>
                          <td className="px-4 py-3">{row.crop}</td>
                          <td className="px-4 py-3">{row.farmers}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.area}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${row.status === "oversupply" ? "bg-destructive/10 text-destructive border-destructive/30" : row.status === "shortage" ? "bg-accent/20 text-accent-foreground border-accent/30" : "bg-agro-green-light text-primary border-primary/30"}`}>
                              {row.status === "oversupply" ? "⚠️ Oversupply" : row.status === "shortage" ? "📉 Shortage" : "✅ Normal"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="outline" className="text-xs h-7 border-border" onClick={() => toast({ title: `Advisory issued for ${row.village}` })}>
                              Issue Advisory
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production" className="mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Regional Production Tracker (MT)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={REGIONAL_PRODUCTION}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    {["warangal", "karimnagar", "nizamabad", "adilabad", "khammam"].map((d, i) => (
                      <Area key={d} type="monotone" dataKey={d} name={d.charAt(0).toUpperCase() + d.slice(1)}
                        stroke={["hsl(123,45%,34%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)", "hsl(200,80%,50%)", "hsl(0,75%,55%)"][i]}
                        fill={["hsl(123,45%,34%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)", "hsl(200,80%,50%)", "hsl(0,75%,55%)"][i]}
                        fillOpacity={0.08} strokeWidth={2} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certify" className="mt-4">
            <Card className="max-w-lg">
              <CardHeader><CardTitle className="text-sm">Issue Digital Certificate</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs">Select Farmer</Label>
                  <Select onValueChange={(v) => setCertForm(p => ({ ...p, farmer: v }))}>
                    <SelectTrigger><SelectValue placeholder="Choose farmer" /></SelectTrigger>
                    <SelectContent>
                      {FARMERS.map((f) => <SelectItem key={f.id} value={f.name}>{f.name} — {f.village}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Crop</Label>
                  <Input placeholder="e.g. Tomato, Chilli" value={certForm.crop} onChange={(e) => setCertForm(p => ({ ...p, crop: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Certificate Type</Label>
                  <Select onValueChange={(v) => setCertForm(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="organic">🌿 Organic Certified</SelectItem>
                      <SelectItem value="gradeA">⭐ Grade A Quality</SelectItem>
                      <SelectItem value="govt">🏛️ Government Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Inspection Notes</Label>
                  <Input placeholder="Add inspection details..." value={certForm.notes} onChange={(e) => setCertForm(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <Button className="w-full bg-primary" onClick={() => toast({ title: "Certificate issued! ✅", description: `Digital certificate for ${certForm.farmer || "farmer"} issued successfully.` })}>
                  Issue Certificate
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Farmer", "Crop", "Type", "Issued By", "Valid Until", "Status"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {CERTIFICATIONS.map((c) => (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{c.farmer}</td>
                          <td className="px-4 py-3">{c.crop}</td>
                          <td className="px-4 py-3">{c.type}</td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{c.issuedBy}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.valid}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${c.status === "active" ? "bg-agro-green-light text-primary border-primary/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}>
                              {c.status === "active" ? "✅ Active" : "❌ Expired"}
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

          <TabsContent value="advisory" className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Post Regional Advisory</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <Label className="text-xs mb-1 block">Advisory Message</Label>
                  <Input value={advisory} onChange={(e) => setAdvisory(e.target.value)} placeholder="Enter advisory message for farmers..." />
                </div>
                <Button className="bg-primary" onClick={() => { toast({ title: "Advisory published! 📢" }); setAdvisory(""); }}>Publish</Button>
              </CardContent>
            </Card>
            <div className="space-y-3">
              {ADVISORIES.map((adv) => (
                <Card key={adv.id} className={`border-l-4 ${adv.severity === "high" ? "border-l-destructive" : "border-l-accent"}`}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <Badge variant="outline" className="text-xs border-border">{adv.region}</Badge>
                      <Badge variant="outline" className={`text-xs ${adv.severity === "high" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>{adv.type}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{adv.date}</span>
                    </div>
                    <p className="text-sm text-foreground">{adv.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kyc" className="mt-4 space-y-4">
            {PENDING_KYC.map((kyc) => (
              <Card key={kyc.farmer} className="border-accent/30">
                <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {kyc.farmer.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{kyc.farmer}</div>
                    <div className="text-xs text-muted-foreground">{kyc.village} · {kyc.doc}</div>
                    <div className="text-xs text-muted-foreground">Submitted: {kyc.submitted}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-primary text-xs" onClick={() => toast({ title: `KYC approved for ${kyc.farmer}` })}>✅ Approve</Button>
                    <Button size="sm" variant="outline" className="border-destructive text-destructive text-xs" onClick={() => toast({ title: `KYC rejected for ${kyc.farmer}` })}>Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
