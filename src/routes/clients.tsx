import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useClients, useClientMutations, type Client } from "@/lib/store";
import { Plus, Trash2, Search, Upload, FileText, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Client — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ClientsPage,
});

function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const { remove } = useClientMutations();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [q, setQ] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.npwp.includes(q),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} client terdaftar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="h-4 w-4" /> Tambah Client
        </button>
      </div>

      {showForm && <ClientForm initial={editing} onDone={() => { setShowForm(false); setEditing(null); }} />}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama usaha atau NPWP…" className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading && <div className="col-span-full text-center text-sm text-muted-foreground">Memuat…</div>}
        {!isLoading && filtered.map((c) => (
          <div key={c.id} className="bg-card border rounded-xl p-5 shadow-sm flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg leading-tight truncate">{c.name}</h3>
                <div className="text-xs text-muted-foreground mt-1">NPWP: {c.npwp || "—"}</div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => {
                  if (!confirm(`Hapus client ${c.name}?`)) return;
                  remove.mutate(c.id, {
                    onSuccess: () => toast.success(`Client "${c.name}" dihapus.`),
                    onError: (e: any) => toast.error("Gagal menghapus client", { description: e?.message }),
                  });
                }} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="text-sm mt-3 space-y-1 text-muted-foreground">
              <div className="line-clamp-2">{c.address || "Alamat belum diisi"}</div>
              {c.npwpDoc && (
                <a href={c.npwpDoc.dataUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-accent hover:underline mt-1">
                  <FileText className="h-3.5 w-3.5" /> {c.npwpDoc.name}
                </a>
              )}
            </div>
            <Link to="/laporan" search={{ id: c.id }} className="mt-4 inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Buka Laporan
            </Link>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full bg-card border border-dashed rounded-xl p-10 text-center text-sm text-muted-foreground">
            {clients.length === 0 ? "Belum ada client. Tambah client pertamamu." : "Tidak ada hasil."}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientForm({ initial, onDone }: { initial: Client | null; onDone: () => void }) {
  const { add, update } = useClientMutations();
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    npwp: initial?.npwp ?? "",
    address: initial?.address ?? "",
    npwpDoc: initial?.npwpDoc ?? null,
  });
  const saving = add.isPending || update.isPending;

  const handleFile = (file: File | null) => {
    if (!file) return setForm((f) => ({ ...f, npwpDoc: null }));
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error("Ukuran file maksimal 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, npwpDoc: { name: file.name, dataUrl: reader.result as string } }));
    reader.onerror = () => toast.error("Gagal membaca file");
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      if (!form.name.trim()) return;
      try {
        if (initial) {
          await update.mutateAsync({ id: initial.id, patch: form });
          toast.success("Client diperbarui");
        } else {
          await add.mutateAsync(form);
          toast.success("Client ditambahkan");
        }
        onDone();
      } catch (err: any) {
        toast.error("Gagal menyimpan client", { description: err?.message });
      }
    }} className="bg-card border rounded-xl p-5 shadow-sm grid sm:grid-cols-2 gap-4">
      <Field label="Nama Usaha *">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="PT MAJU JAYA" />
      </Field>
      <Field label="No. NPWP">
        <input value={form.npwp} onChange={(e) => setForm({ ...form, npwp: e.target.value })} className="input" placeholder="xx.xxx.xxx.x-xxx.xxx" />
      </Field>
      <Field label="Alamat" className="sm:col-span-2">
        <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input min-h-[80px]" placeholder="Alamat lengkap usaha" />
      </Field>
      <Field label="Upload Dokumen NPWP" className="sm:col-span-2">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-muted cursor-pointer text-sm">
            <Upload className="h-4 w-4" /> Pilih file
            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
          </label>
          {form.npwpDoc && (
            <div className="inline-flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-accent" />
              <span className="truncate max-w-[200px]">{form.npwpDoc.name}</span>
              <button type="button" onClick={() => setForm({ ...form, npwpDoc: null })} className="p-0.5 rounded hover:bg-muted"><X className="h-3.5 w-3.5" /></button>
            </div>
          )}
        </div>
      </Field>
      <div className="sm:col-span-2 flex justify-end gap-2">
        <button type="button" onClick={onDone} disabled={saving} className="px-4 py-2 rounded-md border text-sm hover:bg-muted disabled:opacity-60">Batal</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan"}</button>
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