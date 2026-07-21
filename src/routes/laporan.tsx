import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import {
  useClients,
  useLabaRugi, useLabaRugiYears, useLabaRugiMutations,
  useNeraca, useNeracaDates, useNeracaMutations,
  useCustomAccounts, useCustomAccountMutations,
  useCompany,
  type CustomSection, type CustomAccount,
} from "@/lib/store";
import { calcLabaRugi } from "@/lib/calc";
import { neracaAset, neracaPasiva } from "@/lib/templates";
import { formatRupiah } from "@/lib/format";
import { MoneyInput } from "@/components/MoneyInput";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Printer, Search, Users, ChevronLeft, CheckCircle2, AlertTriangle, ChevronLeft as ArrowL, ChevronRight as ArrowR, Trash2, Plus, Pencil, Check, X } from "lucide-react";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/laporan")({
  head: () => ({ meta: [{ title: "Laporan — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: LaporanPage,
});

function LaporanPage() {
  const { data: clients = [] } = useClients();
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [showList, setShowList] = useState(true);

  const selected = useMemo(() => clients.find((c) => c.id === id) ?? null, [clients, id]);
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.npwp.includes(q),
  );

  useEffect(() => {
    if (!selected && clients.length > 0) {
      navigate({ to: "/laporan", search: { id: clients[0].id }, replace: true });
    }
  }, [selected, clients, navigate]);

  return (
    <div className="flex h-[calc(100vh-9rem)] gap-4">
      <aside className={`${showList ? "flex" : "hidden"} md:flex flex-col w-full md:w-[20%] md:min-w-[200px] bg-card border rounded-xl overflow-hidden no-print`}>
        <div className="p-3 border-b">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-sm font-semibold"><Users className="h-4 w-4" /> Client</div>
            <span className="text-xs text-muted-foreground">{clients.length}</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari…" className="w-full pl-8 pr-2 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.map((c) => (
            <button key={c.id} onClick={() => { navigate({ to: "/laporan", search: { id: c.id } }); setShowList(false); }} className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${selected?.id === c.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
              <div className="font-medium truncate">{c.name}</div>
              <div className={`text-xs truncate ${selected?.id === c.id ? "opacity-80" : "text-muted-foreground"}`}>{c.npwp || "NPWP belum diisi"}</div>
            </button>
          ))}
          {filtered.length === 0 && (<div className="text-xs text-muted-foreground text-center p-6">Tidak ada client.</div>)}
        </div>
      </aside>

      <section className={`${showList ? "hidden" : "flex"} md:flex flex-1 min-w-0 flex-col bg-card border rounded-xl overflow-hidden print-area`}>
        {selected ? (
          <RightPanel clientId={selected.id} clientName={selected.name} onBack={() => setShowList(true)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Pilih client di sebelah kiri</div>
        )}
      </section>
    </div>
  );
}

function RightPanel({ clientId, clientName, onBack }: { clientId: string; clientName: string; onBack: () => void }) {
  const [tab, setTab] = useState<"lr" | "neraca">("lr");
  return (
    <>
      <header className="px-4 py-3 border-b flex items-center gap-3 flex-wrap no-print">
        <button onClick={onBack} className="md:hidden p-1.5 rounded hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">Client</div>
          <div className="font-semibold truncate">{clientName}</div>
        </div>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "lr" | "neraca")} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-3 no-print">
          <TabsList>
            <TabsTrigger value="lr">Laba Rugi</TabsTrigger>
            <TabsTrigger value="neraca">Neraca Keuangan</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="lr" className="mt-0"><LabaRugiTab clientId={clientId} clientName={clientName} /></TabsContent>
          <TabsContent value="neraca" className="mt-0"><NeracaTab clientId={clientId} clientName={clientName} /></TabsContent>
        </div>
      </Tabs>
    </>
  );
}

