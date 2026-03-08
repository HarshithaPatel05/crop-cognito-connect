import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { WASTE_DATA, WASTE_BY_CROP } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const CONVERSION_OPTIONS = [
  { type: "Compost", icon: "🌱", desc: "Convert organic waste into organic compost for soil enrichment", pricePerKg: 8, color: "border-primary/40 bg-agro-green-light/20" },
  { type: "Animal Feed", icon: "🐄", desc: "Process vegetable waste into nutritional animal feed pellets", pricePerKg: 12, color: "border-secondary/40 bg-agro-brown-light/20" },
  { type: "Biofuel", icon: "⚡", desc: "Convert biomass waste to biogas or bioethanol energy", pricePerKg: 18, color: "border-accent/40 bg-accent/10" },
  { type: "Processed Food", icon: "🥫", desc: "Value-added processing: purees, dried products, pickles", pricePerKg: 25, color: "border-agro-sky/40 bg-agro-sky/5" },
];

const PIE_COLORS = ["hsl(123,45%,34%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)", "hsl(200,80%,50%)", "hsl(0,75%,55%)"];

export default function WasteManagement() {
  const { toast } = useToast();
  const [wasteQty, setWasteQty] = useState("");
  const [wasteCrop, setWasteCrop] = useState("");

  const totalWaste = WASTE_DATA.reduce((s, d) => s + d.waste, 0);
  const totalConverted = WASTE_DATA.reduce((s, d) => s + d.converted, 0);
  const conversionRate = Math.round((totalConverted / totalWaste) * 100);

  return (
    <AppLayout title="Waste Management" subtitle="Track · Convert · Profit from crop waste">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Waste Tracked" value={`${totalWaste.toLocaleString()} kg`} icon="♻️" highlight />
          <StatCard title="Converted" value={`${totalConverted.toLocaleString()} kg`} subtext={`${conversionRate}% conversion rate`} icon="✅" trend="up" trendValue="Best month: Oct" />
          <StatCard title="Estimated Earnings" value="₹2.4L" subtext="From waste conversion" icon="💰" trend="up" trendValue="+18% vs last month" />
          <StatCard title="Carbon Saved" value="8.2 T" subtext="CO₂ equivalent" icon="🌿" />
        </div>

        {/* Waste Logger */}
        <Card className="border-dashed border-primary/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">📝 Log Waste Quantity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1"><Label className="text-xs">Crop Type</Label><Input value={wasteCrop} onChange={(e) => setWasteCrop(e.target.value)} placeholder="e.g. Tomato" className="w-36" /></div>
              <div className="space-y-1"><Label className="text-xs">Quantity (kg)</Label><Input value={wasteQty} onChange={(e) => setWasteQty(e.target.value)} type="number" placeholder="0" className="w-28" /></div>
              <Button className="bg-primary" onClick={() => { toast({ title: `Waste logged: ${wasteQty}kg of ${wasteCrop}` }); setWasteQty(""); setWasteCrop(""); }}>
                Log Waste
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Options */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Convert Waste Into Value 💡</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONVERSION_OPTIONS.map((opt) => (
              <Card key={opt.type} className={`border-2 ${opt.color} hover:shadow-md transition-shadow`}>
                <CardContent className="p-4 space-y-3">
                  <div className="text-3xl">{opt.icon}</div>
                  <div>
                    <div className="font-bold text-sm">{opt.type}</div>
                    <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-primary">₹{opt.pricePerKg}/kg</span>
                    <span className="text-xs text-muted-foreground ml-1">conversion value</span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/60 rounded p-2">
                    Est. from 310kg waste: <span className="font-medium text-foreground">₹{(310 * opt.pricePerKg).toLocaleString()}</span>
                  </div>
                  <Button size="sm" className="w-full bg-primary text-xs" onClick={() => toast({ title: `${opt.type} conversion initiated!`, description: "Partner facility will contact you within 24 hours." })}>
                    Initiate Conversion
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Waste vs Converted (kg)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WASTE_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="waste" name="Total Waste" fill="hsl(0,75%,55%)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="converted" name="Converted" fill="hsl(123,45%,34%)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Waste by Crop Type</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={180}>
                  <PieChart>
                    <Pie data={WASTE_BY_CROP} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                      {WASTE_BY_CROP.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {WASTE_BY_CROP.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-muted-foreground flex-1">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
