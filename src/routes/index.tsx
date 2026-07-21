import { createFileRoute, Link } from "@tanstack/react-router";
import { useCompany, usePackages, useArticles } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { useState, useEffect } from "react";
import { useT } from "@/lib/i18n";
import {
  Phone, Mail, MapPin, Instagram, MessageCircle, Music2, Star, Check, X, Gift,
  ArrowRight, Shield, Clock, Users, FileCheck, Menu, ChevronDown,
  FileText, MessageSquare, RefreshCw, FileSignature, BookOpen, ShieldCheck,
  Calculator, Newspaper, ChevronLeft, ChevronRight, Quote,
} from "lucide-react";
import { CalculatorModal } from "@/components/CalculatorModal";
import { ArticleBottomSheet } from "@/components/ArticleBottomSheet";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Layanan Jasa Pajak Profesional — LJS Konsultan Pajak untuk Bisnis & UMKM" },
      { name: "description", content: "Layanan jasa pajak profesional terpercaya: pelaporan SPT tahunan & bulanan, konsultasi pajak, pembetulan pajak, pengurusan NPWP/PKP, pembukuan usaha, dan pendampingan pemeriksaan pajak untuk UMKM dan perusahaan." },
      { name: "keywords", content: "layanan jasa pajak, konsultan pajak, jasa pajak profesional, pelaporan SPT, pengurusan NPWP, jasa pajak UMKM, konsultan pajak online, jasa perpajakan" },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://layanan-jasa-solusi.vercel.app/" },
      { property: "og:title", content: "Layanan Jasa Pajak Profesional — LJS Konsultan Pajak untuk Bisnis & UMKM" },
      { property: "og:description", content: "Layanan jasa pajak profesional: pelaporan SPT, konsultasi pajak, pembetulan pajak, NPWP/PKP, pembukuan, dan pendampingan pemeriksaan pajak." },
      { property: "og:image", content: "https://layanan-jasa-solusi.vercel.app/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "id_ID" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Layanan Jasa Pajak Profesional — LJS Konsultan Pajak" },
      { name: "twitter:description", content: "Layanan jasa pajak profesional: pelaporan SPT, konsultasi, pengurusan NPWP/PKP, dan pendampingan pemeriksaan pajak untuk UMKM & perusahaan." },
      { name: "twitter:image", content: "https://layanan-jasa-solusi.vercel.app/og-image.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "LJS — Layanan Jasa Pajak Profesional",
          "description": "Layanan jasa pajak profesional untuk bisnis dan UMKM. Pelaporan SPT tahunan & bulanan, konsultasi pajak, pengurusan NPWP/PKP, pembukuan usaha, dan pendampingan pemeriksaan pajak.",
          "url": "https://layanan-jasa-solusi.vercel.app",
          "image": "https://layanan-jasa-solusi.vercel.app/og-image.png",
          "priceRange": "$$",
          "inLanguage": "id",
          "areaServed": "Indonesia",
          "knowsAbout": ["Perpajakan Indonesia", "PPh 21", "PPh Badan", "PPN", "SPT Tahunan", "SPT Masa"],
          "serviceType": [
            "Layanan Jasa Pajak",
            "Konsultan Pajak",
            "Pelaporan SPT Tahunan",
            "Pelaporan SPT Bulanan",
            "Pengurusan NPWP",
            "Pengurusan PKP",
            "Pembukuan Usaha",
            "Pendampingan Pemeriksaan Pajak",
            "Pembetulan Pajak",
            "Konsultasi Pajak UMKM",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Apa itu layanan jasa pajak?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Layanan jasa pajak adalah layanan profesional yang membantu individu, UMKM, dan perusahaan dalam mengelola kewajiban perpajakan, termasuk pelaporan SPT, konsultasi pajak, pengurusan NPWP/PKP, pembukuan usaha, pembetulan pajak, dan pendampingan pemeriksaan pajak."
              }
            },
            {
              "@type": "Question",
              "name": "Apa saja bentuk layanan jasa pajak yang tersedia?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Layanan jasa pajak meliputi: (1) Pelaporan SPT tahunan dan bulanan, (2) Konsultasi pajak untuk bisnis dan UMKM, (3) Pembetulan laporan pajak, (4) Pengurusan NPWP dan PKP, (5) Pembukuan dan pencatatan keuangan usaha, (6) Pendampingan saat pemeriksaan pajak oleh otoritas."
              }
            },
            {
              "@type": "Question",
              "name": "Berapa biaya layanan jasa pajak?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Biaya layanan jasa pajak bervariasi tergantung jenis dan kompleksitas pekerjaan. Kami menyediakan beberapa paket layanan yang bisa disesuaikan dengan kebutuhan dan skala bisnis Anda. Hubungi kami untuk konsultasi gratis dan penawaran harga."
              }
            },
            {
              "@type": "Question",
              "name": "Apakah layanan jasa pajak ini melayani UMKM?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ya, kami melayani UMKM, freelancer, pedagang online, hingga perusahaan skala besar. Kami memahami kebutuhan khusus UMKM dalam perpajakan, termasuk pemanfaatan tarif PPh Final 0,5% sesuai PP 55/2022."
              }
            },
            {
              "@type": "Question",
              "name": "Apakah konsultasi pajak bisa dilakukan secara online?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ya, konsultasi dapat dilakukan secara online melalui WhatsApp, telepon, atau video call, maupun offline di kantor kami. Proses pengiriman dokumen juga dapat dilakukan secara digital untuk kemudahan Anda."
              }
            },
            {
              "@type": "Question",
              "name": "Apakah data wajib pajak klien terjamin keamanannya?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Kerahasiaan data klien adalah prioritas utama kami. Seluruh informasi dan dokumen perpajakan Anda dijaga dengan standar keamanan tinggi dan hanya diakses oleh tim profesional yang berwenang."
              }
            },
            {
              "@type": "Question",
              "name": "Apa perbedaan SPT Tahunan dan SPT Masa?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "SPT Tahunan adalah laporan pajak yang disampaikan setahun sekali, mencakup total penghasilan dan pajak terutang selama satu tahun pajak. SPT Masa adalah laporan pajak yang disampaikan setiap bulan, seperti laporan PPh Pasal 21 karyawan atau PPN. Kami membantu keduanya."
              }
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useT();
  const { data: c } = useCompany();
  const { data: packages = [] } = usePackages();
  const { data: latest = [], isLoading: latestLoading } = useArticles({ onlyPublished: true });
  const company = c ?? { name: "LJS", tagline: "", phone: "", email: "", address: "", instagram: "", whatsapp: "", tiktok: "", visi: "", misi: "", logoDataUrl: null, mapsEmbedUrl: "" };
  const waNumber = (company.whatsapp || "").replace(/[^\d]/g, "");
  const waLink = waNumber ? `https://wa.me/${waNumber}` : "#kontak";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [selArticle, setSelArticle] = useState<(typeof latest)[0] | null>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderPrice = (p: { price: number; priceMax: number | null }) =>
    p.priceMax && p.priceMax > p.price
      ? `${formatRupiah(p.price, { withSymbol: true })} – ${formatRupiah(p.priceMax, { withSymbol: true })}`
      : formatRupiah(p.price, { withSymbol: true });

  const navItems = [
    { href: "#beranda", label: t.nav_home },
    { href: "#tentang", label: t.nav_about },
    { href: "#layanan", label: t.nav_services },
    { href: "#paket", label: t.nav_packages },
    { href: "#artikel", label: t.nav_blog },
    { href: "#faq", label: t.nav_faq },
    { href: "#kontak", label: t.nav_contact },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* NAVBAR */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="#beranda" className="flex items-center gap-2.5">
            <img src="/logo.jpeg" alt={company.name} className="h-9 w-9 object-contain rounded" />
            <div className="font-bold text-[#0b2545] text-base leading-tight">{company.name}</div>
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            {navItems.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-[#0b2545] transition-colors">{n.label}</a>
            ))}
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
              {navItems.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="py-2.5 px-2 rounded hover:bg-slate-50 text-slate-700">{n.label}</a>
              ))}
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

      {/* HERO */}
      <section id="beranda" className="bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-14 md:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b2545]/5 text-[#0b2545] text-xs font-semibold mb-5">
              <ShieldCheck className="h-3.5 w-3.5" /> {t.badge_trusted}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-[#0b2545]">{t.hero_title}</h1>
            <p className="mt-5 text-slate-600 text-base md:text-lg leading-relaxed">{t.hero_sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#16a34a] hover:bg-[#15803d] text-white font-semibold shadow-md hover:shadow-lg transition-all">
                <MessageCircle className="h-5 w-5" /> {t.cta_consult}
              </a>
              <a href="#layanan" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border-2 border-[#0b2545] text-[#0b2545] hover:bg-[#0b2545] hover:text-white font-semibold transition-all">
                {t.cta_see_services} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#16a34a]" /> {t.trust_fast}</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#16a34a]" /> {t.trust_safe}</div>
              <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-[#16a34a]" /> {t.trust_support}</div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#0b2545] to-[#1e3a5f] p-8 shadow-2xl flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-[#0b2545] text-white flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                    <div>
                      <div className="text-xs text-slate-500">Laporan Pajak</div>
                      <div className="font-bold text-[#0b2545] text-sm">SPT Tahunan</div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 font-semibold">Selesai</span>
                </div>
                <div className="space-y-3">
                  {[
                    { l: "Penghasilan Bruto", v: "Rp 850.000.000" },
                    { l: "PPh Terutang", v: "Rp 21.250.000" },
                    { l: "Status", v: "Lapor ✓", green: true },
                  ].map((r) => (
                    <div key={r.l} className="flex justify-between text-sm">
                      <span className="text-slate-500">{r.l}</span>
                      <span className={`font-semibold ${r.green ? "text-[#16a34a]" : "text-slate-800"}`}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t flex items-center gap-2 text-xs text-slate-500">
                  <Shield className="h-3.5 w-3.5 text-[#0b2545]" /> Dijamin akurat &amp; tepat waktu
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users className="h-6 w-6" />, n: "100+", l: "Client Dibantu" },
            { icon: <FileCheck className="h-6 w-6" />, n: "500+", l: "Pelaporan Selesai" },
            { icon: <Clock className="h-6 w-6" />, n: "Fast", l: "Support Cepat" },
            { icon: <Shield className="h-6 w-6" />, n: "Aman", l: "Data Terjaga" },
          ].map((t2) => (
            <div key={t2.l} className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="inline-flex h-11 w-11 rounded-lg bg-[#0b2545] text-white items-center justify-center mb-3">{t2.icon}</div>
              <div className="text-xl md:text-2xl font-bold text-[#0b2545]">{t2.n}</div>
              <div className="text-xs md:text-sm text-slate-600 mt-0.5">{t2.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="py-16 md:py-20 bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_about_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_about_title}</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">{t.sec_about_desc}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs font-bold tracking-widest text-[#0b2545] uppercase mb-2">{t.label_visi}</div>
              <p className="text-slate-700 leading-relaxed">{company.visi || "—"}</p>
            </div>
            <div className="bg-white border rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-xs font-bold tracking-widest text-[#0b2545] uppercase mb-2">{t.label_misi}</div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">{company.misi || "—"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* LAYANAN */}
      <section id="layanan" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_services_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_services_title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[<FileText />, <MessageSquare />, <RefreshCw />, <FileSignature />, <BookOpen />, <ShieldCheck />].map((icon, i) => {
              const s = t.services[i];
              return (
                <div key={s.t} className="group bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0b2545] hover:shadow-lg hover:-translate-y-1 transition-all">
                  <div className="inline-flex h-12 w-12 rounded-lg bg-[#0b2545]/5 text-[#0b2545] group-hover:bg-[#0b2545] group-hover:text-white items-center justify-center mb-4 transition-colors [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
                  <h3 className="font-bold text-[#0b2545] text-lg mb-2">{s.t}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{s.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PAKET */}
      <section id="paket" className="py-16 md:py-20 bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_packages_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_packages_title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => {
              const frees = p.frees.split("\n").map((s) => s.trim()).filter(Boolean);
              const excludes = p.excludes.split("\n").map((s) => s.trim()).filter(Boolean);
              const includes = p.description.split("\n").map((s) => s.trim()).filter(Boolean);
              return (
                <div key={p.id} className={`relative bg-white rounded-2xl p-7 flex flex-col transition-all ${p.highlight ? "ring-2 ring-[#16a34a] shadow-xl lg:scale-[1.03]" : "border border-slate-200 shadow-sm hover:shadow-md"}`}>
                  {p.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#16a34a] text-white text-xs font-bold whitespace-nowrap">
                      <Star className="h-3 w-3 fill-current" /> {t.label_popular}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-[#0b2545]">{p.name}</h3>
                  <div className="mt-4 mb-5">
                    {p.originalPrice > p.price && (
                      <div className="text-sm text-slate-400 line-through">{formatRupiah(p.originalPrice, { withSymbol: true })}</div>
                    )}
                    <div className="text-2xl font-bold text-[#0b2545] mt-1">{renderPrice(p)}</div>
                  </div>
                  {frees.length > 0 && (
                    <div className="mb-5 rounded-lg border-2 border-dashed border-[#16a34a]/40 bg-[#16a34a]/5 p-3">
                      <div className="flex items-center gap-1.5 text-[#16a34a] font-bold text-xs uppercase tracking-wide mb-1.5">
                        <Gift className="h-3.5 w-3.5" /> {t.label_bonus}
                      </div>
                      <ul className="space-y-1 text-sm">
                        {frees.map((line, i) => (
                          <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><span className="font-medium text-slate-700">{line}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <ul className="space-y-2.5 text-sm flex-1">
                    {includes.map((line, i) => (
                      <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-[#0b2545] shrink-0 mt-0.5" /><span className="text-slate-700">{line}</span></li>
                    ))}
                  </ul>
                  {excludes.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.label_excludes}</div>
                      <ul className="space-y-1 text-xs text-slate-500">
                        {excludes.map((line, i) => (
                          <li key={i} className="flex gap-2"><X className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" /><span>{line}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <a href={`${waLink}${waNumber ? `?text=${encodeURIComponent(`Halo, saya tertarik dengan ${p.name}`)}` : ""}`} target="_blank" rel="noopener noreferrer"
                    className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-md font-semibold text-sm transition-all ${p.highlight ? "bg-[#16a34a] hover:bg-[#15803d] text-white shadow-md" : "bg-[#0b2545] hover:bg-[#0b2545]/90 text-white"}`}>
                    <MessageCircle className="h-4 w-4" /> {p.highlight ? t.cta_pick_package : t.nav_contact}
                  </a>
                </div>
              );
            })}
            {packages.length === 0 && (
              <div className="col-span-full text-center text-slate-500 border border-dashed rounded-xl p-10 bg-white">Belum ada paket.</div>
            )}
          </div>
          <p className="text-center text-xs text-slate-500 mt-8 max-w-2xl mx-auto">{t.services_excluded}</p>
        </div>
      </section>

      {/* KENAPA MEMILIH */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_why_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_why_title}</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {t.why.map((v) => (
              <div key={v} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="h-7 w-7 shrink-0 rounded-full bg-[#16a34a] text-white flex items-center justify-center"><Check className="h-4 w-4" /></div>
                <div className="font-medium text-slate-800 pt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section className="py-16 md:py-20 bg-slate-50 border-y">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_how_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_how_title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto relative">
            {[
              { n: "01", t: t.step_1, d: t.step_1_d },
              { n: "02", t: t.step_2, d: t.step_2_d },
              { n: "03", t: t.step_3, d: t.step_3_d },
              { n: "04", t: t.step_4, d: t.step_4_d },
            ].map((s) => (
              <div key={s.n} className="text-center relative">
                <div className="mx-auto h-14 w-14 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold text-lg shadow-md mb-4">{s.n}</div>
                <h3 className="font-bold text-[#0b2545]">{s.t}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONI */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_test_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_test_title}</h2>
          </div>
          <TestimoniCarousel items={t.testi} />
        </div>
      </section>

      {/* ARTIKEL */}
      {(latestLoading || latest.length > 0) && (
        <section id="artikel" className="py-16 md:py-20 bg-slate-50 border-y">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
              <div>
                <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_blog_kicker}</div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_blog_title}</h2>
              </div>
              <Link to="/blog" className="text-sm font-semibold text-[#16a34a] hover:underline inline-flex items-center gap-1">
                {t.sec_blog_view_all} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {latestLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <Skeleton className="aspect-[16/9] w-full" />
                    <div className="p-5 space-y-3">
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {latest.slice(0, 3).map((a) => (
                  <button key={a.id} onClick={() => setSelArticle(a)} className="group text-left block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all w-full">
                    {a.coverImageUrl ? (
                      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                        <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="aspect-[16/9] bg-gradient-to-br from-[#0b2545] to-[#1e3a5f] flex items-center justify-center text-white/40">
                        <Newspaper className="h-10 w-10" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-[#0b2545] leading-snug group-hover:text-[#16a34a] transition-colors line-clamp-2">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.excerpt}</p>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-20 bg-white border-y">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-xs font-bold tracking-widest text-[#16a34a] uppercase mb-2">{t.sec_faq_kicker}</div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0b2545]">{t.sec_faq_title}</h2>
          </div>
          <div className="space-y-3">
            {t.faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* CTA PENUTUP */}
      <section className="py-16 md:py-20 bg-[#0b2545] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">{t.cta_final_title}</h2>
          <p className="mt-5 text-slate-200 text-lg max-w-2xl mx-auto">{t.cta_final_sub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-base shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
              <MessageCircle className="h-5 w-5" /> {t.cta_final_btn}
            </a>
            <button onClick={() => setCalcOpen(true)} className="inline-flex items-center gap-2 px-6 py-4 rounded-md border-2 border-white/40 hover:bg-white/10 text-white font-semibold transition-all">
              <Calculator className="h-5 w-5" /> {t.nav_calc}
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="kontak" className="bg-slate-900 text-slate-300 pt-14 pb-6">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.jpeg" alt={company.name} className="h-10 w-10 object-contain rounded bg-white p-1" />
              <div className="font-bold text-white text-lg">{company.name}</div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{t.footer_desc}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t.footer_menu}</h4>
            <ul className="space-y-2 text-sm">
              {navItems.map((n) => (
                <li key={n.href}><a href={n.href} className="hover:text-white transition-colors">{n.label}</a></li>
              ))}
              <li><button onClick={() => setCalcOpen(true)} className="hover:text-white transition-colors text-left">{t.nav_calc}</button></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">{t.nav_blog}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t.footer_contact}</h4>
            <ul className="space-y-3 text-sm">
              {company.whatsapp && <li className="flex gap-2.5"><MessageCircle className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">{company.whatsapp}</a></li>}
              {company.email && <li className="flex gap-2.5"><Mail className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`mailto:${company.email}`} className="hover:text-white">{company.email}</a></li>}
              {company.phone && <li className="flex gap-2.5"><Phone className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`tel:${company.phone}`} className="hover:text-white">{company.phone}</a></li>}
              {company.address && <li className="flex gap-2.5"><MapPin className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><span>{company.address}</span></li>}
              {company.instagram && <li className="flex gap-2.5"><Instagram className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`https://instagram.com/${company.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">@{company.instagram}</a></li>}
              {company.tiktok && <li className="flex gap-2.5"><Music2 className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`https://tiktok.com/@${company.tiktok}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">@{company.tiktok}</a></li>}
              <li className="flex gap-2.5"><Clock className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><span>{t.footer_hours}</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Lokasi</h4>
            {company.mapsEmbedUrl ? (
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <iframe
                  src={company.mapsEmbedUrl}
                  className="w-full h-48"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Lokasi ${company.name}`}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 p-6 text-xs text-slate-500 text-center">Peta lokasi belum diatur.</div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </footer>

      {/* Floating WA */}
      {waNumber && (
        <a href={waLink} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-5 right-5 z-30 h-14 w-14 rounded-full bg-[#16a34a] hover:bg-[#15803d] text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="WhatsApp">
          <MessageCircle className="h-6 w-6" />
        </a>
      )}

      {/* Calculator Modal */}
      <CalculatorModal open={calcOpen} onOpenChange={setCalcOpen} />

      {/* ARTICLE BOTTOM SHEET */}
      <ArticleBottomSheet
        article={selArticle}
        articles={latest}
        onOpenChange={(open) => { if (!open) setSelArticle(null); }}
        onSelect={(a) => setSelArticle(a)}
      />
    </div>
  );
}

function TestimoniCarousel({ items }: { items: ReadonlyArray<{ q: string; n: string; r: string }> }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % count), 5500);
    return () => clearInterval(t);
  }, [paused, count]);

  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  return (
    <div className="relative max-w-3xl mx-auto" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="overflow-hidden rounded-2xl">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {items.map((te) => (
            <div key={te.n} className="w-full shrink-0 px-1">
              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 md:p-10 shadow-sm relative">
                <Quote className="h-10 w-10 text-[#0b2545]/10 absolute top-5 right-5" />
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />)}
                </div>
                <p className="text-slate-700 leading-relaxed text-base md:text-lg italic">"{te.q}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t">
                  <div className="h-11 w-11 rounded-full bg-[#0b2545] text-white flex items-center justify-center font-bold">{te.n[0]}</div>
                  <div>
                    <div className="font-bold text-[#0b2545]">{te.n}</div>
                    <div className="text-xs text-slate-500">{te.r}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button onClick={prev} className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow hover:bg-slate-50 flex items-center justify-center" aria-label="Sebelumnya">
            <ChevronLeft className="h-5 w-5 text-[#0b2545]" />
          </button>
          <button onClick={next} className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white border border-slate-200 shadow hover:bg-slate-50 flex items-center justify-center" aria-label="Berikutnya">
            <ChevronRight className="h-5 w-5 text-[#0b2545]" />
          </button>
          <div className="flex justify-center gap-2 mt-5">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} aria-label={`Testimoni ${i + 1}`} className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-[#0b2545]" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-[#0b2545]">{q}</span>
        <ChevronDown className={`h-5 w-5 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{a}</div>}
    </div>
  );
}