/* ---------------- Custom Item Manager ---------------- */
function CustomItemRow({ item, onChange, onSave, onDelete, value, onValueChange }: {
  item: CustomAccount;
  onChange: (label: string) => void;
  onSave: (label: string) => void;
  onDelete: () => void;
  value: number;
  onValueChange: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  useEffect(() => { setLabel(item.label); }, [item.label]);

  return (
    <tr className="border-t">
      <td className="px-3 py-1.5">
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { onSave(label); setEditing(false); } if (e.key === "Escape") { setLabel(item.label); setEditing(false); } }}
              className="flex-1 px-2 py-1 rounded border border-input bg-background text-sm"
            />
            <button onClick={() => { onSave(label); setEditing(false); }} className="p-1 rounded hover:bg-muted text-money-positive"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setLabel(item.label); setEditing(false); }} className="p-1 rounded hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 group">
            <span className="flex-1">{item.label}</span>
            <button onClick={() => setEditing(true)} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted no-print"><Pencil className="h-3 w-3" /></button>
            <button onClick={onDelete} className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive no-print"><Trash2 className="h-3 w-3" /></button>
          </div>
        )}
      </td>
      <td className="px-3 py-1.5"><MoneyInput value={value} onChange={onValueChange} className="w-full" /></td>
    </tr>
  );
}

function AddItemRow({ onAdd }: { onAdd: (label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  if (!open) {
    return (
      <tr className="border-t no-print">
        <td colSpan={2} className="px-3 py-1.5">
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
            <Plus className="h-3.5 w-3.5" /> Tambah item
          </button>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-t no-print bg-muted/20">
      <td colSpan={2} className="px-3 py-1.5">
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={label}
            placeholder="Nama item baru…"
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && label.trim()) { onAdd(label.trim()); setLabel(""); setOpen(false); }
              if (e.key === "Escape") { setLabel(""); setOpen(false); }
            }}
            className="flex-1 px-2 py-1 rounded border border-input bg-background text-sm"
          />
          <button onClick={() => { if (label.trim()) { onAdd(label.trim()); setLabel(""); setOpen(false); } }} className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs">Tambah</button>
          <button onClick={() => { setLabel(""); setOpen(false); }} className="px-2 py-1 rounded border text-xs">Batal</button>
        </div>
      </td>
    </tr>
  );
}

/* ---------------- LABA RUGI ---------------- */

const lrRows: { key: string; label: string; group?: string }[] = [
  { key: "penjualan", label: "PENJUALAN" },
  { key: "retur", label: "Return" },
  { key: "pembelian", label: "PEMBELIAN" },
  { key: "persediaan_akhir", label: "Persediaan Akhir" },
];

function YearScrollPicker({ years, selected, onSelect }: { years: number[]; selected: number | null; onSelect: (y: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: -1 | 1) => ref.current?.scrollBy({ left: dir * 200, behavior: "smooth" });

  useEffect(() => {
    if (!selected || !ref.current) return;
    const el = ref.current.querySelector<HTMLButtonElement>(`[data-year="${selected}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <button type="button" onClick={() => scroll(-1)} className="p-1.5 rounded hover:bg-muted shrink-0"><ArrowL className="h-4 w-4" /></button>
      <div ref={ref} className="flex gap-2 overflow-x-auto scroll-smooth py-1 px-1 flex-1" style={{ scrollbarWidth: "none" }}>
        {years.map((y) => (
          <button key={y} type="button" data-year={y} onClick={() => onSelect(y)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${selected === y ? "bg-primary text-primary-foreground border-primary scale-110 shadow" : "bg-background hover:bg-muted border-input"}`}>
            {y}
          </button>
        ))}
      </div>
      <button type="button" onClick={() => scroll(1)} className="p-1.5 rounded hover:bg-muted shrink-0"><ArrowR className="h-4 w-4" /></button>
    </div>
  );
}

function LabaRugiTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { data: existingYears = [] } = useLabaRugiYears(clientId);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | null>(null);

  const yearOpts = useMemo(() => {
    const set = new Set<number>(existingYears);
    for (let y = currentYear - 5; y <= currentYear + 1; y++) set.add(y);
    return Array.from(set).sort((a, b) => a - b);
  }, [existingYears, currentYear]);

  useEffect(() => {
    if (year == null) setYear(existingYears[0] ?? currentYear);
  }, [existingYears, year, currentYear]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4 no-print flex-wrap">
        <label className="text-sm font-medium shrink-0">Tahun:</label>
        <YearScrollPicker years={yearOpts} selected={year} onSelect={setYear} />
        <button onClick={() => window.print()} disabled={!year} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50 shrink-0">
          <Printer className="h-3.5 w-3.5" /> PDF
        </button>
      </div>

      {!year ? (
        <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">Pilih tahun untuk mengisi data Laba Rugi.</div>
      ) : (
        <LabaRugiForm clientId={clientId} clientName={clientName} year={year} />
      )}
    </div>
  );
}

