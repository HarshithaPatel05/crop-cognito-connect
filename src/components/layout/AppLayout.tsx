import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { title: "Farmer Dashboard", url: "/farmer", icon: "👨‍🌾" },
  { title: "Buyer Marketplace", url: "/marketplace", icon: "🛒" },
  { title: "Transport", url: "/transport", icon: "🚚" },
  { title: "Storage", url: "/storage", icon: "🏪" },
  { title: "Waste Mgmt", url: "/waste", icon: "♻️" },
  { title: "Finance & Loans", url: "/finance", icon: "💰" },
  { title: "Analytics", url: "/analytics", icon: "📊" },
  { title: "FPO / Agri Officer", url: "/fpo", icon: "🏛️" },
  { title: "Admin Panel", url: "/admin", icon: "⚙️" },
];

function AppSidebarInner() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <span className="text-2xl">🌾</span>
        {!collapsed && (
          <div>
            <div className="text-sidebar-foreground font-bold text-sm">AgroSense</div>
            <div className="text-sidebar-foreground/60 text-xs">Smart Agriculture</div>
          </div>
        )}
      </div>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">Platform</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground">RK</div>
            <div>
              <div className="text-sidebar-foreground text-xs font-medium">Ramesh Kumar</div>
              <div className="text-sidebar-foreground/60 text-xs">Farmer · Warangal</div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  );
}

interface AppLayoutProps { children: React.ReactNode; title: string; subtitle?: string; }

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebarInner />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1">
              <div className="font-semibold text-foreground text-sm">{title}</div>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="farmer" onValueChange={(v) => {
                const map: Record<string, string> = { farmer: "/farmer", buyer: "/marketplace", transport: "/transport", fpo: "/fpo", admin: "/admin" };
                if (map[v]) navigate(map[v]);
              }}>
                <SelectTrigger className="h-8 text-xs w-40 border-border">
                  <SelectValue placeholder="Switch Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmer">👨‍🌾 Farmer</SelectItem>
                  <SelectItem value="buyer">🛒 Buyer</SelectItem>
                  <SelectItem value="transport">🚚 Transport</SelectItem>
                  <SelectItem value="fpo">🏛️ FPO / AO</SelectItem>
                  <SelectItem value="admin">⚙️ Admin</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="text-xs bg-agro-green-light text-primary border-primary/30 hidden sm:flex">
                <span className="pulse-live w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                Live
              </Badge>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
