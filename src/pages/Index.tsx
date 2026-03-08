import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceAssistant } from "@/components/shared/VoiceAssistant";

const ROLE_CARDS = [
  { icon: "👨‍🌾", title: "Farmer", desc: "Manage crops, harvest, and sell", path: "/farmer", color: "border-primary/40 hover:border-primary bg-agro-green-light/30" },
  { icon: "🛒", title: "Buyer / Market", desc: "Browse and pre-book fresh harvests", path: "/marketplace", color: "border-agro-sky/40 hover:border-agro-sky bg-agro-sky/5" },
  { icon: "🚚", title: "Transport", desc: "Register vehicles and manage logistics", path: "/transport", color: "border-secondary/40 hover:border-secondary bg-agro-brown-light/30" },
  { icon: "🏪", title: "Storage", desc: "Cold storage and warehouse booking", path: "/storage", color: "border-accent/40 hover:border-accent bg-accent/5" },
  { icon: "💰", title: "Finance & Loans", desc: "Apply for loans and view schemes", path: "/finance", color: "border-secondary/40 hover:border-secondary bg-agro-brown-light/30" },
  { icon: "♻️", title: "Waste Management", desc: "Convert crop waste to value", path: "/waste", color: "border-primary/30 hover:border-primary bg-agro-green-light/20" },
  { icon: "📊", title: "Analytics", desc: "Price forecasts and regional insights", path: "/analytics", color: "border-agro-sky/40 hover:border-agro-sky bg-agro-sky/5" },
  { icon: "🏛️", title: "FPO / Agri Officer", desc: "Monitor clusters and certify farms", path: "/fpo", color: "border-secondary/40 hover:border-secondary bg-agro-brown-light/30" },
  { icon: "⚙️", title: "Admin Panel", desc: "Platform overview and management", path: "/admin", color: "border-destructive/30 hover:border-destructive bg-destructive/5" },
];

const FEATURES = [
  { icon: "🌾", title: "AI Harvest Intelligence", desc: "Predict the optimal harvest date using weather, maturity, and market signals." },
  { icon: "📈", title: "Price Forecasting", desc: "AI-powered crop price prediction to help farmers sell at the best time." },
  { icon: "🌡️", title: "Spoilage Risk Control", desc: "Real-time spoilage risk meter based on temperature, humidity, and storage time." },
  { icon: "🤝", title: "Direct Buyer Connection", desc: "Farmers connect directly to supermarkets, hotels, and bulk buyers." },
  { icon: "💳", title: "Smart Escrow Payments", desc: "Secure payment system ensuring farmers get paid on delivery confirmation." },
  { icon: "🚚", title: "Logistics Network", desc: "Book transport, share loads with nearby farmers and reduce costs." },
  { icon: "🏦", title: "Pre-booking Based Loans", desc: "Get loan eligibility based on pre-orders and predicted yield." },
  { icon: "📜", title: "Digital Certifications", desc: "Agricultural officers issue verifiable digital quality certificates." },
];

const STATS = [
  { value: "12,847", label: "Farmers Connected", icon: "👨‍🌾" },
  { value: "3,241", label: "Crops Listed", icon: "🌾" },
  { value: "₹4.25 Cr", label: "Trade Volume", icon: "💰" },
  { value: "73%", label: "Waste Reduced", icon: "♻️" },
];

const GOVT_HIGHLIGHTS = [
  { name: "PM-KISAN", desc: "₹6,000/year direct support", icon: "🏛️" },
  { name: "Crop Insurance", desc: "Fasal Bima protection", icon: "🛡️" },
  { name: "Kisan Credit Card", desc: "4% interest farm loans", icon: "💳" },
  { name: "e-NAM Platform", desc: "Online agricultural trading", icon: "📊" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <div>
              <span className="font-bold text-primary text-lg">AgroSense</span>
              <span className="text-muted-foreground text-sm ml-1 hidden sm:inline">Predictive Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-agro-green-light text-primary border-primary/30 text-xs hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 pulse-live"></span>
              Live Platform
            </Badge>
            <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/farmer">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-agro-sky/5 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
            🏆 Hackathon 2024 · AI × Agriculture
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            Predictive Intelligence<br />
            <span className="text-primary">for Smart Harvest</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            AgroSense connects farmers, buyers, logistics, and finance into one AI-powered ecosystem — reducing waste, maximizing profit, and enabling transparent farm-to-market trade.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/farmer">🌾 Farmer Dashboard</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/analytics">📊 View Analytics</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/marketplace">🛒 Buyer Marketplace</Link>
            </Button>
          </div>
        </div>
        {/* Stat strip */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center bg-card rounded-xl p-4 border border-border shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Role Selector */}
      <section className="py-16 px-4 bg-card border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Choose Your Role</h2>
            <p className="text-muted-foreground">Each stakeholder gets a personalized AI-powered dashboard</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROLE_CARDS.slice(0, 5).map((role) => (
              <Link key={role.title} to={role.path}>
                <Card className={`cursor-pointer border-2 transition-all hover:-translate-y-1 hover:shadow-md ${role.color}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="font-semibold text-sm text-foreground">{role.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{role.desc}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {ROLE_CARDS.slice(5).map((role) => (
              <Link key={role.title} to={role.path}>
                <Card className={`cursor-pointer border-2 transition-all hover:-translate-y-1 hover:shadow-md ${role.color}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="font-semibold text-sm text-foreground">{role.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{role.desc}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Platform Capabilities</h2>
            <p className="text-muted-foreground">AI-driven tools for every step of the agriculture value chain</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow border-border">
                <CardContent className="p-5">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Government Schemes */}
      <section className="py-12 px-4 bg-agro-green-light/20 border-y border-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-foreground mb-1">Government Schemes Integration</h2>
            <p className="text-sm text-muted-foreground">Automatically matched to eligible farmers</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GOVT_HIGHLIGHTS.map((s) => (
              <div key={s.name} className="bg-card rounded-lg p-4 border border-primary/10 text-center">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-semibold text-sm text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-card border-t border-border text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🌾</span>
          <span className="font-bold text-primary">AgroSense</span>
        </div>
        <p className="text-xs text-muted-foreground">Predictive Intelligence for Smart Harvest and Market-Aligned Agriculture</p>
        <p className="text-xs text-muted-foreground mt-1">Built for Hackathon 2024 · React + AI</p>
      </footer>

      <VoiceAssistant />
    </div>
  );
}
