import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRole, AppRole } from "@/context/RoleContext";

// ── Role definitions with preview features ───────────────────────────────────
const ROLES = [
  {
    id: "farmer" as AppRole,
    icon: "👨‍🌾", label: "Farmer", tagline: "Grow smarter. Sell better.", path: "/farmer",
    color: "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10",
    activeColor: "border-primary bg-primary/10 ring-2 ring-primary/30",
    badgeClass: "bg-primary text-primary-foreground",
    name: "Ramesh Kumar", location: "Warangal, Telangana",
    features: [
      { icon: "🌾", name: "AI Harvest Readiness Score" },
      { icon: "📈", name: "Crop Price Forecasting" },
      { icon: "🌡️", name: "Spoilage Risk Meter" },
      { icon: "🤝", name: "Direct Buyer Negotiation" },
      { icon: "🏪", name: "Storage Unit Booking" },
      { icon: "🚚", name: "Transport Request & Tracking" },
      { icon: "💰", name: "Loan Applications" },
      { icon: "📜", name: "Digital Quality Certificates" },
    ],
    dashboardDesc: "Your personalised farm dashboard with live crop prices, harvest countdown, buyer offers and logistics — all in one place.",
  },
  {
    id: "buyer" as AppRole,
    icon: "🛒", label: "Buyer", tagline: "Source fresh. Trade smart.", path: "/marketplace",
    color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",
    activeColor: "border-agro-sky bg-agro-sky/10 ring-2 ring-agro-sky/30",
    badgeClass: "bg-agro-sky text-white",
    name: "Apex Supermarkets", location: "Hyderabad",
    features: [
      { icon: "🛒", name: "Live Crop Marketplace" },
      { icon: "📦", name: "Pre-book Harvest in Advance" },
      { icon: "💳", name: "Smart Escrow Payments" },
      { icon: "📊", name: "Price Trend Analytics" },
      { icon: "🏅", name: "Certified Quality Listings" },
      { icon: "🔔", name: "Supply Availability Alerts" },
    ],
    dashboardDesc: "Browse verified crop listings, lock in pre-harvest prices and track deliveries with full payment protection.",
  },
  {
    id: "transport" as AppRole,
    icon: "🚚", label: "Transport Owner", tagline: "Fill every trip. Maximize revenue.", path: "/transport",
    color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",
    activeColor: "border-secondary bg-secondary/10 ring-2 ring-secondary/30",
    badgeClass: "bg-secondary text-secondary-foreground",
    name: "Vijay Logistics", location: "Warangal",
    features: [
      { icon: "📋", name: "Farmer Booking Requests" },
      { icon: "💬", name: "Price Counter-Offer Chat" },
      { icon: "🗺️", name: "Smart Route Roadmap with ETAs" },
      { icon: "📅", name: "Date-wise Capacity Schedule" },
      { icon: "➕", name: "Extra Load Route Suggestions" },
      { icon: "📊", name: "Weekly Earnings Analytics" },
    ],
    dashboardDesc: "Accept bookings, negotiate prices, see your truck capacity by date and get AI suggestions for extra loads on your route.",
  },
  {
    id: "storage" as AppRole,
    icon: "🏪", label: "Storage Manager", tagline: "Maximise your cold chain assets.", path: "/storage",
    color: "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10",
    activeColor: "border-accent bg-accent/10 ring-2 ring-accent/30",
    badgeClass: "bg-accent text-accent-foreground",
    name: "CoolStore Facilities", location: "Hyderabad",
    features: [
      { icon: "📥", name: "Booking Request Approvals" },
      { icon: "📊", name: "Live Occupancy Gauges" },
      { icon: "🌡️", name: "Spoilage & Temperature Alerts" },
      { icon: "📅", name: "Date-wise Intake Schedule" },
      { icon: "💰", name: "Revenue & Occupancy Reports" },
      { icon: "🔔", name: "Expiry Contract Alerts" },
    ],
    dashboardDesc: "Manage cold storage, warehouse and silo bookings with real-time occupancy, spoilage monitoring and revenue analytics.",
  },
  {
    id: "finance" as AppRole,
    icon: "💰", label: "Finance Officer", tagline: "Fund the farm value chain.", path: "/finance",
    color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",
    activeColor: "border-secondary bg-secondary/10 ring-2 ring-secondary/30",
    badgeClass: "bg-secondary text-secondary-foreground",
    name: "Agri Finance Bank", location: "Hyderabad",
    features: [
      { icon: "📋", name: "Loan Application Review" },
      { icon: "🏦", name: "Kisan Credit Card Management" },
      { icon: "💳", name: "Subsidy & Scheme Disbursal" },
      { icon: "📊", name: "Portfolio Risk Analytics" },
      { icon: "🛡️", name: "Fasal Bima Claims" },
    ],
    dashboardDesc: "Process farmer loan applications with AI credit scoring, manage KCC issuance and track government scheme disbursal.",
  },
  {
    id: "fpo" as AppRole,
    icon: "🏛️", label: "FPO / Agri Officer", tagline: "Certify, monitor and empower.", path: "/fpo",
    color: "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10",
    activeColor: "border-primary bg-primary/10 ring-2 ring-primary/30",
    badgeClass: "bg-primary text-primary-foreground",
    name: "Dr. Suresh Rao", location: "Karimnagar, Telangana",
    features: [
      { icon: "📜", name: "Issue Digital Certifications" },
      { icon: "🗺️", name: "Farmer Cluster Map" },
      { icon: "📊", name: "Regional Yield Monitoring" },
      { icon: "🌾", name: "Government Scheme Routing" },
      { icon: "📢", name: "Advisory Broadcast to Farmers" },
    ],
    dashboardDesc: "Issue verifiable quality certificates, monitor farmer clusters and route eligible farmers to government schemes.",
  },
  {
    id: "analytics" as AppRole,
    icon: "📊", label: "Analyst", tagline: "Turn data into market intelligence.", path: "/analytics",
    color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",
    activeColor: "border-agro-sky bg-agro-sky/10 ring-2 ring-agro-sky/30",
    badgeClass: "bg-agro-sky text-white",
    name: "Market Research Team", location: "Hyderabad",
    features: [
      { icon: "📈", name: "30-day Price Trend Charts" },
      { icon: "🌦️", name: "Weather Impact Correlation" },
      { icon: "🗺️", name: "Regional Supply Heat Maps" },
      { icon: "📦", name: "Seasonal Demand Forecasts" },
      { icon: "♻️", name: "Waste Reduction Metrics" },
    ],
    dashboardDesc: "Access deep price forecasts, regional supply maps, demand predictions and waste analytics across the entire platform.",
  },
  {
    id: "admin" as AppRole,
    icon: "⚙️", label: "Admin", tagline: "Oversee and control the platform.", path: "/admin",
    color: "border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/10",
    activeColor: "border-destructive bg-destructive/10 ring-2 ring-destructive/30",
    badgeClass: "bg-destructive text-destructive-foreground",
    name: "Platform Admin", location: "AgroSense HQ",
    features: [
      { icon: "👥", name: "User Management (All Roles)" },
      { icon: "📊", name: "Platform KPI Live Dashboard" },
      { icon: "🛡️", name: "Fraud & Risk Monitoring" },
      { icon: "⚙️", name: "System Configuration" },
      { icon: "📋", name: "Full Audit Log Trail" },
    ],
    dashboardDesc: "Full platform oversight: manage all users, monitor KPIs, configure system parameters and review audit logs.",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useRole();
  const [selectedRole, setSelectedRole] = useState<AppRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = ROLES.find((r) => r.id === selectedRole);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedRole) { setError("Please select your role to continue."); return; }
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (activeRole) {
        setUser({ role: selectedRole, name: activeRole.name, location: activeRole.location, email });
        navigate(activeRole.path);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="py-4 px-4 flex items-center justify-between border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-primary text-lg">AgroSense</span>
          <span className="text-muted-foreground text-sm hidden sm:inline ml-1">Predictive Intelligence</span>
        </Link>
        <div className="text-xs text-muted-foreground">
          No account?{" "}
          <button type="button" className="text-primary underline underline-offset-2 hover:text-primary/80" onClick={() => navigate("/register")}>
            Register free
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">🔐 Secure Login</Badge>
            <h1 className="text-2xl font-bold text-foreground mb-1">Welcome Back to AgroSense</h1>
            <p className="text-muted-foreground text-sm">Select your role to preview your dashboard features, then sign in.</p>
          </div>

          {/* ── STEP 1: ROLE PICKER ──────────────────────────────────── */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</span>
              Select Your Role
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all duration-150 cursor-pointer",
                    selectedRole === role.id ? role.activeColor : role.color
                  )}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="font-semibold text-xs text-foreground leading-tight">{role.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">{role.tagline.split(".")[0]}</div>
                  {selectedRole === role.id && (
                    <Badge className={`mt-1.5 text-[9px] py-0 px-1.5 border-0 ${role.badgeClass}`}>✓ Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── ROLE FEATURE PREVIEW (shown when role selected) ──────── */}
          {activeRole && (
            <div className={`mb-5 rounded-2xl border-2 p-4 ${activeRole.activeColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{activeRole.icon}</span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{activeRole.label} Dashboard — What you'll get</h3>
                  <p className="text-xs text-muted-foreground">{activeRole.dashboardDesc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {activeRole.features.map((f) => (
                  <div key={f.name} className="flex items-center gap-2 bg-background/70 rounded-lg px-2.5 py-1.5 border border-border/50">
                    <span className="text-base flex-shrink-0">{f.icon}</span>
                    <span className="text-[11px] text-foreground font-medium leading-tight">{f.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 text-center">
                🔐 Sign in below to access all {activeRole.features.length} features with live data
              </p>
            </div>
          )}

          {/* ── STEP 2: LOGIN FORM ───────────────────────────────────── */}
          <Card className="border-border shadow-sm">
            <CardContent className="pt-5 pb-5 px-5">
              <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</span>
                Sign In to Your Account
              </p>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email / Mobile Number</Label>
                  <Input id="email" type="text" placeholder="Enter your email or phone" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">{error}</p>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    `🔐 Sign In${activeRole ? ` as ${activeRole.label}` : ""}`
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground pt-1">
                  Don't have an account?{" "}
                  <button type="button" className="text-primary underline underline-offset-2 hover:text-primary/80" onClick={() => navigate("/register")}>
                    Register here
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-3">
            🚀 Demo mode — any credentials work. Select a role and click Sign In.
          </p>
        </div>
      </div>
    </div>
  );
}