function LabaRugiForm({ clientId, clientName, year }: { clientId: string; clientName: string; year: number }) {
  const { data, isLoading } = useLabaRugi(clientId, year);
  const { upsert } = useLabaRugiMutations(clientId);
  const { data: customs = [] } = useCustomAccounts(clientId);
  const customOps = customs.filter((c) => c.section === "lr_op");
  const opMut = useCustomAccountMutations(clientId);
  const { data: company } = useCompany();

  const [values, setValues] = useState<Record<string, number>>({});
  const [taxRate, setTaxRate] = useState(0.22);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedKeyRef = useRef<string>("");

  // Only sync from server when key changes (clientId+year), not on every refetch
  useEffect(() => {
    const key = `${clientId}:${year}`;
    if (data && loadedKeyRef.current !== key) {
      setValues(data.values ?? {});
      setTaxRate(data.taxRate ?? 0.22);
      loadedKeyRef.current = key;
    }
  }, [data, clientId, year]);

  const queueSave = (next: { values: Record<string, number>; taxRate: number }) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      upsert.mutate({ year, values: next.values, taxRate: next.taxRate });
    }, 600);
  };

  const setVal = (key: string, n: number) => {
    setValues((prev) => {
      const next = { ...prev, [key]: n };
      queueSave({ values: next, taxRate });
      return next;
    });
  };
  const setRate = (r: number) => { setTaxRate(r); queueSave({ values, taxRate: r }); };

  // Build extended values with custom ops summed into sub_biaya_lainnya for calc
  const extValues = useMemo(() => {
    const customSum = customOps.reduce((s, c) => s + (values[`cust_${c.id}`] ?? 0), 0);
    return { ...values, biaya_lainnya: (values["biaya_lainnya"] ?? 0) + customSum };
  }, [values, customOps]);

  const r = calcLabaRugi(extValues, taxRate);
  const grossPct = r.pendapatanBersih ? Math.round((r.labaKotor / r.pendapatanBersih) * 100) : 0;

  if (isLoading) return <div className="text-sm text-muted-foreground text-center p-10">Memuat data…</div>;

  return (
    <>
      <PrintHeader title="LAPORAN LABA RUGI" subtitle={`PERIODE TAHUN ${year}`} clientName={clientName} company={company} />
      <div className="text-center font-bold text-lg border-y-2 py-2 mb-1 bg-secondary no-print">LAPORAN RUGI LABA</div>
      <div className="text-center font-semibold mb-4 bg-secondary border-b-2 no-print">TAHUN {year}</div>

      <div className="flex items-center gap-3 mb-4 no-print">
        <label className="text-xs text-muted-foreground">Tarif PPh:</label>
        <select value={taxRate} onChange={(e) => setRate(parseFloat(e.target.value))} className="px-2 py-1 rounded border border-input bg-background text-xs">
          <option value={0.005}>0.5% (UMKM PP55)</option>
          <option value={0.11}>11% (PPh Badan diskon)</option>
          <option value={0.22}>22% (PPh Badan)</option>
        </select>
        {upsert.isPending && <span className="text-xs text-muted-foreground">Menyimpan…</span>}
      </div>

      <div className="border rounded-lg overflow-hidden print:border-black">
        <table className="w-full text-sm report-table">
          <tbody>
            {lrRows.map((row) => (
              <Row key={row.key} label={row.label} input={<MoneyInput value={values[row.key] ?? 0} onChange={(n) => setVal(row.key, n)} className="w-full" />} />
            ))}
            <tr className="bg-muted/40 print:bg-transparent"><td colSpan={2} className="px-3 py-2 font-bold">BIAYA OPERASIONAL :</td></tr>
            {customOps.map((c) => (
              <CustomItemRow
                key={c.id}
                item={c}
                onChange={() => {}}
                onSave={(label) => opMut.update.mutate({ id: c.id, label })}
                onDelete={() => opMut.remove.mutate(c.id)}
                value={values[`cust_${c.id}`] ?? 0}
                onValueChange={(n) => setVal(`cust_${c.id}`, n)}
              />
            ))}
            <AddItemRow onAdd={(label) => opMut.add.mutate({ section: "lr_op", label })} />

            <CalcRow label="Laba Kotor" value={r.labaKotor} bold extra={`${grossPct}%`} />
            <CalcRow label="Total Biaya" value={r.totalBiayaOperasional} bold />
            <CalcRow label="Laba sebelum pajak" value={r.labaSebelumPajak} />
            <CalcRow label={`PPh Terutang (${(taxRate * 100).toFixed(1)}%)`} value={r.pphTerutang} />
            <CalcRow label="Laba Bersih setelah Pajak" value={r.labaBersih} bold highlight />
            <Row label="PPh 25 (sudah dibayar)" input={<MoneyInput value={values["pph_25"] ?? 0} onChange={(n) => setVal("pph_25", n)} className="w-full" />} />
            <CalcRow label="Kurang Bayar (PPh 29)" value={r.pph29} highlight bold />
            <CalcRow label={`PPH25 (perbulan Thn ${year + 1})`} value={r.pph25Bulanan} />
          </tbody>
        </table>
      </div>
      <PrintFooter />
    </>
  );
}

