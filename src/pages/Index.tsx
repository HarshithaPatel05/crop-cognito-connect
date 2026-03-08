import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ── Role definitions with full feature sets ──────────────────────────────────
const ROLES = [
  {
    id: "farmer",
    icon: "👨‍🌾",
    title: "Farmer",
    tagline: "Grow smarter. Sell better.",
    color: "border-primary/40 hover:border-primary bg-primary/5",
    activeColor: "border-primary bg-primary/10 ring-2 ring-primary/30",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    accent: "text-primary",
    features: [
      { icon: "🌾", name: "AI Harvest Readiness", desc: "Get the exact optimal date to harvest based on weather and crop maturity AI models." },
      { icon: "📈", name: "Crop Price Forecast", desc: "Know tomorrow's mandi price today — AI-powered predictions for 30+ crops." },
      { icon: "🌡️", name: "Spoilage Risk Meter", desc: "Real-time spoilage alerts using temperature, humidity and storage time data." },
      { icon: "🤝", name: "Direct Buyer Connect", desc: "Negotiate directly with bulk buyers, supermarkets and hotels — no middleman." },
      { icon: "🏪", name: "Storage Booking", desc: "Book cold storage or warehouse slots with live capacity and cost calculator." },
      { icon: "🚚", name: "Transport Request", desc: "Book trucks and share loads with nearby farmers to cut logistics costs." },
      { icon: "💰", name: "Finance & Loans", desc: "Get pre-booking based loan eligibility and apply for Kisan Credit Card." },
      { icon: "📜", name: "Digital Certifications", desc: "Receive verifiable quality certificates from FPOs and Agri Officers." },
    ],
  },
  {
    id: "buyer",
    icon: "🛒",
    title: "Buyer / Market",
    tagline: "Source fresh. Trade smart.",
    color: "border-agro-sky/40 hover:border-agro-sky bg-agro-sky/5",
    activeColor: "border-agro-sky bg-agro-sky/10 ring-2 ring-agro-sky/30",
    badgeColor: "bg-agro-sky/10 text-agro-sky border-agro-sky/20",
    accent: "text-agro-sky",
    features: [
      { icon: "🛒", name: "Live Crop Marketplace", desc: "Browse real-time listings of verified crops with quality scores and farmer ratings." },
      { icon: "📦", name: "Pre-book Harvest", desc: "Lock in prices before harvest to secure supply and reduce procurement cost." },
      { icon: "💳", name: "Escrow Payments", desc: "Smart escrow ensures payment only on verified delivery confirmation." },
      { icon: "📊", name: "Market Analytics", desc: "Price trends, demand forecasts and seasonal availability charts." },
      { icon: "🏅", name: "Certified Quality", desc: "Every crop listing shows digital quality certificate and traceability chain." },
      { icon: "🔔", name: "Supply Alerts", desc: "Get notified when crops matching your criteria become available." },
    ],
  },
  {
    id: "transport",
    icon: "🚚",
    title: "Transport Owner",
    tagline: "Fill every trip. Maximize revenue.",
    color: "border-secondary/40 hover:border-secondary bg-secondary/5",
    activeColor: "border-secondary bg-secondary/10 ring-2 ring-secondary/30",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "text-secondary",
    features: [
      { icon: "📋", name: "Booking Requests", desc: "Receive farmer transport requests with crop, weight and route details." },
      { icon: "💬", name: "Price Negotiation", desc: "Counter-offer on pricing — chat-style negotiation with farmers." },
      { icon: "🗺️", name: "Smart Route Roadmap", desc: "Auto-generated pickup-to-market roadmap with ETAs and distances for all bookings." },
      { icon: "📅", name: "Date-wise Schedule", desc: "View capacity utilisation day-by-day — see % load filled and free space." },
      { icon: "➕", name: "Extra Load Suggestions", desc: "AI suggests additional loads on your route that fit your remaining capacity." },
      { icon: "📊", name: "Earnings Analytics", desc: "Bar charts of weekly load, revenue and efficiency ratings." },
    ],
  },
  {
    id: "storage",
    icon: "🏪",
    title: "Storage Manager",
    tagline: "Maximise your cold chain assets.",
    color: "border-accent/40 hover:border-accent bg-accent/5",
    activeColor: "border-accent bg-accent/10 ring-2 ring-accent/30",
    badgeColor: "bg-accent/10 text-accent border-accent/20",
    accent: "text-accent",
    features: [
      { icon: "📥", name: "Booking Approvals", desc: "Review and approve farmer storage requests with check-in/out dates." },
      { icon: "📊", name: "Capacity Dashboard", desc: "Live occupancy gauges per unit — cold storage, warehouse and silo." },
      { icon: "🌡️", name: "Spoilage Monitoring", desc: "Temperature & humidity alerts per bay with spoilage risk scoring." },
      { icon: "📅", name: "Schedule Timeline", desc: "Date-wise intake and release calendar with crop mix pie charts." },
      { icon: "💰", name: "Revenue Tracking", desc: "Track per-unit earnings, occupancy rates and projected income." },
      { icon: "🔔", name: "Expiry Alerts", desc: "Automatic alerts when storage contracts are expiring within 3 days." },
    ],
  },
  {
    id: "finance",
    icon: "💰",
    title: "Finance Officer",
    tagline: "Fund the farm value chain.",
    color: "border-secondary/40 hover:border-secondary bg-secondary/5",
    activeColor: "border-secondary bg-secondary/10 ring-2 ring-secondary/30",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    accent: "text-secondary",
    features: [
      { icon: "📋", name: "Loan Applications", desc: "Review and process farmer loan applications with AI credit scoring." },
      { icon: "🏦", name: "KCC Management", desc: "Manage Kisan Credit Card issuance and renewal workflows." },
      { icon: "💳", name: "Payment Schemes", desc: "Configure and monitor subsidy and government payment scheme disbursal." },
      { icon: "📊", name: "Portfolio Analytics", desc: "NPL rates, repayment tracking and risk dashboards." },
      { icon: "🛡️", name: "Crop Insurance", desc: "Automated Fasal Bima eligibility check and claims management." },
    ],
  },
  {
    id: "fpo",
    icon: "🏛️",
    title: "FPO / Agri Officer",
    tagline: "Certify, monitor and empower clusters.",
    color: "border-primary/30 hover:border-primary bg-primary/5",
    activeColor: "border-primary bg-primary/10 ring-2 ring-primary/30",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    accent: "text-primary",
    features: [
      { icon: "📜", name: "Issue Certifications", desc: "Issue digital quality and organic certifications that attach to crop listings." },
      { icon: "🗺️", name: "Cluster Map", desc: "Interactive map of all farmer clusters in the region with yield heatmaps." },
      { icon: "📊", name: "Yield Monitoring", desc: "Aggregate yield and quality data across the FPO's farmer network." },
      { icon: "🌾", name: "Scheme Routing", desc: "Match farmers to eligible government schemes and track applications." },
      { icon: "📢", name: "Advisory Broadcast", desc: "Send pest alerts, weather advisories and best-practice updates to all farmers." },
    ],
  },
  {
    id: "analytics",
    icon: "📊",
    title: "Analyst",
    tagline: "Turn data into market intelligence.",
    color: "border-agro-sky/40 hover:border-agro-sky bg-agro-sky/5",
    activeColor: "border-agro-sky bg-agro-sky/10 ring-2 ring-agro-sky/30",
    badgeColor: "bg-agro-sky/10 text-agro-sky border-agro-sky/20",
    accent: "text-agro-sky",
    features: [
      { icon: "📈", name: "Price Trend Charts", desc: "30-day historical and 14-day forecast price charts for all major crops." },
      { icon: "🌦️", name: "Weather Impact Analysis", desc: "Correlate rainfall, temperature with yield and price movements." },
      { icon: "🗺️", name: "Regional Supply Maps", desc: "Heatmaps showing crop surplus, deficit and price arbitrage opportunities." },
      { icon: "📦", name: "Demand Forecasting", desc: "Predict bulk buyer demand for the next season using ML models." },
      { icon: "♻️", name: "Waste Analytics", desc: "Track waste reduction metrics and identify loss-heavy corridors." },
    ],
  },
  {
    id: "admin",
    icon: "⚙️",
    title: "Admin",
    tagline: "Oversee and control the entire platform.",
    color: "border-destructive/30 hover:border-destructive bg-destructive/5",
    activeColor: "border-destructive bg-destructive/10 ring-2 ring-destructive/30",
    badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
    accent: "text-destructive",
    features: [
      { icon: "👥", name: "User Management", desc: "View, approve and manage all registered users across every role." },
      { icon: "📊", name: "Platform KPIs", desc: "Live dashboard of trade volume, active users and platform health metrics." },
      { icon: "🛡️", name: "Fraud & Risk Alerts", desc: "AI flags suspicious transactions and unusual activity patterns." },
      { icon: "⚙️", name: "System Configuration", desc: "Manage feature flags, scheme parameters and notification settings." },
      { icon: "📋", name: "Audit Logs", desc: "Full audit trail of every booking, certification and payment action." },
    ],
  },
];

