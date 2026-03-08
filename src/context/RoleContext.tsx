import React, { createContext, useContext, useState } from "react";

export type AppRole =
  | "farmer"
  | "buyer"
  | "transport"
  | "storage"
  | "finance"
  | "fpo"
  | "analytics"
  | "admin"
  | null;

// ── Per-role profile data collected during registration ──────────────────────
export interface FarmerProfile {
  farmArea?: string; soilType?: string; irrigationType?: string;
  primaryCrop?: string; secondaryCrop?: string; harvestSeason?: string;
  annualYield?: string; farmingType?: string; landOwnership?: string;
  hasKCC?: string; bankName?: string; preferredMarket?: string;
}
export interface BuyerProfile {
  buyerType?: string; orgName?: string; gstNo?: string;
  monthlyVolume?: string; preferredCrops?: string;
  deliveryArea?: string; paymentMode?: string;
}
export interface TransportProfile {
  vehicleType?: string; vehicleNo?: string; capacity?: string;
  isRefrigerated?: string; driverLicenseNo?: string;
  operatingRoutes?: string; tripsPerMonth?: string; fuelType?: string;
}
export interface StorageProfile {
  warehouseName?: string; storageCapacity?: string; storageTypes?: string;
  tempRange?: string; fssaiNo?: string; unitsAvailable?: string;
  pricePerTonDay?: string; insuranceCovered?: string;
}
export interface FinanceProfile {
  orgName?: string; bankBranch?: string; ifscCode?: string;
  designation?: string; employeeId?: string;
  loanTypes?: string; maxLoanAmount?: string; interestRate?: string;
}
export interface FPOProfile {
  orgName?: string; orgType?: string; regNo?: string;
  designation?: string; memberCount?: string;
  clusterDistrict?: string; govtSchemes?: string; certAuthority?: string;
}
export interface AnalyticsProfile {
  analyticsOrg?: string; designation?: string;
  researchFocus?: string; toolsUsed?: string; reportFrequency?: string;
}
export interface AdminProfile {
  adminOrg?: string; designation?: string; accessLevel?: string;
}

export type RoleProfile =
  | FarmerProfile | BuyerProfile | TransportProfile | StorageProfile
  | FinanceProfile | FPOProfile | AnalyticsProfile | AdminProfile;

export interface RoleUser {
  role: AppRole;
  name: string;
  location: string;
  email: string;
  phone?: string;
  district?: string;
  state?: string;
  pincode?: string;
  profile?: RoleProfile;
}

interface RoleContextType {
  user: RoleUser | null;
  setUser: (u: RoleUser | null) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<RoleUser | null>(() => {
    try {
      const stored = localStorage.getItem("agrosense_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUser = (u: RoleUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("agrosense_user", JSON.stringify(u));
    else localStorage.removeItem("agrosense_user");
  };

  const logout = () => setUser(null);

  return (
    <RoleContext.Provider value={{ user, setUser, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}

export const ROLE_META: Record<
  Exclude<AppRole, null>,
  { icon: string; label: string; path: string; color: string }
> = {
  farmer: { icon: "👨‍🌾", label: "Farmer", path: "/farmer", color: "text-primary" },
  buyer: { icon: "🛒", label: "Buyer", path: "/marketplace", color: "text-agro-sky" },
  transport: { icon: "🚚", label: "Transport Owner", path: "/transport", color: "text-secondary" },
  storage: { icon: "🏪", label: "Storage Manager", path: "/storage", color: "text-accent" },
  finance: { icon: "💰", label: "Finance Officer", path: "/finance", color: "text-secondary" },
  fpo: { icon: "🏛️", label: "FPO / Agri Officer", path: "/fpo", color: "text-primary" },
  analytics: { icon: "📊", label: "Analyst", path: "/analytics", color: "text-agro-sky" },
  admin: { icon: "⚙️", label: "Admin", path: "/admin", color: "text-destructive" },
};
