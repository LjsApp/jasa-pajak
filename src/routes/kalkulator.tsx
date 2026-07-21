import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCompany } from "@/lib/store";
import { MoneyInput } from "@/components/MoneyInput";
import { formatRupiah } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { ArrowLeft, Calculator, Briefcase, Building2 } from "lucide-react";

export const Route = createFileRoute("/kalkulator")({
  head: () => ({
    meta: [
      { title: "Kalkulator Pajak — PPh 21 & PPh UMKM | LJS" },
      { name: "description", content: "Kalkulator pajak online: hitung PPh 21 karyawan dan PPh Final UMKM 0,5% sesuai PP 55/2022." },
      { property: "og:title", content: "Kalkulator Pajak — LJS" },
      { property: "og:description", content: "Estimasi cepat PPh 21 & PPh Final UMKM." },
    ],
  }),
  component: Kalkulator,
});

const PTKP_MAP: Record<string, number> = {
  TK0: 54_000_000, TK1: 58_500_000, TK2: 63_000_000, TK3: 67_500_000,
  K0: 58_500_000,  K1: 63_000_000,  K2: 67_500_000,  K3: 72_000_000,
};

function calcPph21Annual(pkp: number) {
  if (pkp <= 0) return 0;
  const brackets = [
    { up: 60_000_000, rate: 0.05 },
    { up: 250_000_000, rate: 0.15 },
    { up: 500_000_000, rate: 0.25 },
    { up: 5_000_000_000, rate: 0.30 },
    { up: Infinity, rate: 0.35 },
  ];
  let remaining = pkp, prev = 0, tax = 0;
  for (const b of brackets) {
    const slice = Math.max(0, Math.min(remaining, b.up - prev));
    tax += slice * b.rate;
    remaining -= slice;
    prev = b.up;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

function Kalkulator() {
  const { t } = useT();
  const { data: c } = useCompany();
  const [tab, setTab] = useState<"pph21" | "umkm">("pph21");

  // PPh 21
  const [salary, setSalary] = useState(10_000_000);
  const [status, setStatus] = useState<"TK" | "K">("TK");
  const [tang, setTang] = useState(0);
  const ptkpKey = `${status}${tang}` as keyof typeof PTKP_MAP;
  const yearly = salary * 12;
  const ptkp = PTKP_MAP[ptkpKey] ?? 54_000_000;
  const pkp = Math.max(0, yearly - ptkp);
  const pphYear = calcPph21Annual(pkp);
  const pphMonth = Math.round(pphYear / 12);
  const takeHome = salary - pphMonth;

  // UMKM
  const [omzet, setOmzet] = useState(50_000_000);
  const omzetYear = omzet * 12;
  const pphUmkm = Math.round(omzet * 0.005);
  const pphUmkmYear = Math.round(omzetYear * 0.005);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b2545] hover:underline">
            <ArrowLeft className="h-4 w-4" /> {c?.name || "LJS"}
          </Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-[#0b2545] text-white flex items-center justify-center">
            <Calculator className="h-5 w-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0b2545]">{t.calc_title}</h1>
        </div>
        <p className="text-slate-600 mb-6">{t.calc_sub}</p>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 border-b">
            <button onClick={() => setTab("pph21")} className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === "pph21" ? "bg-[#0b2545] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              <Briefcase className="h-4 w-4" /> {t.calc_tab_pph21}
            </button>
            <button onClick={() => setTab("umkm")} className={`flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${tab === "umkm" ? "bg-[#0b2545] text-white" : "text-slate-600 hover:bg-slate-50"}`}>
              <Building2 className="h-4 w-4" /> {t.calc_tab_umkm}
            </button>
          </div>

          <div className="p-5 md:p-6">
            {tab === "pph21" ? (
              <div className="space-y-4">
                <Field label={t.calc_monthly_salary}>
                  <MoneyInput value={salary} onChange={setSalary} className="w-full" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t.calc_status}>
                    <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="TK">TK (Tidak Kawin)</option>
                      <option value="K">K (Kawin)</option>
                    </select>
                  </Field>
                  <Field label={t.calc_dependents}>
                    <select value={tang} onChange={(e) => setTang(Number(e.target.value))} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                      {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="mt-4 rounded-lg bg-slate-50 border p-4 space-y-2 text-sm">
                  <Row label={t.calc_yearly_income} value={formatRupiah(yearly, { withSymbol: true })} />
                  <Row label={`${t.calc_ptkp} (${ptkpKey})`} value={formatRupiah(ptkp, { withSymbol: true })} />
                  <Row label={t.calc_pkp} value={formatRupiah(pkp, { withSymbol: true })} />
                  <div className="border-t pt-2 mt-2" />
                  <Row label={t.calc_pph_year} value={formatRupiah(pphYear, { withSymbol: true })} bold />
                  <Row label={t.calc_pph_month} value={formatRupiah(pphMonth, { withSymbol: true })} bold />
                  <Row label={t.calc_takehome} value={formatRupiah(takeHome, { withSymbol: true })} highlight />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label={t.calc_omzet}>
                  <MoneyInput value={omzet} onChange={setOmzet} className="w-full" />
                </Field>
                <div className="mt-4 rounded-lg bg-slate-50 border p-4 space-y-2 text-sm">
                  <Row label={t.calc_omzet_year} value={formatRupiah(omzetYear, { withSymbol: true })} />
                  <div className="border-t pt-2 mt-2" />
                  <Row label={t.calc_pph_umkm} value={formatRupiah(pphUmkm, { withSymbol: true })} bold />
                  <Row label={t.calc_pph_umkm_year} value={formatRupiah(pphUmkmYear, { withSymbol: true })} highlight />
                </div>
                <p className="text-xs text-slate-500">PP 55/2022: tarif PPh Final 0,5% berlaku untuk UMKM dengan omzet ≤ Rp 4,8 miliar/tahun.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">{t.calc_disclaimer}</p>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-slate-600 mb-1.5">{label}</div>
      {children}
    </label>
  );
}
function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-600">{label}</span>
      <span className={`${bold ? "font-bold" : "font-semibold"} ${highlight ? "text-[#16a34a] text-base" : "text-[#0b2545]"}`}>{value}</span>
    </div>
  );
}
