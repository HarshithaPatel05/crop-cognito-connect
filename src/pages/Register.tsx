import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useRole, AppRole } from "@/context/RoleContext";

// ── Validation schema ──────────────────────────────────────────────────────────
const baseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password too long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
  location: z.string().trim().min(2, "Enter your city / village").max(100),
  state: z.string().min(1, "Select your state"),
  // Role-specific optional fields
  farmArea: z.string().max(50).optional(),
  cropType: z.string().max(100).optional(),
  vehicleType: z.string().max(50).optional(),
  vehicleNo: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/, "Enter valid vehicle number e.g. TS 09 EA 4512")
    .or(z.literal(""))
    .optional(),
  capacity: z.string().max(20).optional(),
  orgName: z.string().trim().max(100).optional(),
  designation: z.string().max(100).optional(),
  warehouseName: z.string().trim().max(100).optional(),
  storageCapacity: z.string().max(20).optional(),
  buyerType: z.string().max(50).optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof baseSchema>;

// ── Role cards ─────────────────────────────────────────────────────────────────
const ROLES: {
  id: AppRole;
  icon: string;
  label: string;
  desc: string;
  path: string;
  color: string;
  activeColor: string;
}[] = [
  { id: "farmer", icon: "👨‍🌾", label: "Farmer", desc: "Grow & sell crops", path: "/farmer", color: "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10", activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30" },
  { id: "buyer", icon: "🛒", label: "Buyer", desc: "Pre-book fresh harvests", path: "/marketplace", color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10", activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30" },
  { id: "transport", icon: "🚚", label: "Transport", desc: "Logistics & vehicles", path: "/transport", color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10", activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30" },
  { id: "storage", icon: "🏪", label: "Storage", desc: "Warehouse & cold storage", path: "/storage", color: "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10", activeColor: "border-accent bg-accent/15 ring-2 ring-accent/30" },
  { id: "finance", icon: "💰", label: "Finance", desc: "Loans & schemes", path: "/finance", color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10", activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30" },
  { id: "fpo", icon: "🏛️", label: "FPO / Agri Officer", desc: "Certify & monitor", path: "/fpo", color: "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10", activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30" },
  { id: "analytics", icon: "📊", label: "Analyst", desc: "Market insights", path: "/analytics", color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10", activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30" },
  { id: "admin", icon: "⚙️", label: "Admin", desc: "Platform management", path: "/admin", color: "border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/10", activeColor: "border-destructive bg-destructive/15 ring-2 ring-destructive/30" },
];

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

// ── Role-specific extra fields ─────────────────────────────────────────────────
function RoleExtraFields({ role, register, errors, setValue }: {
  role: AppRole;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  setValue: ReturnType<typeof useForm<FormValues>>["setValue"];
}) {
  if (role === "farmer") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Farm Area (acres)</Label>
        <Input className="h-9 text-sm" placeholder="e.g. 5" {...register("farmArea")} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Primary Crop Type</Label>
        <Input className="h-9 text-sm" placeholder="e.g. Tomato, Rice" {...register("cropType")} />
      </div>
    </div>
  );

  if (role === "transport") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Vehicle Type</Label>
        <Select onValueChange={(v) => setValue("vehicleType", v)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Mini Truck (1–3T)">Mini Truck (1–3T)</SelectItem>
            <SelectItem value="Large Truck (5–10T)">Large Truck (5–10T)</SelectItem>
            <SelectItem value="Refrigerated Van">❄️ Refrigerated Van</SelectItem>
            <SelectItem value="Tempo / Auto">Tempo / Auto</SelectItem>
            <SelectItem value="Tractor Trolley">Tractor Trolley</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Vehicle Registration No.</Label>
        <Input className="h-9 text-sm" placeholder="e.g. TS 09 EA 4512" {...register("vehicleNo")} />
        {errors.vehicleNo && <p className="text-xs text-destructive">{errors.vehicleNo.message}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Load Capacity (Ton)</Label>
        <Input className="h-9 text-sm" placeholder="e.g. 5" {...register("capacity")} />
      </div>
    </div>
  );

  if (role === "buyer") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Buyer Type</Label>
        <Select onValueChange={(v) => setValue("buyerType", v)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Supermarket">🏪 Supermarket</SelectItem>
            <SelectItem value="Hotel / Restaurant">🍽️ Hotel / Restaurant</SelectItem>
            <SelectItem value="Apartment / Bulk Buyer">🏢 Apartment / Bulk Buyer</SelectItem>
            <SelectItem value="Wholesaler">📦 Wholesaler</SelectItem>
            <SelectItem value="Individual Consumer">👤 Individual Consumer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Organisation Name</Label>
        <Input className="h-9 text-sm" placeholder="e.g. Apex Supermarket" {...register("orgName")} />
      </div>
    </div>
  );

  if (role === "storage") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Warehouse / Facility Name</Label>
        <Input className="h-9 text-sm" placeholder="e.g. CoolStore Warangal" {...register("warehouseName")} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Storage Capacity (Ton)</Label>
        <Input className="h-9 text-sm" placeholder="e.g. 200" {...register("storageCapacity")} />
      </div>
    </div>
  );

  if (role === "fpo") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Organisation / Department</Label>
        <Input className="h-9 text-sm" placeholder="e.g. Telangana Agri Dept." {...register("orgName")} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Designation</Label>
        <Input className="h-9 text-sm" placeholder="e.g. Agricultural Officer" {...register("designation")} />
      </div>
    </div>
  );

  if (role === "admin" || role === "finance" || role === "analytics") return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label className="text-xs">Organisation Name</Label>
        <Input className="h-9 text-sm" placeholder="e.g. AgroSense HQ" {...register("orgName")} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Designation</Label>
        <Input className="h-9 text-sm" placeholder="e.g. Platform Administrator" {...register("designation")} />
      </div>
    </div>
  );

  return null;
}

