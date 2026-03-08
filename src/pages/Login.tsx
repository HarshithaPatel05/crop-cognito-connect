import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    id: "farmer",
    icon: "👨‍🌾",
    label: "Farmer",
    desc: "Manage crops & harvest",
    path: "/farmer",
    color: "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10",
    activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30",
  },
  {
    id: "buyer",
    icon: "🛒",
    label: "Buyer",
    desc: "Browse & pre-book crops",
    path: "/marketplace",
    color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",
    activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30",
  },
  {
    id: "transport",
    icon: "🚚",
    label: "Transport",
    desc: "Manage logistics & vehicles",
    path: "/transport",
    color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",
    activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30",
  },
  {
    id: "storage",
    icon: "🏪",
    label: "Storage",
    desc: "Warehouses & cold storage",
    path: "/storage",
    color: "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10",
    activeColor: "border-accent bg-accent/15 ring-2 ring-accent/30",
  },
  {
    id: "finance",
    icon: "💰",
    label: "Finance",
    desc: "Loans & payment schemes",
    path: "/finance",
    color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",
    activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30",
  },
  {
    id: "fpo",
    icon: "🏛️",
    label: "FPO / Agri Officer",
    desc: "Monitor clusters & certify",
    path: "/fpo",
    color: "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10",
    activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30",
  },
  {
    id: "analytics",
    icon: "📊",
    label: "Analyst",
    desc: "Market insights & forecasts",
    path: "/analytics",
    color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",
    activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30",
  },
  {
    id: "admin",
    icon: "⚙️",
    label: "Admin",
    desc: "Platform overview & control",
    path: "/admin",
    color: "border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/10",
    activeColor: "border-destructive bg-destructive/15 ring-2 ring-destructive/30",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoleData = ROLES.find((r) => r.id === selectedRole);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selectedRole) {
      setError("Please select your role to continue.");
      return;
    }
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    // Simulated auth — replace with real auth when backend is enabled
    setTimeout(() => {
      setLoading(false);
      if (selectedRoleData) {
        navigate(selectedRoleData.path);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="py-6 px-4 flex justify-center border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-primary text-xl">AgroSense</span>
          <span className="text-muted-foreground text-sm hidden sm:inline ml-1">
            Predictive Intelligence
          </span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              🔐 Secure Login
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to AgroSense
            </h1>
            <p className="text-muted-foreground text-sm">
              Select your role and sign in to access your personalized dashboard.
            </p>
          </div>

          {/* Role Selector */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                1
              </span>
              Choose Your Role
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-center transition-all duration-150 cursor-pointer",
                    selectedRole === role.id ? role.activeColor : role.color
                  )}
                >
                  <div className="text-2xl mb-1">{role.icon}</div>
                  <div className="font-semibold text-xs text-foreground leading-tight">
                    {role.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {role.desc}
                  </div>
                  {selectedRole === role.id && (
                    <Badge className="mt-1.5 text-[9px] py-0 px-1.5 bg-primary text-primary-foreground border-0">
                      ✓ Selected
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <Card className="border-border shadow-sm">
            <CardContent className="pt-6 pb-6 px-6">
              <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  2
                </span>
                Sign In to Your Account
              </p>

              {selectedRoleData && (
                <div className="mb-4 flex items-center gap-2 py-2 px-3 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-lg">{selectedRoleData.icon}</span>
                  <span className="text-sm text-primary font-medium">
                    Logging in as{" "}
                    <strong>{selectedRoleData.label}</strong>
                  </span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email / Mobile Number</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email or phone"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    `🔐 Sign In${selectedRoleData ? ` as ${selectedRoleData.label}` : ""}`
                  )}
                </Button>

                <div className="text-center text-xs text-muted-foreground pt-1">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                    onClick={() => navigate("/")}
                  >
                    Register here
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Demo hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            🚀 Demo mode — any credentials work. Select a role and click Sign In.
          </p>
        </div>
      </div>
    </div>
  );
}
