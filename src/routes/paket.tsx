import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { usePackages, usePackageMutations, type ServicePackage } from "@/lib/store";
import { MoneyInput } from "@/components/MoneyInput";
import { formatRupiah } from "@/lib/format";
import { Plus, Pencil, Trash2, Star, X, Gift } from "lucide-react";

export const Route = createFileRoute("/paket")({
  head: () => ({ meta: [{ title: "Paket Jasa — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PaketPage,
});

function PaketPage() {
  const { data: packages = [] } = usePackages();
  const { remove } = usePackageMutations();
  const [editing, setEditing] = useState<ServicePackage | null>(null);
  const [open, setOpen] = useState(false);

  const sorted = [...packages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Paket Jasa</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola paket layanan yang tampil di landing page.</p>
        </div>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Tambah Paket
        </button>
      </div>

      {open && <PackageForm initial={editing} onDone={() => { setOpen(false); setEditing(null); }} />}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((p) => {
          const includes = p.description.split("\n").filter(Boolean);
          const frees = p.frees.split("\n").filter(Boolean);
          const excludes = p.excludes.split("\n").filter(Boolean);
          const priceText = p.priceMax && p.priceMax > p.price
            ? `${formatRupiah(p.price, { withSymbol: true })} – ${formatRupiah(p.priceMax, { withSymbol: true })}`
            : formatRupiah(p.price, { withSymbol: true });
          return (
            <div key={p.id} className={`bg-card border rounded-xl p-5 shadow-sm relative ${p.highlight ? "ring-2 ring-primary" : ""}`}>
              {p.highlight && (
                <span className="absolute -top-2 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  <Star className="h-3 w-3" /> Populer
                </span>
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="p-1.5 rounded hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => { if (confirm(`Hapus ${p.name}?`)) remove.mutate(p.id); }} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-3">
                {p.originalPrice > p.price && (
                  <div className="text-sm text-muted-foreground line-through">{formatRupiah(p.originalPrice, { withSymbol: true })}</div>
                )}
                <div className="text-xl font-bold text-primary">{priceText}</div>
              </div>
              {frees.length > 0 && (
                <div className="mt-3 text-xs bg-money-positive/10 text-money-positive border border-money-positive/30 rounded-md p-2">
                  <div className="font-bold flex items-center gap-1 mb-1"><Gift className="h-3 w-3" /> FREE: </div>
                  {frees.join(" • ")}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-3">
                {includes.length} fitur • {excludes.length > 0 ? `${excludes.length} exclude` : "tanpa exclude"} • urutan {p.order}
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground border border-dashed rounded-xl p-10">Belum ada paket.</div>
        )}
      </div>
    </div>
  );
}

function PackageForm({ initial, onDone }: { initial: ServicePackage | null; onDone: () => void }) {
  const { add, update } = usePackageMutations();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    excludes: initial?.excludes ?? "",
    frees: initial?.frees ?? "",
    originalPrice: initial?.originalPrice ?? 0,
    price: initial?.price ?? 0,
    priceMax: initial?.priceMax ?? null,
    highlight: initial?.highlight ?? false,
    order: initial?.order ?? 99,
  });

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!form.name.trim()) return;
      const payload = { ...form, priceMax: form.priceMax && form.priceMax > form.price ? form.priceMax : null };
      if (initial) await update.mutateAsync({ id: initial.id, patch: payload });
      else await add.mutateAsync(payload);
      onDone();
    }} className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{initial ? "Edit Paket" : "Paket Baru"}</h3>
        <button type="button" onClick={onDone} className="p-1.5 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nama Paket *">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        </Field>
        <Field label="Urutan tampil">
          <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="input" />
        </Field>
        <Field label="Harga Coret (Strike)">
          <MoneyInput value={form.originalPrice} onChange={(n) => setForm({ ...form, originalPrice: n })} className="w-full" />
        </Field>
        <Field label="Harga Akhir (Min) *">
          <MoneyInput value={form.price} onChange={(n) => setForm({ ...form, price: n })} className="w-full" />
        </Field>
        <Field label="Harga Akhir (Max) — opsional, untuk range" className="sm:col-span-2">
          <MoneyInput value={form.priceMax ?? 0} onChange={(n) => setForm({ ...form, priceMax: n || null })} className="w-full" />
          <span className="text-xs text-muted-foreground mt-1 block">Jika diisi & lebih besar dari harga min, akan tampil sebagai range "Rp 2.000.000 – Rp 2.500.000".</span>
        </Field>
        <Field label="Deskripsi Termasuk (1 baris = 1 fitur)" className="sm:col-span-2">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="input" placeholder={"Pembuatan Faktur Pajak hingga 10 faktur\nPelaporan SPT Masa PPN"} />
        </Field>
        <Field label="Tidak Termasuk / Exclude (1 baris = 1 item)" className="sm:col-span-2">
          <textarea value={form.excludes} onChange={(e) => setForm({ ...form, excludes: e.target.value })} rows={3} className="input" placeholder={"Pelaporan PPh 21\nKonsultasi tatap muka"} />
        </Field>
        <Field label="Bonus Free (di-highlight di card, 1 baris = 1 bonus)" className="sm:col-span-2">
          <textarea value={form.frees} onChange={(e) => setForm({ ...form, frees: e.target.value })} rows={3} className="input" placeholder={"Konsultasi via Zoom\nPelaporan SPT Tahunan Badan"} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.checked })} />
          Tandai sebagai paket populer
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">Batal</button>
        <button type="submit" disabled={add.isPending || update.isPending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">Simpan</button>
      </div>
      <style>{`.input{width:100%;padding:.5rem .75rem;border:1px solid var(--color-input);border-radius:.5rem;background:var(--color-background);font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
    </form>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}