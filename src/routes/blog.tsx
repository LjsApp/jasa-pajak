import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useArticles, useCompany, type Article } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleBottomSheet } from "@/components/ArticleBottomSheet";
import {
  X, Calendar, ArrowRight, ArrowLeft, Search,
  Phone, Mail, MapPin, Instagram, MessageCircle, Music2, Clock as ClockIcon,
  Cloud, Activity, Car, DollarSign, Coins, Plane, MoreHorizontal, Play,
  TrendingUp
} from "lucide-react";

// --- API Hooks ---
const useCuaca = (lat: number, lng: number) => useQuery({
  queryKey: ["cuaca", lat, lng],
  queryFn: async () => {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
    if (!res.ok) throw new Error("Gagal");
    return res.json();
  }
});

const useGempa = () => useQuery({
  queryKey: ["gempa"],
  queryFn: async () => {
    const res = await fetch("https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json");
    if (!res.ok) throw new Error("Gagal");
    const d = await res.json();
    return d?.Infogempa?.gempa;
  }
});

const fetchYahoo = async (ticker: string) => {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}`;
  const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error("Gagal " + ticker);
  const data = await res.json();
  const meta = data.chart.result[0].meta;
  const current = meta.regularMarketPrice;
  const prevClose = meta.previousClose;
  const changePct = ((current - prevClose) / prevClose) * 100;
  return { val: current, change: changePct, up: current >= prevClose };
};

const usePasar = () => useQuery({
  queryKey: ["pasar"],
  queryFn: async () => {
    const [ihsg, brent, xau, kurs] = await Promise.all([
      fetchYahoo("^JKSE").catch(() => null),
      fetchYahoo("BZ=F").catch(() => null),
      fetchYahoo("GC=F").catch(() => null),
      fetch("https://api.exchangerate-api.com/v4/latest/USD").then(r => r.json()).catch(() => null),
    ]);

    let emas = null;
    if (xau && kurs?.rates?.IDR) {
      const gramIdr = (xau.val * kurs.rates.IDR) / 31.1034768;
      emas = { val: gramIdr, change: xau.change, up: xau.up };
    }

    return { ihsg, brent, emas, kurs: kurs?.rates?.IDR };
  },
  refetchInterval: 60000
});

const useKurs = () => useQuery({
  queryKey: ["kursFull"],
  queryFn: async () => {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    if (!res.ok) throw new Error("Gagal");
    return res.json();
  }
});

const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const useKesehatan = () => useQuery({
  queryKey: ["kesehatan"],
  queryFn: async () => {
    const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.cnbcindonesia.com/lifestyle/rss");
    if (!res.ok) throw new Error("Gagal");
    const data = await res.json();
    return shuffleArray(data.items).map((item: any, i: number) => ({
      id: `kes-${i}`,
      title: item.title,
      slug: item.link,
      coverImageUrl: item.enclosure?.link || item.thumbnail || null,
      publishedAt: item.pubDate,
      author: item.author || "Redaksi"
    }));
  },
  refetchInterval: 30000 // Refresh & Shuffle setiap 30 detik
});

const useQuotes = () => useQuery({
  queryKey: ["quotes"],
  queryFn: async () => {
    const targetUrl = "https://quotes.liupurnomo.com/api/quotes?category=motivasi&limit=30";
    const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
    if (!res.ok) throw new Error("Gagal");
    const data = await res.json();
    return shuffleArray(data.data); // Acak 30 quotes yang didapat
  },
  refetchInterval: 30000 // Refresh & Shuffle setiap 30 detik
});

// --- Modal Informasi Cepat ---
function InfoModal({ widget, onClose }: { widget: string | null, onClose: () => void }) {
  if (!widget) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X className="h-4 w-4 text-slate-600" /></button>
        <div className="p-6">
          <h2 className="text-xl font-black text-[#0b2545] mb-4 border-b-2 border-slate-100 pb-3">{widget}</h2>
          {widget === "Cuaca" && <CuacaInfo />}
          {widget === "Gempa" && <GempaInfo />}
          {widget === "Kurs" && <KursInfo />}
          {widget === "Harga Emas" && <EmasInfo />}
        </div>
      </div>
    </div>
  )
}

const PROVINCES = [
  { name: "DKI Jakarta (Jakarta)", lat: -6.2088, lng: 106.8456 },
  { name: "Jawa Barat (Bandung)", lat: -6.9175, lng: 107.6191 },
  { name: "Jawa Tengah (Semarang)", lat: -6.9667, lng: 110.4167 },
  { name: "Jawa Timur (Surabaya)", lat: -7.2504, lng: 112.7688 },
  { name: "Banten (Serang)", lat: -6.1200, lng: 106.1503 },
  { name: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
  { name: "Bali (Denpasar)", lat: -8.6705, lng: 115.2128 },
  { name: "Sumatera Utara (Medan)", lat: 3.5833, lng: 98.6667 },
  { name: "Sumatera Selatan (Palembang)", lat: -2.9833, lng: 104.7500 },
  { name: "Sulawesi Selatan (Makassar)", lat: -5.1333, lng: 119.4167 },
  { name: "Sulawesi Utara (Manado)", lat: 1.4833, lng: 124.8333 },
  { name: "Kalimantan Timur (Balikpapan)", lat: -1.2653, lng: 116.8312 },
  { name: "Papua (Jayapura)", lat: -2.5333, lng: 140.7167 },
];

function CuacaInfo() {
  const [selected, setSelected] = useState(PROVINCES[0]);
  const { data, isLoading, isError } = useCuaca(selected.lat, selected.lng);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pilih Provinsi / Kota</label>
        <select
          className="w-full bg-slate-50 border border-slate-200 text-[#0b2545] font-medium rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] transition-all cursor-pointer"
          value={selected.name}
          onChange={(e) => {
            const p = PROVINCES.find(x => x.name === e.target.value);
            if (p) setSelected(p);
          }}
        >
          {PROVINCES.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="text-slate-500 animate-pulse text-sm py-4">Memuat data cuaca...</div>
      ) : isError || !data?.current_weather ? (
        <div className="text-red-500 text-sm py-4">Gagal memuat data cuaca.</div>
      ) : (
        <div className="flex items-center gap-5 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in zoom-in-95 duration-300">
          <Cloud className="h-14 w-14 text-blue-500 drop-shadow-sm" />
          <div>
            <div className="text-4xl font-black text-[#0b2545]">{data.current_weather.temperature}°C</div>
            <div className="text-xs font-semibold text-slate-600 mt-1 uppercase tracking-wide">Kec. Angin: {data.current_weather.windspeed} km/h</div>
          </div>
        </div>
      )}
    </div>
  );
}

function GempaInfo() {
  const { data, isLoading, isError } = useGempa();
  if (isLoading) return <div className="text-slate-500 animate-pulse text-sm py-4">Memuat data gempa BMKG...</div>;
  if (isError || !data) return <div className="text-red-500 text-sm py-4">Gagal memuat data gempa.</div>;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
        <Activity className="h-10 w-10 text-red-500 shrink-0" />
        <div>
          <div className="font-black text-red-600 text-xl">M {data.Magnitude}</div>
          <div className="text-slate-600 font-semibold text-xs">{data.Tanggal}, {data.Jam}</div>
        </div>
      </div>
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="font-semibold text-slate-500">Kedalaman</div><div className="col-span-2 font-bold text-[#0b2545]">{data.Kedalaman}</div>
          <div className="font-semibold text-slate-500">Lokasi</div><div className="col-span-2 font-bold text-[#0b2545]">{data.Lintang}, {data.Bujur}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border font-medium text-slate-700 leading-snug">{data.Wilayah}</div>
        <div className={`mt-2 font-bold text-[11px] px-2.5 py-1.5 rounded inline-block uppercase tracking-wider ${data.Potensi.toLowerCase().includes('tsunami') ? 'bg-red-600 text-white' : 'bg-green-100 text-green-700'}`}>{data.Potensi}</div>
      </div>
    </div>
  );
}

function KursInfo() {
  const { data, isLoading, isError } = useKurs();
  if (isLoading) return <div className="text-slate-500 animate-pulse text-sm py-4">Memuat kurs mata uang...</div>;
  if (isError || !data) return <div className="text-red-500 text-sm py-4">Gagal memuat kurs.</div>;
  const idr = data.rates.IDR;
  const eurIdr = idr / data.rates.EUR;
  const sgdIdr = idr / data.rates.SGD;
  const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v);
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100 mb-3">
        <div className="font-black text-green-700 text-xl">1 USD</div>
        <div className="font-black text-[#0b2545] text-2xl">{fmt(idr)}</div>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
        <div className="font-semibold text-slate-600">1 EUR (Euro)</div>
        <div className="font-bold text-[#0b2545] text-lg">{fmt(eurIdr)}</div>
      </div>
      <div className="flex justify-between items-center py-2.5 border-b border-slate-100">
        <div className="font-semibold text-slate-600">1 SGD (Singapore)</div>
        <div className="font-bold text-[#0b2545] text-lg">{fmt(sgdIdr)}</div>
      </div>
      <div className="text-[10px] text-slate-400 mt-2 text-right">Update: {new Date(data.time_last_update_unix * 1000).toLocaleString('id-ID')}</div>
    </div>
  );
}

function EmasInfo() {
  const { data, isLoading, isError } = usePasar();
  if (isLoading) return <div className="text-slate-500 animate-pulse text-sm py-4">Memuat harga emas global...</div>;
  if (isError || !data?.emas) return <div className="text-red-500 text-sm py-4">Gagal memuat harga emas.</div>;
  const fmt = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v);
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 text-center">
        <Coins className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
        <div className="text-xs font-semibold text-yellow-800 mb-1 uppercase tracking-wider">Harga Spot (Estimasi per Gram)</div>
        <div className="text-3xl font-black text-[#0b2545]">{fmt(data.emas.val)}</div>
        <div className={`text-sm font-bold mt-2 ${data.emas.up ? "text-green-600" : "text-red-600"}`}>
          {data.emas.change > 0 ? "+" : ""}{data.emas.change.toFixed(2)}%
        </div>
      </div>
      <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
        *Harga di atas adalah estimasi konversi murni dari harga Spot Emas Dunia (XAU/USD) ke Rupiah. Harga ritel fisik (seperti Antam) biasanya memiliki selisih/premium tambahan.
      </div>
    </div>
  );
}

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Artikel & Insight Pajak — LJS" },
      { name: "description", content: "Tips, panduan, dan update peraturan perpajakan terbaru dari konsultan pajak LJS. Bacaan wajib untuk pelaku bisnis dan UMKM." },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://layanan-jasa-solusi.vercel.app/blog" },
      { property: "og:title", content: "Artikel & Insight Pajak — LJS" },
      { property: "og:description", content: "Tips, panduan, dan update peraturan perpajakan terbaru dari konsultan pajak LJS." },
      { property: "og:image", content: "https://layanan-jasa-solusi.vercel.app/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Artikel & Insight Pajak — LJS" },
      { name: "twitter:image", content: "https://layanan-jasa-solusi.vercel.app/og-image.png" },
    ],
  }),
  component: BlogList,
});

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
const firstTag = (tags: string) => tags.split(",").map((s) => s.trim()).filter(Boolean)[0] ?? "Berita";

function ImgBox({ url, title, className }: { url: string | null; title: string; className?: string }) {
  return url ? (
    <img src={url} alt={title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${className ?? ""}`} />
  ) : (
    <div className={`w-full h-full bg-slate-200 flex items-center justify-center ${className ?? ""}`}>
      <span className="text-slate-400 text-xs font-medium tracking-widest uppercase">LJS</span>
    </div>
  );
}

