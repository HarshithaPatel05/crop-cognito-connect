import React, { createContext, useContext, useState, useEffect } from "react";

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

export interface RoleUser {
  role: AppRole;
  name: string;
  location: string;
  email: string;
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
