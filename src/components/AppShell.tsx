import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { Users, FileBarChart2, Package, Building2, Menu, X, PanelLeftClose, PanelLeft, Globe, LogOut, Newspaper } from "lucide-react";
import { useState } from "react";
import { adminLogout, useCompany } from "@/lib/store";

const nav = [
  { to: "/clients", label: "Client", icon: Users },
  { to: "/laporan", label: "Laporan", icon: FileBarChart2 },
  { to: "/paket", label: "Paket Jasa", icon: Package },
  { to: "/artikel", label: "Artikel", icon: Newspaper },
  { to: "/settings", label: "Profil Perusahaan", icon: Building2 },
];

export function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { data: company } = useCompany();

  const handleLogout = () => {
    adminLogout();
    navigate({ to: "/admin/login" });
  };

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  // Nama & inisial dari data perusahaan, fallback jika belum dimuat
  const companyName = company?.name || "Admin";
  const companyTagline = company?.tagline || "Manajemen Sistem";
  const companyInitial = companyName.charAt(0).toUpperCase();
  const logoUrl = company?.logoDataUrl;

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`no-print fixed lg:static inset-y-0 left-0 z-40 bg-sidebar text-sidebar-foreground transform transition-all duration-200 ${
          openMobile ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "lg:w-16" : "lg:w-64"} w-64`}
      >
        {/* Logo & Nama Perusahaan */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <Link to="/laporan" className="flex items-center gap-2.5 min-w-0" onClick={() => setOpenMobile(false)}>
            {/* Logo: tampilkan gambar jika ada, fallback ke inisial */}
            <div className="h-9 w-9 shrink-0 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={companyName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm">{companyInitial}</span>
              )}
            </div>
            {/* Nama & tagline — disembunyikan saat collapsed */}
            <div className={`min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <div className="font-semibold leading-tight text-sm truncate">{companyName}</div>
              <div className="text-[11px] opacity-60 truncate">{companyTagline || "Admin Panel"}</div>
            </div>
          </Link>
          {/* Tombol tutup mobile */}
          <button onClick={() => setOpenMobile(false)} className="lg:hidden p-1 rounded hover:bg-sidebar-accent shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const Active = isActive(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpenMobile(false)}
                title={n.label}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${collapsed ? "lg:justify-center lg:px-2" : ""} ${
                  Active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
                    : "hover:bg-sidebar-accent text-sidebar-foreground/85"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? "lg:hidden" : ""}>{n.label}</span>
              </Link>
            );
          })}
          <Link
            to="/"
            onClick={() => setOpenMobile(false)}
            title="Lihat Landing Page"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mt-4 border-t border-sidebar-border pt-4 hover:bg-sidebar-accent text-sidebar-foreground/85 ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Landing Page</span>
          </Link>
        </nav>

        {/* Logout di bawah sidebar */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 border-t border-sidebar-border`}>
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors ${collapsed ? "lg:justify-center lg:px-2" : ""}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {openMobile && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpenMobile(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center px-4 gap-3 sticky top-0 z-20 no-print">
          {/* Hamburger mobile */}
          <button
            className="lg:hidden p-2 -ml-2 rounded hover:bg-muted"
            onClick={() => setOpenMobile(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* Toggle collapse desktop */}
          <button
            className="hidden lg:inline-flex p-2 -ml-2 rounded hover:bg-muted"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          {/* Breadcrumb / title */}
          <div className="text-sm text-muted-foreground truncate">
            {companyName} — Admin Panel
          </div>
          {/* Logout di header (khusus mobile agar tetap mudah akses) */}
          <button
            onClick={handleLogout}
            className="ml-auto lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm hover:bg-muted text-muted-foreground"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <main className="flex-1 p-4 lg:p-6 print-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}