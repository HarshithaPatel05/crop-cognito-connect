import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole, ROLE_META, AppRole } from "@/context/RoleContext";

// Role-specific nav items: only show relevant pages per role
const ROLE_NAV: Record<Exclude<AppRole, null>, { title: string; url: string; icon: string }[]> = {
  farmer: [
    { title: "My Dashboard", url: "/farmer", icon: "👨‍🌾" },
    { title: "Marketplace", url: "/marketplace", icon: "🛒" },
    { title: "Finance & Loans", url: "/finance", icon: "💰" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
    { title: "Waste Management", url: "/waste", icon: "♻️" },
  ],
  buyer: [
    { title: "Marketplace", url: "/marketplace", icon: "🛒" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
    { title: "Finance", url: "/finance", icon: "💰" },
  ],
  transport: [
    { title: "Transport Hub", url: "/transport", icon: "🚚" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
  ],
  storage: [
    { title: "Storage Dashboard", url: "/storage", icon: "🏪" },
    { title: "Waste Management", url: "/waste", icon: "♻️" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
  ],
  finance: [
    { title: "Finance & Loans", url: "/finance", icon: "💰" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
    { title: "Admin Panel", url: "/admin", icon: "⚙️" },
  ],
  fpo: [
    { title: "FPO / AO Portal", url: "/fpo", icon: "🏛️" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
    { title: "Farmer Dashboards", url: "/farmer", icon: "👨‍🌾" },
  ],
  analytics: [
    { title: "Analytics Dashboard", url: "/analytics", icon: "📊" },
    { title: "Marketplace Trends", url: "/marketplace", icon: "🛒" },
    { title: "FPO Portal", url: "/fpo", icon: "🏛️" },
  ],
  admin: [
    { title: "Admin Panel", url: "/admin", icon: "⚙️" },
    { title: "Farmer Dashboard", url: "/farmer", icon: "👨‍🌾" },
    { title: "Marketplace", url: "/marketplace", icon: "🛒" },
    { title: "Transport", url: "/transport", icon: "🚚" },
    { title: "Storage", url: "/storage", icon: "🏪" },
    { title: "Finance & Loans", url: "/finance", icon: "💰" },
    { title: "Analytics", url: "/analytics", icon: "📊" },
    { title: "FPO / Agri Officer", url: "/fpo", icon: "🏛️" },
    { title: "Waste Management", url: "/waste", icon: "♻️" },
  ],
};

// Fallback nav if not logged in
const ALL_NAV = [
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
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, logout } = useRole();
  const collapsed = state === "collapsed";

  const navItems = user ? (ROLE_NAV[user.role!] ?? ALL_NAV) : ALL_NAV;
  const roleMeta = user?.role ? ROLE_META[user.role] : null;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-sidebar-border">
        <span className="text-2xl">🌾</span>
        {!collapsed && (
          <div>
            <div className="text-sidebar-foreground font-bold text-sm">AgroSense</div>
            <div className="text-sidebar-foreground/60 text-xs">Smart Agriculture</div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {user && !collapsed && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div className="flex items-center gap-2 bg-sidebar-accent/60 rounded-lg px-2.5 py-1.5">
            <span className="text-base">{roleMeta?.icon}</span>
            <div>
              <div className="text-sidebar-foreground text-xs font-semibold">{roleMeta?.label}</div>
              <div className="text-sidebar-foreground/60 text-[10px]">Active Role</div>
            </div>
          </div>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/60 uppercase text-xs tracking-wider">
              {user ? "My Features" : "Platform"}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
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

      {/* User profile + logout */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-accent-foreground flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sidebar-foreground text-xs font-medium truncate">{user.name}</div>
                  <div className="text-sidebar-foreground/60 text-[10px] truncate">{user.location}</div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-7 border-sidebar-border text-sidebar-foreground/70 hover:text-sidebar-foreground"
                onClick={() => { logout(); navigate("/login"); }}
              >
                🚪 Logout
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="w-full text-xs h-7 bg-primary"
              onClick={() => navigate("/login")}
            >
              🔐 Login
            </Button>
          )}
        </div>
      )}
    </Sidebar>
  );
}

interface AppLayoutProps { children: React.ReactNode; title: string; subtitle?: string; }

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const { user, logout } = useRole();
  const navigate = useNavigate();
  const roleMeta = user?.role ? ROLE_META[user.role] : null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebarInner />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-20">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm truncate">{title}</div>
              {subtitle && <div className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</div>}
            </div>
            <div className="flex items-center gap-2">
              {/* Role chip */}
              {user && roleMeta && (
                <div className="hidden sm:flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1">
                  <span className="text-sm">{roleMeta.icon}</span>
                  <span className="text-xs font-medium text-primary">{roleMeta.label}</span>
                </div>
              )}
              <Badge variant="outline" className="text-xs bg-agro-green-light text-primary border-primary/30 hidden md:flex">
                <span className="pulse-live w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                Live
              </Badge>
              {user ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 border-border"
                  onClick={() => { logout(); navigate("/login"); }}
                >
                  🚪 Logout
                </Button>
              ) : (
                <Button size="sm" className="bg-primary text-xs h-8" onClick={() => navigate("/login")}>
                  🔐 Login
                </Button>
              )}
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