const STATS = [
  { value: "12,847", label: "Farmers Connected", icon: "👨‍🌾" },
  { value: "3,241", label: "Crops Listed", icon: "🌾" },
  { value: "₹4.25 Cr", label: "Trade Volume", icon: "💰" },
  { value: "73%", label: "Waste Reduced", icon: "♻️" },
];

export default function Index() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const activeRole = ROLES.find((r) => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <div>
              <span className="font-bold text-primary text-lg">AgroSense</span>
              <span className="text-muted-foreground text-sm ml-1.5 hidden sm:inline">Predictive Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30 text-xs hidden sm:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Live Platform
            </Badge>
            <Button size="sm" variant="outline" asChild className="text-xs h-8">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-xs h-8">
              <Link to="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-agro-sky/5 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            🏆 AI × Agriculture Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            One Platform for the<br />
            <span className="text-primary">Entire Agriculture Chain</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
            AgroSense connects farmers, buyers, transport, storage and finance in a single AI-powered ecosystem — reducing waste, maximising profit and enabling transparent farm-to-market trade.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/register">🚀 Create Free Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">🔐 Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYER 1: ROLE EXPLORER ──────────────────────────────────────── */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-3">
            <Badge className="mb-3 bg-muted text-muted-foreground border-border">Step 1 of 2</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Who Are You?</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Select your role below to explore the exact features and dashboard built for you — before you even sign up.
            </p>
          </div>

          {/* Role grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            {ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                className={`rounded-xl border-2 p-3 text-center transition-all duration-150 cursor-pointer group ${
                  selectedRole === role.id ? role.activeColor : role.color
                }`}
              >
                <div className="text-3xl mb-1.5">{role.icon}</div>
                <div className="font-semibold text-xs text-foreground leading-tight">{role.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{role.tagline}</div>
                {selectedRole === role.id && (
                  <Badge className={`mt-1.5 text-[9px] py-0 px-1.5 ${role.badgeColor} border`}>
                    ✓ Exploring
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* ── ROLE FEATURE PREVIEW PANEL ────────────────────────────── */}
          {activeRole && (
            <div className={`mt-6 rounded-2xl border-2 p-6 transition-all duration-300 ${activeRole.activeColor}`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeRole.icon}</span>
                  <div>
                    <h3 className={`text-lg font-bold ${activeRole.accent}`}>{activeRole.title} Dashboard</h3>
                    <p className="text-sm text-muted-foreground">{activeRole.tagline}</p>
                  </div>
                </div>
                <div className="sm:ml-auto flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                    onClick={() => navigate("/login")}
                  >
                    🔐 Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-xs h-8"
                    onClick={() => navigate("/register")}
                  >
                    🚀 Get Started
                  </Button>
                </div>
              </div>

              {/* Feature cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeRole.features.map((feat) => (
                  <div
                    key={feat.name}
                    className="bg-background/80 rounded-xl border border-border p-4 flex gap-3 items-start hover:bg-background transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{feat.icon}</span>
                    <div>
                      <div className="font-semibold text-xs text-foreground mb-0.5">{feat.name}</div>
                      <div className="text-[11px] text-muted-foreground leading-relaxed">{feat.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA banner */}
              <div className="mt-5 rounded-xl bg-primary/8 border border-primary/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Ready to unlock your {activeRole.title} dashboard?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sign in or create a free account to access all {activeRole.features.length} features with real live data.
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => navigate("/login")}>
                    Sign In
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs" onClick={() => navigate("/register")}>
                    Create Account →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Default hint when no role selected */}
          {!selectedRole && (
            <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-3xl mb-2">👆</p>
              <p className="text-sm text-muted-foreground">Click on any role above to see its full feature set before signing up.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LAYER 2: SIGN IN CTA ────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Badge className="mb-3 bg-muted text-muted-foreground border-border">Step 2 of 2</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Sign In to Access Your Dashboard</h2>
          <p className="text-muted-foreground text-sm mb-8 max-w-xl mx-auto">
            Once signed in, your role-specific dashboard loads with real data — live crop prices, booking requests, schedules and AI recommendations — all tailored to you.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: "🔐", title: "Secure Login", desc: "Select your role and sign in with your credentials" },
              { icon: "📊", title: "Real Live Data", desc: "Instant access to your personalised AI dashboard" },
              { icon: "🤝", title: "Start Transacting", desc: "Book, negotiate, certify and trade immediately" },
            ].map((step) => (
              <div key={step.title} className="bg-card rounded-xl border border-border p-5 text-center">
                <div className="text-3xl mb-2">{step.icon}</div>
                <div className="font-semibold text-sm text-foreground mb-1">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/login">🔐 Sign In to AgroSense</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/register">✍️ Create New Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── GOVT SCHEMES ────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-primary/5 border-y border-primary/10">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-base font-bold text-foreground mb-1">Government Schemes Integration</h3>
          <p className="text-xs text-muted-foreground mb-6">Automatically matched to eligible farmers on sign up</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "🏛️", name: "PM-KISAN", desc: "₹6,000/year direct support" },
              { icon: "🛡️", name: "Crop Insurance", desc: "Fasal Bima protection" },
              { icon: "💳", name: "Kisan Credit Card", desc: "4% interest farm loans" },
              { icon: "📊", name: "e-NAM Platform", desc: "Online agricultural trading" },
            ].map((s) => (
              <div key={s.name} className="bg-card rounded-lg p-4 border border-primary/10 text-center">
                <div className="text-2xl mb-1.5">{s.icon}</div>
                <div className="font-semibold text-sm text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 bg-card border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🌾</span>
          <span className="font-bold text-primary">AgroSense</span>
        </div>
        <p className="text-xs text-muted-foreground">Predictive Intelligence for Smart Harvest & Market-Aligned Agriculture</p>
        <p className="text-xs text-muted-foreground mt-1">Built with React + AI · Hackathon 2024</p>
      </footer>
    </div>
  );
}