function SectionTitle({ title, link = true, onLinkClick }: { title: string, link?: boolean, onLinkClick?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-2">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 bg-[#dc2626]" />
        <h2 className="font-bold text-[#0b2545] text-lg lg:text-xl tracking-tight">{title}</h2>
      </div>
      {link && (
        <button onClick={onLinkClick} className="text-xs font-semibold text-[#16a34a] hover:underline flex items-center gap-1">
          Lihat Semua <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function BlogList() {
  const { t } = useT();
  const { data: articles = [], isLoading } = useArticles({ onlyPublished: true });
  const { data: c } = useCompany();
  const co = c ?? { name: "LJS", tagline: "", phone: "", email: "", address: "", instagram: "", whatsapp: "", tiktok: "", visi: "", misi: "", logoDataUrl: null, mapsEmbedUrl: "" };
  const waNum = co.whatsapp.replace(/[^\d]/g, "");
  const waLink = waNum ? `https://wa.me/${waNum}` : "#";

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sel, setSel] = useState<Article | null>(null);
  const [indexView, setIndexView] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");



  const allTags = useMemo(() => {
    const s = new Set<string>();
    articles.forEach((a) => a.tags.split(",").map((x) => x.trim()).filter(Boolean).forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const tags = a.tags.split(",").map((s) => s.trim()).filter(Boolean);
      if (activeTag && !tags.includes(activeTag)) return false;
      return true;
    });
  }, [articles, activeTag]);

  const searchedArticles = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return articles.filter(a => a.title.toLowerCase().includes(q) || a.tags.toLowerCase().includes(q) || a.excerpt?.toLowerCase().includes(q));
  }, [articles, searchQuery]);

  // Data mapping based on layout
  const breakingNews = articles[0];
  const heroMain = articles[0] ?? null; // 1 item (index 0)
  const subHero = articles.slice(1, 4); // 3 items (index 1-3)
  const sorotan = articles.slice(4, 7); // 3 items (index 4-6)
  // Berita Terbaru is either filtered or from index 7 to 17
  const beritaTerbaru = activeTag ? filtered : articles.slice(7, 17); // 10 items (index 7-16)
  const terpopuler = articles.slice(17, 22); // 5 items (index 17-21)
  const vik = articles.slice(22, 26); // 4 items (index 22-25)

  // Real Data for Sidebar Widgets
  const infoCepat = [
    { label: "Cuaca", icon: Cloud, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Gempa", icon: Activity, color: "text-red-500", bg: "bg-red-50" },
    { label: "Kurs", icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Harga Emas", icon: Coins, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  const { data: pasar, isLoading: pasarLoading } = usePasar();
  const { data: kesehatan, isLoading: kesehatanLoading } = useKesehatan();
  const { data: quotesData, isLoading: quotesLoading } = useQuotes();

  const navItems = [
    { href: "/", label: t.nav_home },
    { href: "/#tentang", label: t.nav_about },
    { href: "/#layanan", label: t.nav_services },
    { href: "/#paket", label: t.nav_packages },
    { href: "/blog", label: t.nav_blog },
    { href: "/#faq", label: t.nav_faq },
    { href: "/#kontak", label: t.nav_contact },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] font-sans">
      <SiteNavbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-4 md:py-6">

        {/* TOP BAR: SEARCH & BREAKING NEWS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex items-center bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm flex-1">
            <div className="bg-[#dc2626] text-white text-[11px] md:text-xs font-black uppercase px-3 py-2 flex items-center gap-2 shrink-0">
              BREAKING NEWS <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
            <button onClick={() => breakingNews && setSel(breakingNews)} className="px-3 text-xs md:text-sm text-[#0b2545] font-semibold truncate hover:text-[#16a34a] transition-colors flex-1 text-left">
              {breakingNews?.title ?? "Memuat berita terbaru..."}
            </button>
            <div className="px-3 text-slate-400 text-[10px] md:text-xs hidden sm:block shrink-0 border-l">
              5 menit lalu
            </div>
            <button onClick={() => setIndexView("Berita Terbaru")} className="px-3 text-xs font-semibold text-[#16a34a] hidden md:flex items-center gap-1 hover:underline">
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="w-full lg:w-72 shrink-0 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari artikel atau berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-[#16a34a] transition-colors shadow-sm"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Left skeleton */}
            <div className="space-y-8 min-w-0">
              {/* Hero skeleton */}
              <section>
                <Skeleton className="w-full aspect-[16/9] md:aspect-[2/1] rounded-lg mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="w-full aspect-[16/9] rounded-md" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  ))}
                </div>
              </section>
              {/* Sorotan skeleton */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="w-1.5 h-5 bg-slate-200 rounded" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="w-full aspect-[16/9] rounded-md" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </section>
              {/* Berita Terbaru skeleton */}
              <section>
                <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="w-1.5 h-5 bg-slate-200 rounded" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="flex gap-4 mb-4 border-b border-slate-200 pb-1">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-14" />
                  ))}
                </div>
                <div className="divide-y divide-slate-100">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4 py-4">
                      <Skeleton className="w-32 md:w-48 aspect-[16/9] shrink-0 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                        <Skeleton className="h-3 w-32 hidden md:block" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            {/* Right sidebar skeleton */}
            <aside className="space-y-8">
              {/* Terpopuler */}
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="w-1.5 h-5 bg-slate-200 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <div className="space-y-4 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Info Cepat */}
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="w-1.5 h-5 bg-slate-200 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="grid grid-cols-4 gap-y-6 gap-x-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-3 w-10" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Pasar Hari Ini */}
              <div className="bg-[#0f172a] rounded-xl border border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                  <Skeleton className="h-3 w-14 bg-slate-700" />
                </div>
                <div className="space-y-0">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-slate-800 last:border-0">
                      <Skeleton className="h-3 w-20 bg-slate-700" />
                      <Skeleton className="h-3 w-24 bg-slate-700" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Kesehatan */}
              <div className="bg-white rounded-xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="w-1.5 h-5 bg-slate-200 rounded" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="mt-4 space-y-3">
                  <Skeleton className="w-full aspect-[16/9] rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-24 aspect-[16/9] rounded shrink-0" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center text-slate-500">{t.blog_empty}</div>
        ) : searchQuery.trim() ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-200 pb-4">
              <div className="w-1.5 h-6 bg-[#16a34a]" />
              <h1 className="text-xl md:text-2xl font-black text-[#0b2545]">Hasil Pencarian: "{searchQuery}"</h1>
            </div>
            {searchedArticles.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm border border-dashed rounded-lg">Tidak ada artikel yang cocok dengan pencarian Anda.</div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchedArticles.map((a) => (
                  <button key={a.id} onClick={() => setSel(a)} className="group text-left flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all border border-slate-100">
                    <div className="relative w-full aspect-[16/9] shrink-0 bg-slate-200 overflow-hidden">
                      <ImgBox url={a.coverImageUrl} title={a.title} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[#0b2545] text-sm leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-auto pt-4">
                        <span className="font-semibold text-slate-600 capitalize">{firstTag(a.tags)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{fmtDate(a.publishedAt)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : indexView ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10">
            <button onClick={() => setIndexView(null)} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#16a34a] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Beranda Artikel
            </button>
            <div className="flex items-center gap-3 mb-8 border-b-2 border-slate-200 pb-4">
              <div className="w-1.5 h-6 bg-[#dc2626]" />
              <h1 className="text-2xl md:text-3xl font-black text-[#0b2545] capitalize">Indeks: {indexView}</h1>
            </div>

            {indexView === "Kesehatan" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kesehatan?.map((v: any, i: number) => (
                  <a key={i} href={v.slug} target="_blank" rel="noopener noreferrer" className="group cursor-pointer block border border-slate-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative w-full aspect-[16/9] bg-slate-200">
                      <img src={v.coverImageUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-[#0b2545] text-sm leading-snug group-hover:text-[#16a34a] transition-colors">{v.title}</h3>
                      <div className="text-[10px] text-slate-400 mt-2">{new Date(v.publishedAt).toLocaleDateString('id-ID')}</div>
                    </div>
                  </a>
                ))}
              </div>
            ) : indexView === "Quotes" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quotesData?.map((q: any, i: number) => (
                  <div key={i} className="group bg-slate-50 p-6 rounded-xl border border-slate-100 relative shadow-sm">
                    <div className="text-5xl text-slate-200 absolute top-2 left-4 font-serif font-black">"</div>
                    <p className="text-sm text-slate-600 font-medium italic relative z-10 pt-4 pb-2 leading-relaxed">
                      {q.text}
                    </p>
                    <div className="text-xs font-bold text-[#16a34a] text-right mt-2">— {q.author}</div>
                  </div>
                ))}
              </div>
            ) : indexView === "Pasar Hari Ini" ? (
              <div className="max-w-md bg-[#0f172a] rounded-xl shadow-sm border border-slate-800 p-6 text-white mx-auto">
                <div className="space-y-0">
                  {[
                    { label: "IHSG", val: pasar?.ihsg?.val, change: pasar?.ihsg?.change, up: pasar?.ihsg?.up, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(v) },
                    { label: "USD/IDR", val: pasar?.kurs, change: 0, up: true, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(v) },
                    { label: "Emas Spot/gr", val: pasar?.emas?.val, change: pasar?.emas?.change, up: pasar?.emas?.up, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(Math.round(v)) },
                    { label: "Minyak Brent", val: pasar?.brent?.val, change: pasar?.brent?.change, up: pasar?.brent?.up, fmt: (v: number) => v.toFixed(2) }
                  ].map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-slate-800 last:border-0">
                      <span className="text-sm font-semibold text-slate-300">{p.label}</span>
                      <div className="flex items-center gap-6 text-sm font-mono">
                        <span>{p.val ? p.fmt(p.val) : "-"}</span>
                        {p.change !== 0 && p.change != null && (
                          <span className={`w-16 text-right font-bold ${p.up ? "text-green-400" : "text-red-400"}`}>
                            {p.change > 0 ? "+" : ""}{p.change.toFixed(2)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {articles.map((a) => (
                  <button key={a.id} onClick={() => setSel(a)} className="group text-left flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all border border-slate-100">
                    <div className="relative w-full aspect-[16/9] shrink-0 bg-slate-200 overflow-hidden">
                      <ImgBox url={a.coverImageUrl} title={a.title} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[#0b2545] text-sm leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-auto pt-4">
                        <span className="font-semibold text-slate-600 capitalize">{firstTag(a.tags)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{fmtDate(a.publishedAt)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">

            {/* LEFT COLUMN: MAIN CONTENT */}
            <div className="space-y-8 min-w-0">

              {/* HERO & SUB-HERO */}
              <section>
                {heroMain && (
                  <button onClick={() => setSel(heroMain)} className="group relative w-full rounded-lg overflow-hidden text-left shadow-sm hover:shadow-md transition-shadow mb-4">
                    <div className="aspect-[16/9] md:aspect-[2/1] relative bg-slate-200 overflow-hidden">
                      <ImgBox url={heroMain.coverImageUrl} title={heroMain.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                        <span className="inline-block bg-[#0284c7] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm mb-3">HEADLINE</span>
                        <h1 className="text-white font-bold text-2xl md:text-3xl lg:text-4xl leading-tight line-clamp-3 group-hover:underline decoration-white/50">{heroMain.title}</h1>
                        {heroMain.excerpt && <p className="text-white/80 text-sm mt-3 line-clamp-2 hidden md:block">{heroMain.excerpt}</p>}
                        <div className="flex items-center gap-2 text-white/60 text-xs mt-4">
                          <span className="font-semibold text-white/90">{firstTag(heroMain.tags)}</span>
                          <span className="w-1 h-1 rounded-full bg-white/40" />
                          <span>{fmtDate(heroMain.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {subHero.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {subHero.map((a) => (
                      <button key={a.id} onClick={() => setSel(a)} className="group text-left flex flex-col">
                        <div className="relative w-full aspect-[16/9] bg-slate-200 overflow-hidden rounded-md mb-2">
                          <ImgBox url={a.coverImageUrl} title={a.title} />
                        </div>
                        <h3 className="font-bold text-[#0b2545] text-[13px] md:text-sm leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5">
                          <span className="font-semibold text-slate-600 capitalize">{firstTag(a.tags)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{fmtDate(a.publishedAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* SOROTAN */}
              {sorotan.length > 0 && (
                <section>
                  <SectionTitle title="Sorotan" link={false} onLinkClick={() => setIndexView("Sorotan")} />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {sorotan.map((a) => (
                      <button key={a.id} onClick={() => setSel(a)} className="group text-left flex flex-col">
                        <div className="relative w-full aspect-[16/9] bg-slate-200 overflow-hidden rounded-md mb-2">
                          <ImgBox url={a.coverImageUrl} title={a.title} />
                        </div>
                        <h3 className="font-bold text-[#0b2545] text-[13px] md:text-sm leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5">
                          <span className="font-semibold text-slate-600 capitalize">{firstTag(a.tags)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* BERITA TERBARU (LIST HORIZONTAL) */}
              <section>
                <SectionTitle title="Berita Terbaru" onLinkClick={() => setIndexView("Berita Terbaru")} />

                {/* TABS */}
                <div className="flex overflow-x-auto scrollbar-hide gap-0 border-b border-slate-200 mb-4">
                  {[{ label: "Terbaru", val: null }, ...allTags.map((t) => ({ label: t, val: t }))].map(({ label, val }) => (
                    <button
                      key={label} onClick={() => setActiveTag(val)}
                      className={`px-4 py-2 text-xs md:text-sm font-bold whitespace-nowrap border-b-2 transition-colors capitalize ${activeTag === val ? "border-[#dc2626] text-[#dc2626]" : "border-transparent text-slate-500 hover:text-[#0b2545]"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {beritaTerbaru.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm border border-dashed rounded-lg">Tidak ada berita di kategori ini.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {beritaTerbaru.map((a) => (
                      <button key={a.id} onClick={() => setSel(a)} className="group w-full text-left flex gap-4 py-4 hover:bg-slate-50 transition-colors">
                        <div className="w-32 md:w-48 aspect-[16/9] shrink-0 rounded-md overflow-hidden bg-slate-200">
                          <ImgBox url={a.coverImageUrl} title={a.title} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#0b2545] text-sm md:text-lg leading-snug line-clamp-2 md:line-clamp-3 group-hover:text-[#16a34a] transition-colors mb-1.5">{a.title}</h3>
                          {a.excerpt && <p className="text-xs text-slate-500 line-clamp-2 hidden md:block mb-2">{a.excerpt}</p>}
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-400">
                            <span className="font-semibold text-slate-600 capitalize">{firstTag(a.tags)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{fmtDate(a.publishedAt)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* VIK (VISUAL INTERAKTIF) */}
              {vik.length > 0 && (
                <section>
                  <SectionTitle title="VIK (Visual Interaktif Pajak)" link={false} onLinkClick={() => setIndexView("VIK")} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vik.map((a) => (
                      <button key={a.id} onClick={() => setSel(a)} className="group text-left flex flex-col">
                        <div className="relative w-full aspect-[16/9] bg-slate-200 overflow-hidden rounded-md mb-2">
                          <ImgBox url={a.coverImageUrl} title={a.title} />
                        </div>
                        <h3 className="font-bold text-[#0b2545] text-[12px] md:text-[13px] leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-slate-400 mt-1">
                          <span>{fmtDate(a.publishedAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
            <aside className="space-y-8 block">

              {/* TERPOPULER */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <SectionTitle title="Terpopuler" link={false} onLinkClick={() => setIndexView("Terpopuler")} />
                <div className="space-y-4 mt-4">
                  {terpopuler.map((a, i) => (
                    <button key={a.id} onClick={() => setSel(a)} className="group w-full text-left flex items-start gap-3">
                      <div className="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center group-hover:bg-[#16a34a] group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#0b2545] text-sm leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">{a.title}</h3>
                        <span className="text-[10px] text-slate-400 mt-1 block capitalize">{firstTag(a.tags)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* INFORMASI CEPAT */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <SectionTitle title="Informasi Cepat" link={false} />
                <div className="grid grid-cols-4 gap-y-6 gap-x-2 mt-4">
                  {infoCepat.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button key={i} onClick={() => setActiveWidget(item.label)} className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-5 w-5 ${item.color}`} />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASAR HARI INI */}
              <div className="bg-[#0f172a] rounded-xl shadow-sm border border-slate-800 p-5 text-white">
                <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 bg-[#dc2626]" />
                    <h2 className="font-bold text-white text-base">Pasar Hari Ini</h2>
                  </div>
                  <button onClick={() => setIndexView("Pasar Hari Ini")} className="text-[10px] font-semibold text-slate-400 hover:text-white transition-colors">Lihat Semua</button>
                </div>
                {pasarLoading ? (
                  <div className="py-8 text-center text-slate-400 text-xs animate-pulse">Memuat data pasar real-time...</div>
                ) : (
                  <div className="space-y-0">
                    {[
                      { label: "IHSG", val: pasar?.ihsg?.val, change: pasar?.ihsg?.change, up: pasar?.ihsg?.up, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(v) },
                      { label: "USD/IDR", val: pasar?.kurs, change: 0, up: true, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(v) },
                      { label: "Emas Spot/gr", val: pasar?.emas?.val, change: pasar?.emas?.change, up: pasar?.emas?.up, fmt: (v: number) => new Intl.NumberFormat('id-ID').format(Math.round(v)) },
                      { label: "Minyak Brent", val: pasar?.brent?.val, change: pasar?.brent?.change, up: pasar?.brent?.up, fmt: (v: number) => v.toFixed(2) }
                    ].map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
                        <span className="text-xs font-semibold text-slate-300">{p.label}</span>
                        <div className="flex items-center gap-4 text-xs font-mono">
                          <span>{p.val ? p.fmt(p.val) : "-"}</span>
                          {p.change !== 0 && p.change != null && (
                            <span className={`w-12 text-right font-bold ${p.up ? "text-green-400" : "text-red-400"}`}>
                              {p.change > 0 ? "+" : ""}{p.change.toFixed(2)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-[9px] text-slate-500 mt-3">*Data pasar real-time via public APIs</div>
              </div>

              {/* KESEHATAN & GAYA HIDUP */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <SectionTitle title="Kesehatan & Lifestyle" link={false} />
                {kesehatanLoading ? (
                  <div className="py-8 text-center text-slate-400 text-xs animate-pulse">Memuat artikel kesehatan...</div>
                ) : (kesehatan && kesehatan.length > 0) ? (
                  <div className="mt-4">
                    <a href={kesehatan[0]?.slug} target="_blank" rel="noopener noreferrer" className="group relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 cursor-pointer mb-3 block">
                      <img src={kesehatan[0]?.coverImageUrl} alt={kesehatan[0]?.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    </a>
                    <a href={kesehatan[0]?.slug} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0b2545] text-sm leading-snug hover:text-[#16a34a] cursor-pointer mb-4 block">{kesehatan[0]?.title}</a>

                    <div className="space-y-3">
                      {kesehatan.slice(1, 4).map((v: any, i: number) => (
                        <a key={i} href={v.slug} target="_blank" rel="noopener noreferrer" className="group flex gap-3 cursor-pointer">
                          <div className="relative w-24 shrink-0 aspect-[16/9] rounded overflow-hidden bg-slate-200">
                            <img src={v.coverImageUrl} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <h4 className="font-bold text-[#0b2545] text-xs leading-snug group-hover:text-[#16a34a] transition-colors line-clamp-3">{v.title}</h4>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">Gagal memuat artikel kesehatan.</div>
                )}
              </div>

              {/* QUOTES & MOTIVASI */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-4 border-b-2 border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-[#dc2626]" />
                    <h2 className="font-bold text-[#0b2545] text-lg lg:text-xl tracking-tight">Motivasi</h2>
                  </div>
                </div>

                {quotesLoading ? (
                  <div className="py-8 text-center text-slate-400 text-xs animate-pulse">Memuat quotes...</div>
                ) : (quotesData && quotesData.length > 0) ? (
                  <div className="space-y-4 mt-4">
                    {quotesData.slice(0, 3).map((q: any, i: number) => (
                      <div key={i} className="group bg-slate-50 p-4 rounded-lg border border-slate-100 relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl text-slate-200 absolute top-0 left-2 font-serif font-black">"</div>
                        <p className="text-sm text-slate-600 font-medium italic relative z-10 pt-3 pb-1 leading-relaxed">
                          {q.text}
                        </p>
                        <div className="text-[11px] font-bold text-[#16a34a] text-right mt-1">— {q.author}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">Gagal memuat quotes.</div>
                )}
              </div>

            </aside>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-14 pb-6 mt-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.jpeg" alt={co.name} className="h-10 w-10 object-contain rounded bg-white p-1" />
              <div className="font-bold text-white text-lg">{co.name}</div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{t.footer_desc}</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t.footer_menu}</h4>
            <ul className="space-y-2 text-sm">
              {navItems.map((n) => <li key={n.href}><a href={n.href} className="hover:text-white transition-colors">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">{t.footer_contact}</h4>
            <ul className="space-y-3 text-sm">
              {co.whatsapp && <li className="flex gap-2.5"><MessageCircle className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={waLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">{co.whatsapp}</a></li>}
              {co.email && <li className="flex gap-2.5"><Mail className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`mailto:${co.email}`} className="hover:text-white">{co.email}</a></li>}
              {co.phone && <li className="flex gap-2.5"><Phone className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`tel:${co.phone}`} className="hover:text-white">{co.phone}</a></li>}
              {co.address && <li className="flex gap-2.5"><MapPin className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><span>{co.address}</span></li>}
              {co.instagram && <li className="flex gap-2.5"><Instagram className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`https://instagram.com/${co.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">@{co.instagram}</a></li>}
              {co.tiktok && <li className="flex gap-2.5"><Music2 className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><a href={`https://tiktok.com/@${co.tiktok}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">@{co.tiktok}</a></li>}
              <li className="flex gap-2.5"><ClockIcon className="h-4 w-4 text-[#16a34a] shrink-0 mt-0.5" /><span>{t.footer_hours}</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Lokasi</h4>
            {co.mapsEmbedUrl ? (
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <iframe src={co.mapsEmbedUrl} className="w-full h-48" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Lokasi ${co.name}`} allowFullScreen />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 p-6 text-xs text-slate-500 text-center">Peta belum diatur.</div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {co.name}. All rights reserved.
        </div>
      </footer>

      {/* ARTICLE BOTTOM SHEET (draggable) */}
      <ArticleBottomSheet
        article={sel}
        articles={articles}
        onOpenChange={(open) => { if (!open) setSel(null); }}
        onSelect={(a) => setSel(a)}
      />
      <InfoModal widget={activeWidget} onClose={() => setActiveWidget(null)} />
    </div>
  );
}
