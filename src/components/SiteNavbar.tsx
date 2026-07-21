import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, MessageCircle, Calculator, Shield } from "lucide-react";
import { useCompany } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CalculatorModal } from "./CalculatorModal";

/**
 * Kunci sessionStorage yang dipakai untuk meneruskan target scroll
 * dari halaman lain ke halaman utama (tanpa hash di URL).
 */
export const SCROLL_TARGET_KEY = "ljs_scroll_target";

/**
 * Reusable sticky navbar untuk landing + blog pages.
 * Klik nav di halaman mana pun: jika sudah di "/", langsung scroll;
 * jika di halaman lain, simpan target di sessionStorage lalu navigate ke "/".
 * Halaman index.tsx membaca sessionStorage saat mount dan scroll ke section yang tepat.
 */
export function SiteNavbar() {
  const { t } = useT();
  const { data: c } = useCompany();
  const company = c ?? { name: "LJS", whatsapp: "", logoDataUrl: null };
  const waNumber = (company.whatsapp || "").replace(/[^\d]/g, "");
  const waLink = waNumber ? `https://wa.me/${waNumber}` : "#";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    setMenuOpen(false);
    if (isHome) {
      // Sudah di home — langsung scroll tanpa ubah URL
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Dari halaman lain — simpan target, navigate ke home
      sessionStorage.setItem(SCROLL_TARGET_KEY, sectionId);
      navigate({ to: "/" });
    }
  };

  const navItems = [
    { id: "beranda", label: t.nav_home },
    { id: "tentang", label: t.nav_about },
    { id: "layanan", label: t.nav_services },
    { id: "paket", label: t.nav_packages },
    { id: "faq", label: t.nav_faq },
    { id: "kontak", label: t.nav_contact },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => handleNavClick("beranda")} className="flex items-center gap-2.5">
            <img src="/logo.jpeg" alt="LJS" className="h-9 w-9 object-contain rounded" />
            <div className="font-bold text-[#0b2545] text-base leading-tight">{company.name}</div>
          </button>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {navItems.map((n) => (
              <button key={n.id} onClick={() => handleNavClick(n.id)} className="hover:text-[#0b2545] transition-colors">
                {n.label}
              </button>
            ))}
            <Link to="/blog" className="hover:text-[#0b2545] transition-colors">
              {t.nav_blog}
            </Link>
            <button onClick={() => setCalcOpen(true)} className="inline-flex items-center gap-1.5 hover:text-[#0b2545] transition-colors">
              <Calculator className="h-4 w-4" /> {t.nav_calc}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setCalcOpen(true)} className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 hover:bg-slate-50" aria-label="Kalkulator Pajak" title="Kalkulator Pajak">
              <Calculator className="h-4 w-4 text-[#0b2545]" />
            </button>
            <Link to="/admin/login"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0b2545] font-medium text-sm transition-all">
              <Shield className="h-3.5 w-3.5" /> Login Admin
            </Link>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold text-sm shadow-sm transition-all hover:shadow-md">
              <MessageCircle className="h-4 w-4" /> {t.cta_wa}
            </a>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-md hover:bg-slate-100" aria-label="Menu">
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="px-4 py-3 flex flex-col gap-1 text-sm font-medium">
              {navItems.map((n) => (
                <button key={n.id} onClick={() => handleNavClick(n.id)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700 text-left w-full">
                  {n.label}
                </button>
              ))}
              <Link to="/blog" onClick={() => setMenuOpen(false)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700">
                {t.nav_blog}
              </Link>
              <button onClick={() => { setMenuOpen(false); setCalcOpen(true); }} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700 inline-flex items-center gap-2 text-left">
                <Calculator className="h-4 w-4" /> {t.nav_calc}
              </button>
              <Link to="/admin/login" onClick={() => setMenuOpen(false)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-500 inline-flex items-center gap-2">
                <Shield className="h-4 w-4" /> Login Admin
              </Link>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#16a34a] text-white font-semibold">
                <MessageCircle className="h-4 w-4" /> {t.cta_wa}
              </a>
            </nav>
          </div>
        )}
      </header>

      <CalculatorModal open={calcOpen} onOpenChange={setCalcOpen} />
    </>
  );
}