import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/shared/StatCard";
import { StarRating } from "@/components/shared/StarRating";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";
import { ADMIN_STATS, TRANSACTIONS, LOANS, FARMERS } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const USERS = [
  { id: 1, name: "Ramesh Kumar", role: "farmer", status: "active", lastActive: "2 hrs ago", crops: 2, transactions: 5 },
  { id: 2, name: "BigMart Superstore", role: "buyer", status: "active", lastActive: "1 hr ago", crops: 0, transactions: 12 },
  { id: 3, name: "Ravi Logistics", role: "transport", status: "active", lastActive: "30 min ago", crops: 0, transactions: 8 },
  { id: 4, name: "Sunita Devi", role: "farmer", status: "active", lastActive: "5 hrs ago", crops: 1, transactions: 3 },
  { id: 5, name: "Hotel Taj Residency", role: "buyer", status: "inactive", lastActive: "2 days ago", crops: 0, transactions: 4 },
  { id: 6, name: "AO Warangal District", role: "ao", status: "active", lastActive: "1 day ago", crops: 0, transactions: 0 },
];

const ALERTS = [
  { id: 1, type: "oversupply", message: "Tomato oversupply detected in Warangal — 234 farmers harvesting simultaneously", severity: "high", time: "2 hrs ago" },
  { id: 2, type: "storage", message: "ChillVault Hyderabad at 78% capacity — monitor closely", severity: "medium", time: "4 hrs ago" },
  { id: 3, type: "payment", message: "Escrow TXN002 — payment pending confirmation for 3 days", severity: "medium", time: "1 day ago" },
  { id: 4, type: "kyc", message: "2 farmer KYC documents pending AO approval", severity: "low", time: "2 days ago" },
];

const MONTHLY_REVENUE = [
  { month: "Jun", revenue: 2800000 }, { month: "Jul", revenue: 3100000 }, { month: "Aug", revenue: 2950000 },
  { month: "Sep", revenue: 3400000 }, { month: "Oct", revenue: 4250000 },
];

const ROLE_COLORS: Record<string, string> = {
  farmer: "bg-agro-green-light text-primary border-primary/30",
  buyer: "bg-agro-sky/10 text-agro-sky border-agro-sky/30",
  transport: "bg-agro-brown-light text-secondary border-secondary/30",
  ao: "bg-accent/20 text-accent-foreground border-accent/30",
};

