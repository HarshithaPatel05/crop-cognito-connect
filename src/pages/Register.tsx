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

// ── STATES ─────────────────────────────────────────────────────────────────────
const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"];

// ── ROLE DEFINITIONS ────────────────────────────────────────────────────────────
const ROLES = [
  { id: "farmer" as AppRole,    icon: "👨‍🌾", label: "Farmer",           desc: "Grow & sell crops",        path: "/farmer",      color: "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10",           activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30" },
  { id: "buyer" as AppRole,     icon: "🛒",  label: "Buyer",             desc: "Pre-book fresh harvests",  path: "/marketplace", color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",       activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30" },
  { id: "transport" as AppRole, icon: "🚚",  label: "Transport Owner",   desc: "Logistics & vehicles",     path: "/transport",   color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",   activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30" },
  { id: "storage" as AppRole,   icon: "🏪",  label: "Storage Manager",   desc: "Warehouse & cold storage", path: "/storage",     color: "border-accent/40 bg-accent/5 hover:border-accent hover:bg-accent/10",               activeColor: "border-accent bg-accent/15 ring-2 ring-accent/30" },
  { id: "finance" as AppRole,   icon: "💰",  label: "Finance Officer",   desc: "Loans & schemes",          path: "/finance",     color: "border-secondary/40 bg-secondary/5 hover:border-secondary hover:bg-secondary/10",   activeColor: "border-secondary bg-secondary/15 ring-2 ring-secondary/30" },
  { id: "fpo" as AppRole,       icon: "🏛️",  label: "FPO / Agri Officer",desc: "Certify & monitor",        path: "/fpo",         color: "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10",           activeColor: "border-primary bg-primary/15 ring-2 ring-primary/30" },
  { id: "analytics" as AppRole, icon: "📊",  label: "Analyst",           desc: "Market insights",          path: "/analytics",   color: "border-agro-sky/40 bg-agro-sky/5 hover:border-agro-sky hover:bg-agro-sky/10",       activeColor: "border-agro-sky bg-agro-sky/15 ring-2 ring-agro-sky/30" },
  { id: "admin" as AppRole,     icon: "⚙️",  label: "Admin",             desc: "Platform management",      path: "/admin",       color: "border-destructive/30 bg-destructive/5 hover:border-destructive hover:bg-destructive/10", activeColor: "border-destructive bg-destructive/15 ring-2 ring-destructive/30" },
];

// ── VALIDATION SCHEMA ──────────────────────────────────────────────────────────
const schema = z.object({
  // Basic
  name:            z.string().trim().min(2, "Min 2 characters").max(100),
  email:           z.string().trim().email("Invalid email").max(255),
  phone:           z.string().trim().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile number"),
  password:        z.string().min(8,"Min 8 chars").max(64).regex(/[A-Z]/,"Needs uppercase").regex(/[0-9]/,"Needs number"),
  confirmPassword: z.string(),
  location:        z.string().trim().min(2,"Enter city/village").max(100),
  district:        z.string().trim().max(100).optional(),
  state:           z.string().min(1,"Select state"),
  pincode:         z.string().regex(/^\d{6}$/, "Valid 6-digit PIN").or(z.literal("")).optional(),

  // ── FARMER ──
  farmArea:        z.string().max(10).optional(),
  soilType:        z.string().max(50).optional(),
  irrigationType:  z.string().max(50).optional(),
  primaryCrop:     z.string().max(100).optional(),
  secondaryCrop:   z.string().max(100).optional(),
  harvestSeason:   z.string().max(50).optional(),
  annualYield:     z.string().max(20).optional(),
  farmingType:     z.string().max(50).optional(),      // organic / conventional
  landOwnership:   z.string().max(50).optional(),      // owned / leased
  hasKCC:          z.string().max(10).optional(),      // yes/no
  bankName:        z.string().max(100).optional(),
  preferredMarket: z.string().max(100).optional(),

  // ── BUYER ──
  buyerType:       z.string().max(50).optional(),
  orgName:         z.string().trim().max(100).optional(),
  gstNo:           z.string().max(20).optional(),
  monthlyVolume:   z.string().max(30).optional(),
  preferredCrops:  z.string().max(200).optional(),
  deliveryArea:    z.string().max(100).optional(),
  paymentMode:     z.string().max(50).optional(),

  // ── TRANSPORT ──
  vehicleType:     z.string().max(50).optional(),
  vehicleNo:       z.string().trim().regex(/^[A-Z]{2}\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}$/, "e.g. TS 09 EA 4512").or(z.literal("")).optional(),
  capacity:        z.string().max(10).optional(),
  isRefrigerated:  z.string().max(5).optional(),
  driverLicenseNo: z.string().max(20).optional(),
  operatingRoutes: z.string().max(200).optional(),
  tripsPerMonth:   z.string().max(10).optional(),
  fuelType:        z.string().max(20).optional(),

  // ── STORAGE ──
  warehouseName:   z.string().trim().max(100).optional(),
  storageCapacity: z.string().max(20).optional(),
  storageTypes:    z.string().max(100).optional(),     // cold/warehouse/silo
  tempRange:       z.string().max(50).optional(),
  fssaiNo:         z.string().max(20).optional(),
  unitsAvailable:  z.string().max(10).optional(),
  pricePerTonDay:  z.string().max(20).optional(),
  insuranceCovered:z.string().max(5).optional(),

  // ── FINANCE ──
  bankBranch:      z.string().trim().max(100).optional(),
  designation:     z.string().max(100).optional(),
  loanTypes:       z.string().max(200).optional(),
  maxLoanAmount:   z.string().max(20).optional(),
  interestRate:    z.string().max(20).optional(),
  employeeId:      z.string().max(30).optional(),
  ifscCode:        z.string().max(20).optional(),

  // ── FPO / AGRI OFFICER ──
  orgType:         z.string().max(50).optional(),      // FPO / Agri Dept / NGO
  regNo:           z.string().max(30).optional(),
  memberCount:     z.string().max(10).optional(),
  clusterDistrict: z.string().max(100).optional(),
  govtSchemes:     z.string().max(200).optional(),
  certAuthority:   z.string().max(100).optional(),

  // ── ANALYST ──
  analyticsOrg:    z.string().trim().max(100).optional(),
  researchFocus:   z.string().max(200).optional(),
  toolsUsed:       z.string().max(100).optional(),
  reportFrequency: z.string().max(50).optional(),

  // ── ADMIN ──
  adminOrg:        z.string().trim().max(100).optional(),
  accessLevel:     z.string().max(50).optional(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FV = z.infer<typeof schema>;

// ── FIELD SECTION HELPER ───────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        <span>{icon}</span>{title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── PASSWORD STRENGTH ──────────────────────────────────────────────────────────
function PwStrength({ pw }: { pw: string }) {
  const checks = [
    { l: "8+ chars",  ok: pw.length >= 8 },
    { l: "Uppercase", ok: /[A-Z]/.test(pw) },
    { l: "Number",    ok: /[0-9]/.test(pw) },
    { l: "Symbol",    ok: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter(c => c.ok).length;
  const barColor = score <= 1 ? "bg-destructive" : score === 2 ? "bg-accent" : score === 3 ? "bg-yellow-500" : "bg-primary";
  if (!pw) return null;
  return (
    <div className="space-y-1 mt-1">
      <div className="flex gap-1">{[0,1,2,3].map(i => <div key={i} className={cn("h-1 flex-1 rounded-full transition-all", i < score ? barColor : "bg-muted")} />)}</div>
      <div className="flex gap-3 flex-wrap">
        {checks.map(c => <span key={c.l} className={cn("text-[10px]", c.ok ? "text-primary" : "text-muted-foreground")}>{c.ok ? "✓" : "○"} {c.l}</span>)}
      </div>
    </div>
  );
}

// ── ROLE SPECIFIC FIELDS ───────────────────────────────────────────────────────
function RoleFields({ role, reg, err, set }: {
  role: AppRole;
  reg: ReturnType<typeof useForm<FV>>["register"];
  err: ReturnType<typeof useForm<FV>>["formState"]["errors"];
  set: ReturnType<typeof useForm<FV>>["setValue"];
}) {
  const Sel = ({ name, placeholder, options }: { name: keyof FV; placeholder: string; options: { v: string; l: string }[] }) => (
    <Select onValueChange={v => set(name, v)}>
      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
    </Select>
  );

  // ── FARMER ─────────────────────────────────────────────────────────────────
  if (role === "farmer") return (
    <div className="space-y-5">
      <Section title="Farm Details" icon="🌾">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Farm Area (acres)" error={err.farmArea?.message}>
            <Input className="h-9 text-sm" placeholder="e.g. 5" {...reg("farmArea")} />
          </Field>
          <Field label="Land Ownership">
            <Sel name="landOwnership" placeholder="Select" options={[{v:"Owned",l:"🏡 Owned"},{v:"Leased",l:"📝 Leased"},{v:"Shared",l:"🤝 Shared/Tenanted"}]} />
          </Field>
          <Field label="Soil Type">
            <Sel name="soilType" placeholder="Select soil type" options={[{v:"Black Cotton",l:"⚫ Black Cotton"},{v:"Red Sandy",l:"🔴 Red Sandy"},{v:"Loamy",l:"🟫 Loamy"},{v:"Alluvial",l:"🌊 Alluvial"},{v:"Laterite",l:"🟧 Laterite"}]} />
          </Field>
          <Field label="Irrigation Type">
            <Sel name="irrigationType" placeholder="Select irrigation" options={[{v:"Drip",l:"💧 Drip Irrigation"},{v:"Sprinkler",l:"🌧️ Sprinkler"},{v:"Canal",l:"🏞️ Canal"},{v:"Borewell",l:"🔩 Borewell"},{v:"Rain-fed",l:"🌧️ Rain-fed Only"}]} />
          </Field>
          <Field label="Farming Type">
            <Sel name="farmingType" placeholder="Select" options={[{v:"Organic",l:"🌿 Organic"},{v:"Conventional",l:"🌾 Conventional"},{v:"Mixed",l:"🔄 Mixed"}]} />
          </Field>
          <Field label="Harvest Season">
            <Sel name="harvestSeason" placeholder="Select" options={[{v:"Kharif",l:"☀️ Kharif (Jun–Nov)"},{v:"Rabi",l:"❄️ Rabi (Nov–Apr)"},{v:"Zaid",l:"🌞 Zaid (Apr–Jun)"},{v:"Year-round",l:"🔄 Year-round"}]} />
          </Field>
        </div>
      </Section>
      <Section title="Crop Information" icon="🌱">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Primary Crop">
            <Input className="h-9 text-sm" placeholder="e.g. Tomato, Rice, Wheat" {...reg("primaryCrop")} />
          </Field>
          <Field label="Secondary Crop (if any)">
            <Input className="h-9 text-sm" placeholder="e.g. Groundnut, Onion" {...reg("secondaryCrop")} />
          </Field>
          <Field label="Expected Annual Yield (Ton)">
            <Input className="h-9 text-sm" placeholder="e.g. 12" {...reg("annualYield")} />
          </Field>
          <Field label="Preferred Selling Market">
            <Sel name="preferredMarket" placeholder="Select" options={[{v:"APMC Mandi",l:"🏛️ APMC Mandi"},{v:"Direct Buyer",l:"🤝 Direct Buyer"},{v:"Online Platform",l:"💻 Online Platform"},{v:"FPO / Co-op",l:"🏘️ FPO / Co-op"}]} />
          </Field>
        </div>
      </Section>
      <Section title="Financial Profile" icon="💳">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kisan Credit Card (KCC)?">
            <Sel name="hasKCC" placeholder="Select" options={[{v:"Yes",l:"✅ Yes, I have KCC"},{v:"No",l:"❌ No"},{v:"Applied",l:"⏳ Applied, Pending"}]} />
          </Field>
          <Field label="Primary Bank Name">
            <Input className="h-9 text-sm" placeholder="e.g. SBI, Andhra Bank" {...reg("bankName")} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── BUYER ───────────────────────────────────────────────────────────────────
  if (role === "buyer") return (
    <div className="space-y-5">
      <Section title="Buyer Profile" icon="🛒">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Buyer Type" error={err.buyerType?.message}>
            <Sel name="buyerType" placeholder="Select type" options={[{v:"Supermarket",l:"🏪 Supermarket"},{v:"Hotel/Restaurant",l:"🍽️ Hotel / Restaurant"},{v:"Apartment",l:"🏢 Apartment / Complex"},{v:"Wholesaler",l:"📦 Wholesaler"},{v:"Retailer",l:"🏬 Retailer"},{v:"Individual",l:"👤 Individual Consumer"}]} />
          </Field>
          <Field label="Organisation / Trade Name">
            <Input className="h-9 text-sm" placeholder="e.g. Apex Supermarkets" {...reg("orgName")} />
          </Field>
          <Field label="GST Number">
            <Input className="h-9 text-sm" placeholder="e.g. 36AABCU9603R1ZX" {...reg("gstNo")} />
          </Field>
          <Field label="Monthly Procurement Volume">
            <Sel name="monthlyVolume" placeholder="Select" options={[{v:"<500 kg",l:"< 500 kg"},{v:"500 kg – 2 T",l:"500 kg – 2 Ton"},{v:"2 T – 10 T",l:"2 – 10 Ton"},{v:"10 T – 50 T",l:"10 – 50 Ton"},{v:">50 T",l:"> 50 Ton"}]} />
          </Field>
          <Field label="Preferred Crops / Produce">
            <Input className="h-9 text-sm" placeholder="e.g. Tomato, Grapes, Onion" {...reg("preferredCrops")} />
          </Field>
          <Field label="Delivery / Service Area">
            <Input className="h-9 text-sm" placeholder="e.g. Hyderabad, GHMC zone" {...reg("deliveryArea")} />
          </Field>
          <Field label="Preferred Payment Mode">
            <Sel name="paymentMode" placeholder="Select" options={[{v:"NEFT/RTGS",l:"🏦 NEFT / RTGS"},{v:"UPI",l:"📱 UPI"},{v:"Escrow",l:"🔒 Escrow (AgroSense)"},{v:"Credit 30d",l:"📋 Credit 30 Days"}]} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── TRANSPORT ───────────────────────────────────────────────────────────────
  if (role === "transport") return (
    <div className="space-y-5">
      <Section title="Vehicle Details" icon="🚚">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Vehicle Type">
            <Sel name="vehicleType" placeholder="Select type" options={[{v:"Mini Truck (1–3T)",l:"🚛 Mini Truck (1–3T)"},{v:"Large Truck (5–10T)",l:"🚚 Large Truck (5–10T)"},{v:"Refrigerated Van",l:"❄️ Refrigerated Van"},{v:"Tempo / Auto",l:"🛺 Tempo / Auto"},{v:"Tractor Trolley",l:"🚜 Tractor Trolley"},{v:"Container Truck",l:"📦 Container Truck"}]} />
          </Field>
          <Field label="Vehicle Registration No." error={err.vehicleNo?.message}>
            <Input className="h-9 text-sm" placeholder="e.g. TS 09 EA 4512" {...reg("vehicleNo")} />
          </Field>
          <Field label="Load Capacity (Ton)">
            <Input className="h-9 text-sm" placeholder="e.g. 5" {...reg("capacity")} />
          </Field>
          <Field label="Refrigerated?">
            <Sel name="isRefrigerated" placeholder="Select" options={[{v:"Yes",l:"❄️ Yes – Refrigerated"},{v:"No",l:"🌡️ No – Normal"}]} />
          </Field>
          <Field label="Fuel Type">
            <Sel name="fuelType" placeholder="Select" options={[{v:"Diesel",l:"⛽ Diesel"},{v:"CNG",l:"💨 CNG"},{v:"Electric",l:"⚡ Electric"},{v:"Petrol",l:"🔴 Petrol"}]} />
          </Field>
          <Field label="Driver License No.">
            <Input className="h-9 text-sm" placeholder="e.g. TS0720130012345" {...reg("driverLicenseNo")} />
          </Field>
        </div>
      </Section>
      <Section title="Operations" icon="🗺️">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Operating Routes" error={err.operatingRoutes?.message}>
            <Input className="h-9 text-sm" placeholder="e.g. Warangal → Hyderabad" {...reg("operatingRoutes")} />
          </Field>
          <Field label="Avg. Trips Per Month">
            <Sel name="tripsPerMonth" placeholder="Select" options={[{v:"1–5",l:"1–5 trips"},{v:"6–15",l:"6–15 trips"},{v:"16–30",l:"16–30 trips"},{v:">30",l:"> 30 trips"}]} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── STORAGE ─────────────────────────────────────────────────────────────────
  if (role === "storage") return (
    <div className="space-y-5">
      <Section title="Facility Details" icon="🏪">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Facility / Warehouse Name">
            <Input className="h-9 text-sm" placeholder="e.g. CoolStore Warangal" {...reg("warehouseName")} />
          </Field>
          <Field label="Total Capacity (Ton)">
            <Input className="h-9 text-sm" placeholder="e.g. 200" {...reg("storageCapacity")} />
          </Field>
          <Field label="Storage Types Available">
            <Sel name="storageTypes" placeholder="Select primary type" options={[{v:"Cold Storage",l:"❄️ Cold Storage"},{v:"Warehouse",l:"🏬 Dry Warehouse"},{v:"Silo",l:"🌾 Grain Silo"},{v:"Multi-type",l:"🔄 Multi-type Facility"}]} />
          </Field>
          <Field label="Temperature Range (°C)">
            <Sel name="tempRange" placeholder="Select" options={[{v:"0–4°C",l:"0–4°C (Deep Cold)"},{v:"4–10°C",l:"4–10°C (Cold)"},{v:"10–18°C",l:"10–18°C (Cool)"},{v:"Ambient",l:"Ambient (Dry)"}]} />
          </Field>
          <Field label="Number of Units / Cells">
            <Input className="h-9 text-sm" placeholder="e.g. 4" {...reg("unitsAvailable")} />
          </Field>
          <Field label="Rate (₹ / Ton / Day)">
            <Input className="h-9 text-sm" placeholder="e.g. 25" {...reg("pricePerTonDay")} />
          </Field>
          <Field label="FSSAI License No.">
            <Input className="h-9 text-sm" placeholder="e.g. 11222333000123" {...reg("fssaiNo")} />
          </Field>
          <Field label="Insurance Covered?">
            <Sel name="insuranceCovered" placeholder="Select" options={[{v:"Yes",l:"✅ Yes – Insured"},{v:"No",l:"❌ No"}]} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── FINANCE ─────────────────────────────────────────────────────────────────
  if (role === "finance") return (
    <div className="space-y-5">
      <Section title="Institution Details" icon="🏦">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bank / Institution Name">
            <Input className="h-9 text-sm" placeholder="e.g. SBI, Andhra Bank" {...reg("orgName")} />
          </Field>
          <Field label="Branch Name">
            <Input className="h-9 text-sm" placeholder="e.g. Warangal Main Branch" {...reg("bankBranch")} />
          </Field>
          <Field label="IFSC Code">
            <Input className="h-9 text-sm" placeholder="e.g. SBIN0006789" {...reg("ifscCode")} />
          </Field>
          <Field label="Designation">
            <Input className="h-9 text-sm" placeholder="e.g. Loan Officer" {...reg("designation")} />
          </Field>
          <Field label="Employee / Staff ID">
            <Input className="h-9 text-sm" placeholder="e.g. EMP2023456" {...reg("employeeId")} />
          </Field>
        </div>
      </Section>
      <Section title="Loan Products" icon="📋">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Loan Types Offered">
            <Sel name="loanTypes" placeholder="Select primary" options={[{v:"KCC",l:"🌾 Kisan Credit Card (KCC)"},{v:"Term Loan",l:"📅 Agriculture Term Loan"},{v:"Gold Loan",l:"🥇 Gold Loan"},{v:"All Products",l:"✅ All Agriculture Products"}]} />
          </Field>
          <Field label="Max Loan Amount (₹ Lakh)">
            <Sel name="maxLoanAmount" placeholder="Select" options={[{v:"Up to 1L",l:"Up to ₹1 Lakh"},{v:"1–5L",l:"₹1 – 5 Lakh"},{v:"5–25L",l:"₹5 – 25 Lakh"},{v:">25L",l:"> ₹25 Lakh"}]} />
          </Field>
          <Field label="Interest Rate Range (%)">
            <Input className="h-9 text-sm" placeholder="e.g. 7 – 12" {...reg("interestRate")} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── FPO ─────────────────────────────────────────────────────────────────────
  if (role === "fpo") return (
    <div className="space-y-5">
      <Section title="Organisation Details" icon="🏛️">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Organisation / Department Name">
            <Input className="h-9 text-sm" placeholder="e.g. Telangana Agri Dept." {...reg("orgName")} />
          </Field>
          <Field label="Organisation Type">
            <Sel name="orgType" placeholder="Select" options={[{v:"FPO",l:"🤝 Farmer Producer Organisation"},{v:"State Agri Dept",l:"🏛️ State Agriculture Dept."},{v:"Krishi Vigyan Kendra",l:"🔬 Krishi Vigyan Kendra"},{v:"NGO",l:"💚 Agriculture NGO"},{v:"Co-operative",l:"🌾 Co-operative Society"}]} />
          </Field>
          <Field label="Registration / License No.">
            <Input className="h-9 text-sm" placeholder="e.g. FPO/TS/2021/0042" {...reg("regNo")} />
          </Field>
          <Field label="Designation">
            <Input className="h-9 text-sm" placeholder="e.g. Chief Agri. Officer" {...reg("designation")} />
          </Field>
          <Field label="No. of Member Farmers">
            <Sel name="memberCount" placeholder="Select" options={[{v:"<50",l:"< 50 farmers"},{v:"50–200",l:"50 – 200 farmers"},{v:"200–1000",l:"200 – 1,000 farmers"},{v:">1000",l:"> 1,000 farmers"}]} />
          </Field>
          <Field label="Cluster / Coverage District">
            <Input className="h-9 text-sm" placeholder="e.g. Karimnagar, Warangal" {...reg("clusterDistrict")} />
          </Field>
        </div>
      </Section>
      <Section title="Programme Details" icon="📜">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Govt. Schemes Managed">
            <Sel name="govtSchemes" placeholder="Select primary" options={[{v:"PM-KISAN",l:"🏛️ PM-KISAN"},{v:"PMFBY",l:"🛡️ Pradhan Mantri Fasal Bima"},{v:"e-NAM",l:"💻 e-NAM"},{v:"Multiple",l:"✅ Multiple Schemes"}]} />
          </Field>
          <Field label="Certification Authority">
            <Input className="h-9 text-sm" placeholder="e.g. APEDA, Organic Board" {...reg("certAuthority")} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── ANALYST ─────────────────────────────────────────────────────────────────
  if (role === "analytics") return (
    <div className="space-y-5">
      <Section title="Analyst Profile" icon="📊">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Organisation / Institute">
            <Input className="h-9 text-sm" placeholder="e.g. ICAR, Research Firm" {...reg("analyticsOrg")} />
          </Field>
          <Field label="Designation">
            <Input className="h-9 text-sm" placeholder="e.g. Market Research Analyst" {...reg("designation")} />
          </Field>
          <Field label="Research Focus Areas">
            <Input className="h-9 text-sm" placeholder="e.g. Price trends, supply chain" {...reg("researchFocus")} />
          </Field>
          <Field label="Analytics Tools Used">
            <Sel name="toolsUsed" placeholder="Select" options={[{v:"Excel/Sheets",l:"📊 Excel / Google Sheets"},{v:"Python/R",l:"🐍 Python / R"},{v:"Tableau",l:"📈 Tableau / Power BI"},{v:"All",l:"✅ Multiple Tools"}]} />
          </Field>
          <Field label="Report Frequency">
            <Sel name="reportFrequency" placeholder="Select" options={[{v:"Daily",l:"📅 Daily"},{v:"Weekly",l:"📅 Weekly"},{v:"Monthly",l:"📅 Monthly"},{v:"Ad-hoc",l:"🔄 Ad-hoc / On demand"}]} />
          </Field>
        </div>
      </Section>
    </div>
  );

  // ── ADMIN ───────────────────────────────────────────────────────────────────
  if (role === "admin") return (
    <div className="space-y-5">
      <Section title="Admin Details" icon="⚙️">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Organisation / Team">
            <Input className="h-9 text-sm" placeholder="e.g. AgroSense Ops Team" {...reg("adminOrg")} />
          </Field>
          <Field label="Designation">
            <Input className="h-9 text-sm" placeholder="e.g. Platform Administrator" {...reg("designation")} />
          </Field>
          <Field label="Access Level">
            <Sel name="accessLevel" placeholder="Select" options={[{v:"Super Admin",l:"👑 Super Admin – Full Access"},{v:"Regional Admin",l:"🗺️ Regional Admin"},{v:"Support Admin",l:"🎧 Support & Helpdesk Admin"}]} />
          </Field>
        </div>
      </Section>
    </div>
  );

  return null;
}

// ── MAIN REGISTER PAGE ─────────────────────────────────────────────────────────
export default function Register() {
  const navigate   = useNavigate();
  const { setUser } = useRole();
  const [selectedRole, setSelectedRole] = useState<AppRole>(null);
  const [roleError, setRoleError]       = useState("");
  const [step, setStep]                 = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting]     = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<FV>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const password = watch("password", "");

  const handleRoleSelect = (role: AppRole) => { setSelectedRole(role); setRoleError(""); };

  const goTo2 = () => {
    if (!selectedRole) { setRoleError("Please select a role to continue."); return; }
    setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goTo3 = async () => {
    const ok = await trigger(["name","email","phone","password","confirmPassword","location","state"]);
    if (!ok) return;
    setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (data: FV) => {
    if (!selectedRole) { setRoleError("Please select a role."); setStep(1); return; }
    setSubmitting(true);
    const roleData = ROLES.find(r => r.id === selectedRole)!;

    // Build role-specific profile object
    const profile = (() => {
      switch (selectedRole) {
        case "farmer":     return { farmArea: data.farmArea, soilType: data.soilType, irrigationType: data.irrigationType, primaryCrop: data.primaryCrop, secondaryCrop: data.secondaryCrop, harvestSeason: data.harvestSeason, annualYield: data.annualYield, farmingType: data.farmingType, landOwnership: data.landOwnership, hasKCC: data.hasKCC, bankName: data.bankName, preferredMarket: data.preferredMarket };
        case "buyer":      return { buyerType: data.buyerType, orgName: data.orgName, gstNo: data.gstNo, monthlyVolume: data.monthlyVolume, preferredCrops: data.preferredCrops, deliveryArea: data.deliveryArea, paymentMode: data.paymentMode };
        case "transport":  return { vehicleType: data.vehicleType, vehicleNo: data.vehicleNo, capacity: data.capacity, isRefrigerated: data.isRefrigerated, driverLicenseNo: data.driverLicenseNo, operatingRoutes: data.operatingRoutes, tripsPerMonth: data.tripsPerMonth, fuelType: data.fuelType };
        case "storage":    return { warehouseName: data.warehouseName, storageCapacity: data.storageCapacity, storageTypes: data.storageTypes, tempRange: data.tempRange, fssaiNo: data.fssaiNo, unitsAvailable: data.unitsAvailable, pricePerTonDay: data.pricePerTonDay, insuranceCovered: data.insuranceCovered };
        case "finance":    return { orgName: data.orgName, bankBranch: data.bankBranch, ifscCode: data.ifscCode, designation: data.designation, employeeId: data.employeeId, loanTypes: data.loanTypes, maxLoanAmount: data.maxLoanAmount, interestRate: data.interestRate };
        case "fpo":        return { orgName: data.orgName, orgType: data.orgType, regNo: data.regNo, designation: data.designation, memberCount: data.memberCount, clusterDistrict: data.clusterDistrict, govtSchemes: data.govtSchemes, certAuthority: data.certAuthority };
        case "analytics":  return { analyticsOrg: data.analyticsOrg, designation: data.designation, researchFocus: data.researchFocus, toolsUsed: data.toolsUsed, reportFrequency: data.reportFrequency };
        case "admin":      return { adminOrg: data.adminOrg, designation: data.designation, accessLevel: data.accessLevel };
        default: return undefined;
      }
    })();

    setTimeout(() => {
      setSubmitting(false);
      setUser({
        role: selectedRole,
        name: data.name,
        location: `${data.location}, ${data.state}`,
        email: data.email,
        phone: data.phone,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        profile,
      });
      navigate(roleData.path);
    }, 1100);
  };

  const activeRoleMeta = ROLES.find(r => r.id === selectedRole);

  const STEPS = [
    { n: 1 as const, label: "Choose Role" },
    { n: 2 as const, label: "Your Profile" },
    { n: 3 as const, label: `${activeRoleMeta?.label ?? "Role"} Details` },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="py-4 px-4 flex items-center justify-between border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <span className="font-bold text-primary text-lg">AgroSense</span>
          <span className="text-muted-foreground text-sm hidden sm:inline ml-1">Predictive Intelligence</span>
        </Link>
        <Link to="/login" className="text-sm text-primary underline underline-offset-2 hover:text-primary/80">
          Already have an account? Sign in
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Title */}
          <div className="text-center mb-6">
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20">🌱 Create Account</Badge>
            <h1 className="text-2xl font-bold text-foreground mb-1">Join AgroSense</h1>
            <p className="text-muted-foreground text-sm">India's smarter agriculture platform — built for everyone in the value chain.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-7">
            {STEPS.map(({ n, label }, i) => (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    step > n ? "bg-primary text-primary-foreground" :
                    step === n ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {step > n ? "✓" : n}
                  </div>
                  <span className={cn("text-xs font-medium hidden sm:block whitespace-nowrap", step >= n ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 rounded mx-1", step > n ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>

          {/* ══════════════ STEP 1: ROLE SELECTION ══════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm font-semibold text-foreground">Select your role on AgroSense</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ROLES.map(role => (
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
              {roleError && <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">{roleError}</p>}
              {selectedRole && (
                <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-2xl">{activeRoleMeta?.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-primary">{activeRoleMeta?.label} Portal</div>
                    <div className="text-xs text-muted-foreground">{activeRoleMeta?.desc} — personalised dashboard awaits</div>
                  </div>
                </div>
              )}
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={goTo2} disabled={!selectedRole}>
                Continue → Profile Details
              </Button>
            </div>
          )}

          {/* ══════════════ STEP 2: PROFILE ══════════════ */}
          {step === 2 && (
            <Card className="border-border shadow-sm">
              <CardContent className="pt-5 pb-5 px-5 space-y-5">
                {/* Role chip */}
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{activeRoleMeta?.icon}</span>
                    <div className="text-sm font-semibold text-primary">{activeRoleMeta?.label} Account</div>
                  </div>
                  <button type="button" className="text-xs text-primary underline underline-offset-2" onClick={() => setStep(1)}>Change</button>
                </div>

                <Section title="Basic Information" icon="👤">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Full Name" error={errors.name?.message} required>
                      <Input className="h-9" placeholder="e.g. Ramesh Kumar" {...register("name")} />
                    </Field>
                    <Field label="Mobile Number" error={errors.phone?.message} required>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3 bg-muted border border-input rounded-md text-sm text-muted-foreground h-9">+91</span>
                        <Input className="h-9 flex-1" placeholder="98765 43210" maxLength={10} {...register("phone")} />
                      </div>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Email Address" error={errors.email?.message} required>
                        <Input type="email" className="h-9" placeholder="you@example.com" {...register("email")} />
                      </Field>
                    </div>
                  </div>
                </Section>

                <Section title="Location" icon="📍">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Field label="Village / City" error={errors.location?.message} required>
                      <Input className="h-9" placeholder="e.g. Warangal" {...register("location")} />
                    </Field>
                    <Field label="District">
                      <Input className="h-9" placeholder="e.g. Warangal Urban" {...register("district")} />
                    </Field>
                    <Field label="State" error={errors.state?.message} required>
                      <Select onValueChange={v => { setValue("state", v); trigger("state"); }}>
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="PIN Code" error={errors.pincode?.message}>
                      <Input className="h-9" placeholder="e.g. 506001" maxLength={6} {...register("pincode")} />
                    </Field>
                  </div>
                </Section>

                <Section title="Set Password" icon="🔐">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Password" error={errors.password?.message} required>
                      <Input type="password" className="h-9" placeholder="Min 8 chars" {...register("password")} />
                      <PwStrength pw={password} />
                    </Field>
                    <Field label="Confirm Password" error={errors.confirmPassword?.message} required>
                      <Input type="password" className="h-9" placeholder="Re-enter password" {...register("confirmPassword")} />
                    </Field>
                  </div>
                </Section>

                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="outline" className="flex-1 border-border" onClick={() => setStep(1)}>← Back</Button>
                  <Button type="button" className="flex-1 bg-primary hover:bg-primary/90" onClick={goTo3}>
                    Continue → {activeRoleMeta?.label} Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ══════════════ STEP 3: ROLE-SPECIFIC DATA ══════════════ */}
          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Card className="border-border shadow-sm">
                <CardContent className="pt-5 pb-5 px-5 space-y-5">
                  {/* Header */}
                  <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl border-2 bg-primary/5 border-primary/20">
                    <span className="text-3xl">{activeRoleMeta?.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-foreground">{activeRoleMeta?.label} — Operational Details</div>
                      <div className="text-xs text-muted-foreground">This data personalises your dashboard and powers platform analytics</div>
                    </div>
                  </div>

                  {/* Dynamic role fields */}
                  <RoleFields role={selectedRole} reg={register} err={errors} set={setValue} />

                  {/* Data usage notice */}
                  <div className="rounded-lg bg-muted/50 border border-border px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">🔒 Data Privacy:</span> Your operational data is used exclusively to personalise your dashboard, match you with relevant buyers/sellers, and generate anonymised platform analytics. It is never sold to third parties.
                    </p>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-muted-foreground">
                    By creating an account you agree to AgroSense's{" "}
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Terms of Service</span> and{" "}
                    <span className="text-primary underline underline-offset-2 cursor-pointer">Privacy Policy</span>.
                  </p>

                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="flex-1 border-border" onClick={() => setStep(2)}>← Back</Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : `🌱 Create ${activeRoleMeta?.label} Account`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          <p className="text-center text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-primary underline underline-offset-2 hover:text-primary/80">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
