import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import {
  DEMAND_TREND_DATA, PRICE_FORECAST, SUPPLY_HEATMAP, REGIONAL_PRODUCTION,
  WASTE_DATA, CROP_CLUSTER_ALERTS,
} from "@/data/mockData";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const HEATMAP_COLORS = (v: number) => {
  if (v >= 80) return "bg-destructive text-destructive-foreground";
  if (v >= 60) return "bg-accent text-accent-foreground";
  if (v >= 40) return "bg-primary/70 text-primary-foreground";
  if (v >= 20) return "bg-primary/40 text-primary-foreground";
  return "bg-muted text-muted-foreground";
};

const CROPS_IN_HEATMAP = ["tomato", "onion", "chilli", "potato", "turmeric"] as const;
type CropKey = typeof CROPS_IN_HEATMAP[number];

export default function Analytics() {
  return (
    <AppLayout title="Analytics Dashboard" subtitle="Price forecasts · Demand trends · Regional heatmap · Clustering alerts">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Tomato Forecast" value="₹35/kg" subtext="+25% in 2 weeks" icon="📈" trend="up" trendValue="+25%" highlight />
          <StatCard title="Highest Demand" value="Hyderabad" subtext="Festival season surge" icon="🔥" />
          <StatCard title="Oversupply Alert" value="Warangal" subtext="Tomato flooding risk" icon="⚠️" />
          <StatCard title="Best Opportunity" value="Chilli" subtext="Shortage in Nizamabad" icon="🌶️" trend="up" trendValue="+16%" />
        </div>

        {/* Demand Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Crop Demand Trends — Next 6 Months (MT)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={DEMAND_TREND_DATA}>
                <defs>
                  {["tomato", "onion", "chilli"].map((c, i) => (
                    <linearGradient key={c} id={`grad-${c}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={["hsl(0,75%,55%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)"][i]} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={["hsl(0,75%,55%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)"][i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="tomato" name="Tomato" stroke="hsl(0,75%,55%)" fill="url(#grad-tomato)" strokeWidth={2} />
                <Area type="monotone" dataKey="onion" name="Onion" stroke="hsl(25,26%,40%)" fill="url(#grad-onion)" strokeWidth={2} />
                <Area type="monotone" dataKey="chilli" name="Chilli" stroke="hsl(38,92%,50%)" fill="url(#grad-chilli)" strokeWidth={2} />
                <Area type="monotone" dataKey="potato" name="Potato" stroke="hsl(123,45%,34%)" fill="url(#grad-tomato)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Forecast */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Price Forecast — Current vs Predicted (₹/kg)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={PRICE_FORECAST} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="crop" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} unit="₹" />
                  <Tooltip formatter={(v) => [`₹${v}/kg`]} />
                  <Legend />
                  <Bar dataKey="current" name="Current Price" fill="hsl(25,26%,40%)" radius={[3,3,0,0]} />
                  <Bar dataKey="predicted" name="Predicted Price" fill="hsl(123,45%,34%)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Wastage stats */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Wastage Statistics — Waste vs Converted (kg)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={WASTE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="waste" name="Waste" fill="hsl(0,75%,55%)" radius={[3,3,0,0]} />
                  <Bar dataKey="converted" name="Converted" fill="hsl(123,45%,34%)" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Regional Supply Heatmap */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Regional Supply Heatmap — Supply Intensity (%)</CardTitle>
              <div className="flex gap-1 text-xs">
                <span className="bg-muted px-2 py-0.5 rounded">Low</span>
                <span className="bg-primary/40 text-primary-foreground px-2 py-0.5 rounded">Med</span>
                <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded">High</span>
                <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded">Over</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">District</th>
                    {CROPS_IN_HEATMAP.map((c) => (
                      <th key={c} className="px-3 py-2 text-xs font-medium text-muted-foreground capitalize text-center">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SUPPLY_HEATMAP.map((row) => (
                    <tr key={row.district}>
                      <td className="px-3 py-2 font-medium text-sm">{row.district}</td>
                      {CROPS_IN_HEATMAP.map((c) => {
                        const val = row[c as keyof typeof row] as number;
                        return (
                          <td key={c} className="px-3 py-2 text-center">
                            <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${HEATMAP_COLORS(val)}`}>
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Regional Production */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Regional Production Tracker (MT)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={REGIONAL_PRODUCTION}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                {["warangal", "karimnagar", "nizamabad", "adilabad", "khammam"].map((d, i) => (
                  <Area key={d} type="monotone" dataKey={d} name={d.charAt(0).toUpperCase() + d.slice(1)}
                    stroke={["hsl(123,45%,34%)", "hsl(25,26%,40%)", "hsl(38,92%,50%)", "hsl(200,80%,50%)", "hsl(0,75%,55%)"][i]}
                    fill="none" strokeWidth={2} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crop Cluster Alerts */}
        <div>
          <h3 className="text-sm font-semibold mb-3">🚨 Crop Clustering Alerts</h3>
          <div className="space-y-3">
            {CROP_CLUSTER_ALERTS.map((alert) => (
              <Card key={alert.district} className={`border-l-4 ${alert.severity === "high" ? "border-l-destructive" : alert.severity === "medium" ? "border-l-accent" : "border-l-primary"}`}>
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{alert.district}</span>
                      <Badge variant="outline" className="text-xs">{alert.crop}</Badge>
                      <Badge variant="outline" className={`text-xs ${alert.supply === "OVERSUPPLY" ? "bg-destructive/10 text-destructive" : alert.supply === "SHORTAGE" ? "bg-accent/20 text-accent-foreground" : "bg-agro-green-light text-primary"}`}>
                        {alert.supply}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{alert.farmerCount} farmers affected</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
