import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, Calculator } from "lucide-react";
import { useCompany } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { CalculatorModal } from "./CalculatorModal";

/**
 * Reusable sticky navbar for landing + blog pages.
 * Use `homeAsAnchors` on the landing page (so #beranda etc. scroll); on
 * other pages the same items become "/" + hash so they navigate home first.
 */
export function SiteNavbar({ homeAsAnchors = false }: { homeAsAnchors?: boolean }) {
  const { t } = useT();
  const { data: c } = useCompany();
  const company = c ?? { name: "LJS", whatsapp: "", logoDataUrl: null };
  const waNumber = (company.whatsapp || "").replace(/[^\d]/g, "");
  const waLink = waNumber ? `https://wa.me/${waNumber}` : "#";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = (hash: string) => (homeAsAnchors ? hash : `/${hash}`);
  const navItems = [
    { href: link("#beranda"), label: t.nav_home },
    { href: link("#tentang"), label: t.nav_about },
    { href: link("#layanan"), label: t.nav_services },
    { href: link("#paket"), label: t.nav_packages },
    { href: "/blog", label: t.nav_blog, asLink: true as const },
    { href: link("#faq"), label: t.nav_faq },
    { href: link("#kontak"), label: t.nav_contact },
  ];

  return (
    <>
      <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.jpeg" alt="LJS" className="h-9 w-9 object-contain rounded" />
            <div className="font-bold text-[#0b2545] text-base leading-tight">{company.name}</div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {navItems.map((n) =>
              n.asLink ? (
                <Link key={n.label} to={n.href} className="hover:text-[#0b2545] transition-colors">{n.label}</Link>
              ) : (
                <a key={n.label} href={n.href} className="hover:text-[#0b2545] transition-colors">{n.label}</a>
              )
            )}
            <button onClick={() => setCalcOpen(true)} className="inline-flex items-center gap-1.5 hover:text-[#0b2545] transition-colors">
              <Calculator className="h-4 w-4" /> {t.nav_calc}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setCalcOpen(true)} className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 hover:bg-slate-50" aria-label="Kalkulator Pajak" title="Kalkulator Pajak">
              <Calculator className="h-4 w-4 text-[#0b2545]" />
            </button>
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
              {navItems.map((n) =>
                n.asLink ? (
                  <Link key={n.label} to={n.href} onClick={() => setMenuOpen(false)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700">{n.label}</Link>
                ) : (
                  <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700">{n.label}</a>
                )
              )}
              <button onClick={() => { setMenuOpen(false); setCalcOpen(true); }} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700 inline-flex items-center gap-2 text-left">
                <Calculator className="h-4 w-4" /> {t.nav_calc}
              </button>
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