export default function AdminPanel() {
  const { toast } = useToast();

  return (
    <AppLayout title="Admin Panel" subtitle="Platform overview · User management · Analytics · System health">
      <div className="space-y-6 animate-fade-in">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Farmers" value={ADMIN_STATS.totalFarmers.toLocaleString()} subtext="+247 this month" icon="👨‍🌾" trend="up" trendValue="+2% MoM" highlight />
          <StatCard title="Crops Listed" value={ADMIN_STATS.cropsListed.toLocaleString()} subtext="Active listings" icon="🌾" trend="up" trendValue="+142 this week" />
          <StatCard title="Total Revenue" value="₹4.25 Cr" subtext="Oct 2024" icon="💰" trend="up" trendValue="+25% vs Sep" />
          <StatCard title="Active Vehicles" value={ADMIN_STATS.activeVehicles} subtext="3 regions" icon="🚚" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Transactions" value={ADMIN_STATS.transactions.toLocaleString()} icon="💳" />
          <StatCard title="Storage Booked" value={`${ADMIN_STATS.storageBooked}%`} subtext="Platform average" icon="🏪" />
          <StatCard title="Waste Converted" value={`${ADMIN_STATS.wasteConverted}%`} subtext="Conversion rate" icon="♻️" trend="up" trendValue="+5% MoM" />
          <StatCard title="Loans Approved" value={ADMIN_STATS.loansApproved.toLocaleString()} subtext="Total value ₹12.4 Cr" icon="💰" />
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="transactions">💳 Transactions</TabsTrigger>
            <TabsTrigger value="loans">💰 Loan Approvals</TabsTrigger>
            <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
            <TabsTrigger value="revenue">📊 Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["User", "Role", "Status", "Last Active", "Activity", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {USERS.map((u) => (
                        <tr key={u.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {u.name.split(" ").slice(0,2).map(w => w[0]).join("")}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs capitalize ${ROLE_COLORS[u.role] || "bg-muted text-muted-foreground"}`}>{u.role}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${u.status === "active" ? "bg-agro-green-light text-primary border-primary/30" : "bg-muted text-muted-foreground"}`}>
                              {u.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{u.lastActive}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {u.crops > 0 && `${u.crops} crops · `}{u.transactions > 0 && `${u.transactions} txns`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-xs h-7 border-border" onClick={() => toast({ title: `Viewing ${u.name}` })}>View</Button>
                              <Button size="sm" variant="outline" className={`text-xs h-7 ${u.status === "active" ? "border-destructive text-destructive" : "border-primary text-primary"}`}
                                onClick={() => toast({ title: `${u.status === "active" ? "Suspended" : "Activated"} ${u.name}` })}>
                                {u.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["ID", "Buyer", "Farmer", "Crop", "Amount", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {TRANSACTIONS.map((tx) => (
                        <tr key={tx.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                          <td className="px-4 py-3">{tx.buyer}</td>
                          <td className="px-4 py-3">{tx.farmer}</td>
                          <td className="px-4 py-3">{tx.crop}</td>
                          <td className="px-4 py-3 font-medium text-primary">₹{tx.amount.toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${tx.status === "released" ? "bg-agro-green-light text-primary border-primary/30" : tx.status === "in_escrow" ? "bg-agro-sky/10 text-agro-sky border-agro-sky/30" : tx.status === "shipped" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                              {tx.status.replace("_", " ")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="border-border text-xs" onClick={() => toast({ title: "Report exported as CSV" })}>
                ⬇️ Export CSV
              </Button>
              <Button variant="outline" size="sm" className="border-border text-xs" onClick={() => toast({ title: "Report exported as PDF" })}>
                ⬇️ Export PDF
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="loans" className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>{["Farmer", "Amount", "Type", "Score", "Status", "Actions"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {LOANS.map((l) => (
                        <tr key={l.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">{l.farmer}</td>
                          <td className="px-4 py-3 font-medium text-primary">₹{l.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{l.score}</span>
                              <div className="w-16 h-1.5 bg-muted rounded-full">
                                <div className="h-1.5 bg-primary rounded-full" style={{ width: `${l.score}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs ${l.status === "approved" ? "bg-agro-green-light text-primary border-primary/30" : l.status === "pending" ? "bg-muted text-muted-foreground" : "bg-accent/20 text-accent-foreground border-accent/30"}`}>
                              {l.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {l.status !== "approved" && (
                              <div className="flex gap-1">
                                <Button size="sm" className="bg-primary text-xs h-7" onClick={() => toast({ title: `Loan approved for ${l.farmer}` })}>Approve</Button>
                                <Button size="sm" variant="outline" className="border-destructive text-destructive text-xs h-7" onClick={() => toast({ title: `Loan rejected` })}>Reject</Button>
                              </div>
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

          <TabsContent value="alerts" className="mt-4 space-y-3">
            {ALERTS.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${alert.severity === "high" ? "border-l-destructive" : alert.severity === "medium" ? "border-l-accent" : "border-l-primary"}`}>
                <CardContent className="p-4 flex flex-wrap gap-3 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className={`text-xs ${alert.severity === "high" ? "bg-destructive/10 text-destructive" : alert.severity === "medium" ? "bg-accent/20 text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{alert.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{alert.message}</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-border text-xs" onClick={() => toast({ title: "Alert marked as resolved" })}>
                    Resolve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Platform Revenue (₹)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={MONTHLY_REVENUE}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                    <Tooltip formatter={(v: number) => [`₹${(v / 100000).toFixed(2)}L`, "Revenue"]} />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(123,45%,34%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <VoiceAssistant />
    </AppLayout>
  );
}