// ── Password strength indicator ────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Symbol", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const color = score <= 1 ? "bg-destructive" : score === 2 ? "bg-accent" : score === 3 ? "bg-yellow-500" : "bg-primary";
  const label = score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";

  if (!password) return null;
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < score ? color : "bg-muted")} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map(c => (
            <span key={c.label} className={cn("text-[10px]", c.pass ? "text-primary" : "text-muted-foreground")}>
              {c.pass ? "✓" : "○"} {c.label}
            </span>
          ))}
        </div>
        <span className={cn("text-[10px] font-semibold", score <= 1 ? "text-destructive" : score < 4 ? "text-accent" : "text-primary")}>
          {label}
        </span>
      </div>
    </div>
  );
}

// ── Main Register page ─────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useRole();
  const [selectedRole, setSelectedRole] = useState<AppRole>(null);
  const [roleError, setRoleError] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({ resolver: zodResolver(baseSchema), mode: "onBlur" });

  const password = watch("password", "");

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setRoleError("");
  };

  const goToStep2 = async () => {
    if (!selectedRole) { setRoleError("Please select your role to continue."); return; }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (data: FormValues) => {
    if (!selectedRole) { setRoleError("Please select your role."); setStep(1); return; }
    setSubmitting(true);
    const roleData = ROLES.find(r => r.id === selectedRole)!;
    setTimeout(() => {
      setSubmitting(false);
      setUser({ role: selectedRole, name: data.name, location: `${data.location}, ${data.state}`, email: data.email });
      navigate(roleData.path);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="py-5 px-4 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-primary text-xl">AgroSense</span>
          <span className="text-muted-foreground text-sm hidden sm:inline ml-1">Predictive Intelligence</span>
        </div>
        <Link to="/login" className="text-sm text-primary underline underline-offset-2 hover:text-primary/80">
          Already have an account? Sign in
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Title */}
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">🌱 Create Account</Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Join AgroSense</h1>
            <p className="text-muted-foreground text-sm">Build India's smarter agriculture future.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[{ n: 1, label: "Choose Role" }, { n: 2, label: "Your Details" }].map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>{n}</div>
                  <span className={cn("text-xs font-medium hidden sm:block", step >= n ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                </div>
                {i === 0 && <div className={cn("flex-1 h-0.5 rounded", step >= 2 ? "bg-primary" : "bg-muted")} />}
              </div>
            ))}
          </div>

          {/* ── STEP 1: Role Selection ── */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm font-semibold text-foreground">Select your role on the platform</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      "rounded-xl border-2 p-3 text-center transition-all duration-150 cursor-pointer",
                      selectedRole === role.id ? role.activeColor : role.color
                    )}
                  >
                    <div className="text-2xl mb-1">{role.icon}</div>
                    <div className="font-semibold text-xs text-foreground leading-tight">{role.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{role.desc}</div>
                    {selectedRole === role.id && (
                      <Badge className="mt-1.5 text-[9px] py-0 px-1.5 bg-primary text-primary-foreground border-0">✓ Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
              {roleError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">{roleError}</p>
              )}
              {selectedRole && (
                <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-2xl">{ROLES.find(r => r.id === selectedRole)?.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-primary">{ROLES.find(r => r.id === selectedRole)?.label} Portal</div>
                    <div className="text-xs text-muted-foreground">{ROLES.find(r => r.id === selectedRole)?.desc}</div>
                  </div>
                </div>
              )}
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={goToStep2} disabled={!selectedRole}>
                Continue →
              </Button>
            </div>
          )}

          {/* ── STEP 2: Profile Details ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Card className="border-border shadow-sm">
                <CardContent className="pt-6 pb-6 px-6 space-y-5">

                  {/* Role reminder */}
                  <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-xl">{ROLES.find(r => r.id === selectedRole)?.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary">{ROLES.find(r => r.id === selectedRole)?.label} Account</div>
                      <div className="text-xs text-muted-foreground">Registering as {ROLES.find(r => r.id === selectedRole)?.label}</div>
                    </div>
                    <button type="button" className="text-xs text-primary underline underline-offset-2" onClick={() => setStep(1)}>
                      Change
                    </button>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Basic Information</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" className="h-9" placeholder="e.g. Ramesh Kumar" {...register("name")} />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="phone">Mobile Number *</Label>
                        <div className="flex gap-2">
                          <span className="flex items-center px-3 bg-muted border border-input rounded-md text-sm text-muted-foreground h-9">+91</span>
                          <Input id="phone" className="h-9 flex-1" placeholder="98765 43210" maxLength={10} {...register("phone")} />
                        </div>
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" className="h-9" placeholder="ramesh@example.com" {...register("email")} />
                        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Location</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="location">Village / City *</Label>
                        <Input id="location" className="h-9" placeholder="e.g. Warangal" {...register("location")} />
                        {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                      </div>
                      <div className="space-y-1">
                        <Label>State *</Label>
                        <Select onValueChange={(v) => { setValue("state", v); trigger("state"); }}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                          <SelectContent>
                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Role-specific fields */}
                  {selectedRole && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        {ROLES.find(r => r.id === selectedRole)?.label} Details
                      </p>
                      <RoleExtraFields
                        role={selectedRole}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                      />
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Set Password</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="password">Password *</Label>
                        <Input id="password" type="password" className="h-9" placeholder="Min 8 characters" {...register("password")} />
                        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                        <PasswordStrength password={password} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input id="confirmPassword" type="password" className="h-9" placeholder="Re-enter password" {...register("confirmPassword")} />
                        {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-muted-foreground">
                    By registering you agree to AgroSense's{" "}
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Terms of Service</span> and{" "}
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                  </p>

                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="flex-1 border-border" onClick={() => setStep(1)}>
                      ← Back
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : "🌱 Create Account"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline underline-offset-2 hover:text-primary/80">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