function Row({ label, input }: { label: string; input: React.ReactNode }) {
  return (
    <tr className="border-t">
      <td className="px-3 py-1.5 w-[60%]">{label}</td>
      <td className="px-3 py-1.5 w-[40%]">{input}</td>
    </tr>
  );
}
function CalcRow({ label, value, bold, highlight, extra }: { label: string; value: number; bold?: boolean; highlight?: boolean; extra?: string }) {
  return (
    <tr className={`border-t ${highlight ? "bg-yellow-100 dark:bg-yellow-900/30 print:bg-yellow-50" : "bg-muted/30 print:bg-transparent"}`}>
      <td className={`px-3 py-2 ${bold ? "font-bold" : ""}`}>{label} {extra && <span className="text-xs text-muted-foreground ml-2">{extra}</span>}</td>
      <td className={`px-3 py-2 text-right tabular-nums ${bold ? "font-bold" : ""}`}>{formatRupiah(value)}</td>
    </tr>
  );
}

/* ---------------- NERACA ---------------- */

const formatIDDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

function NeracaTab({ clientId, clientName }: { clientId: string; clientName: string }) {
  const { data: existingDates = [] } = useNeracaDates(clientId);
  const { remove } = useNeracaMutations(clientId);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState<string>("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  useEffect(() => { if (!date) setDate(existingDates[0] ?? ""); }, [existingDates, date]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-3 no-print flex-wrap">
        <label className="text-sm font-medium">Tanggal:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-1.5 rounded-md border border-input bg-background text-sm" />
        <button onClick={() => setDate(today)} className="text-xs px-2 py-1 rounded border hover:bg-muted">Hari ini</button>
        <button onClick={() => window.print()} disabled={!date} className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50">
          <Printer className="h-3.5 w-3.5" /> PDF
        </button>
      </div>

      {existingDates.length > 0 && (
        <div className="mb-4 no-print">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">Tanggal Tersimpan:</div>
          <div className="flex flex-wrap gap-2">
            {existingDates.map((d) => (
              <div key={d} className={`group inline-flex items-center gap-1 rounded-md border ${date === d ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"}`}>
                <button onClick={() => setDate(d)} className="px-3 py-1.5 text-sm font-medium tabular-nums">{formatIDDate(d)}</button>
                <button onClick={(e) => { e.stopPropagation(); setConfirmDel(d); }} className={`px-2 py-1.5 rounded-r-md ${date === d ? "hover:bg-primary-foreground/20" : "hover:bg-destructive/10 hover:text-destructive"}`} title="Hapus">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!date ? (
        <div className="border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground">Pilih tanggal untuk mengisi Neraca.</div>
      ) : (
        <NeracaForm clientId={clientId} clientName={clientName} date={date} />
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => { if (!o) setConfirmDel(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data tanggal {confirmDel ? formatIDDate(confirmDel) : ""}?</AlertDialogTitle>
            <AlertDialogDescription>Seluruh isi neraca pada tanggal ini akan dihapus permanen dari database. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => { if (!confirmDel) return; const target = confirmDel; setConfirmDel(null); if (date === target) setDate(""); await remove.mutateAsync(target); }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Map neraca categories to custom-section keys
const CAT_TO_SECTION: Record<string, CustomSection> = {
  "ASET LANCAR": "nr_aset_lancar",
  "ASET TIDAK LANCAR": "nr_aset_tidak_lancar",
  "LIABILITAS JANGKA PENDEK": "nr_liabilitas",
  "EKUITAS": "nr_ekuitas",
};

function NeracaForm({ clientId, clientName, date }: { clientId: string; clientName: string; date: string }) {
  const { data, isLoading } = useNeraca(clientId, date);
  const { upsert } = useNeracaMutations(clientId);
  const { data: customs = [] } = useCustomAccounts(clientId);
  const opMut = useCustomAccountMutations(clientId);
  const { data: company } = useCompany();

  const [values, setValues] = useState<Record<string, number>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedKeyRef = useRef<string>("");

  useEffect(() => {
    const key = `${clientId}:${date}`;
    if (data && loadedKeyRef.current !== key) {
      setValues(data.values ?? {});
      loadedKeyRef.current = key;
    }
  }, [data, clientId, date]);

  const setVal = (key: string, n: number) => {
    setValues((prev) => {
      const next = { ...prev, [key]: n };
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => upsert.mutate({ date, values: next }), 600);
      return next;
    });
  };

  // Extend values: add custom items into the matching category total
  const customByCat = useMemo(() => {
    const m: Record<CustomSection, CustomAccount[]> = {
      lr_op: [], nr_aset_lancar: [], nr_aset_tidak_lancar: [], nr_liabilitas: [], nr_ekuitas: [],
    };
    customs.forEach((c) => m[c.section].push(c));
    return m;
  }, [customs]);

  const customCatSums: Record<CustomSection, number> = useMemo(() => ({
    lr_op: 0,
    nr_aset_lancar: customByCat.nr_aset_lancar.reduce((s, c) => s + (values[`cust_${c.id}`] ?? 0), 0),
    nr_aset_tidak_lancar: customByCat.nr_aset_tidak_lancar.reduce((s, c) => s + (values[`cust_${c.id}`] ?? 0), 0),
    nr_liabilitas: customByCat.nr_liabilitas.reduce((s, c) => s + (values[`cust_${c.id}`] ?? 0), 0),
    nr_ekuitas: customByCat.nr_ekuitas.reduce((s, c) => s + (values[`cust_${c.id}`] ?? 0), 0),
  }), [customByCat, values]);

  // All items are now DB-driven — totals come from custom items only
  const adjCategoryTotals: Record<string, number> = {
    total_aset_lancar: customCatSums.nr_aset_lancar,
    total_aset_tidak_lancar: customCatSums.nr_aset_tidak_lancar,
    total_liab_pendek: customCatSums.nr_liabilitas,
    total_ekuitas: customCatSums.nr_ekuitas,
  };
  const totalAset = adjCategoryTotals.total_aset_lancar + adjCategoryTotals.total_aset_tidak_lancar;
  const totalLE = adjCategoryTotals.total_liab_pendek + adjCategoryTotals.total_ekuitas;
  const selisih = totalAset - totalLE;
  const isBalanced = Math.abs(selisih) < 1;

  const formatted = new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  if (isLoading) return <div className="text-sm text-muted-foreground text-center p-10">Memuat data…</div>;

  return (
    <>
      <PrintHeader title="NERACA KEUANGAN" subtitle={`PER ${formatted.toUpperCase()}`} clientName={clientName} company={company} />
      <div className="text-center font-bold text-lg border-y-2 py-2 bg-secondary no-print">NERACA KEUANGAN</div>
      <div className="text-center font-semibold mb-4 bg-secondary border-b-2 no-print">PER {formatted.toUpperCase()}</div>

      <div className="mb-3 flex justify-end no-print gap-2 items-center">
        {upsert.isPending && <span className="text-xs text-muted-foreground">Menyimpan…</span>}
        {isBalanced ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-money-positive/10 text-money-positive text-xs font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Balance</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-money-negative/10 text-money-negative text-xs font-medium"><AlertTriangle className="h-3.5 w-3.5" /> Selisih {formatRupiah(selisih)}</span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
        <NeracaSideTable title="ASET" side={neracaAset} values={values} categoryTotals={adjCategoryTotals} grandLabel="TOTAL ASET" grandValue={totalAset} onChange={setVal} customByCat={customByCat} opMut={opMut} />
        <NeracaSideTable title="LIABILITAS & EKUITAS" side={neracaPasiva} values={values} categoryTotals={adjCategoryTotals} grandLabel="TOTAL LIABILITAS + EKUITAS" grandValue={totalLE} onChange={setVal} customByCat={customByCat} opMut={opMut} />
      </div>
      <PrintFooter />
    </>
  );
}

function NeracaSideTable({ title, side, values, categoryTotals, grandLabel, grandValue, onChange, customByCat, opMut }: {
  title: string;
  side: typeof neracaAset;
  values: Record<string, number>;
  categoryTotals: Record<string, number>;
  grandLabel: string;
  grandValue: number;
  onChange: (k: string, v: number) => void;
  customByCat: Record<CustomSection, CustomAccount[]>;
  opMut: ReturnType<typeof useCustomAccountMutations>;
}) {
  return (
    <div className="border rounded-lg overflow-hidden print:border-black">
      <div className="bg-secondary text-center font-bold py-2 border-b-2 print:bg-transparent print:border-black">{title}</div>
      <table className="w-full text-sm report-table">
        <tbody>
          {side.categories.map((cat) => {
            const section = CAT_TO_SECTION[cat.label];
            const customs = section ? customByCat[section] : [];
            return (
              <Fragment key={cat.label}>
                <tr className="bg-muted/40 print:bg-transparent"><td colSpan={2} className="px-3 py-2 font-bold text-xs uppercase">{cat.label}</td></tr>
                {section && customs.map((c) => (
                  <CustomItemRow
                    key={c.id}
                    item={c}
                    onChange={() => {}}
                    onSave={(label) => opMut.update.mutate({ id: c.id, label })}
                    onDelete={() => opMut.remove.mutate(c.id)}
                    value={values[`cust_${c.id}`] ?? 0}
                    onValueChange={(n) => onChange(`cust_${c.id}`, n)}
                  />
                ))}
                {section && (
                  <AddItemRow onAdd={(label) => opMut.add.mutate({ section, label })} />
                )}
                <tr className="border-t bg-muted/30 print:bg-transparent">
                  <td className="px-3 py-2 font-semibold">Total {cat.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold">{formatRupiah(categoryTotals[cat.totalKey] ?? 0)}</td>
                </tr>
              </Fragment>
            );
          })}
          <tr className="bg-primary text-primary-foreground print:bg-black print:text-white">
            <td className="px-3 py-2 font-bold">{grandLabel}</td>
            <td className="px-3 py-2 text-right tabular-nums font-bold">{formatRupiah(grandValue, { withSymbol: true })}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- Print Header / Footer ---------------- */
function PrintHeader({ title, subtitle, clientName, company }: { title: string; subtitle: string; clientName: string; company: any }) {
  return (
    <div className="hidden print:block mb-4">
      <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-3">
        {company?.logoDataUrl && <img src={company.logoDataUrl} alt="logo" className="h-14 w-14 object-contain" />}
        <div className="flex-1">
          <div className="font-bold text-base">{company?.name || "LJS - Layanan Jasa Solusi"}</div>
          {company?.tagline && <div className="text-xs">{company.tagline}</div>}
          <div className="text-xs text-gray-600">{[company?.address, company?.phone, company?.email].filter(Boolean).join(" · ")}</div>
        </div>
        <div className="text-right text-xs">
          <div className="font-semibold">Klien:</div>
          <div>{clientName}</div>
        </div>
      </div>
      <div className="text-center">
        <div className="font-bold text-lg">{title}</div>
        <div className="text-sm">{subtitle}</div>
      </div>
    </div>
  );
}

function PrintFooter() {
  return (
    <div className="hidden print:flex mt-8 text-xs text-gray-600 border-t pt-2 justify-between">
      <span>Dicetak: {new Date().toLocaleString("id-ID")}</span>
      <span>Dokumen ini dibuat otomatis oleh sistem LJS</span>
    </div>
  );
}
