import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCompany, useCompanyMutation, getAdminCredentials, updateAdminCredentials, type CompanyInfo } from "@/lib/store";
import { uploadImage, deleteImage } from "@/lib/upload";
import { toast } from "sonner";
import { Upload, X, Lock, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Profil Perusahaan — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsPage,
});

const blank: CompanyInfo = {
  name: "", tagline: "", logoDataUrl: null, logoPath: null, phone: "", email: "", address: "",
  instagram: "", whatsapp: "", tiktok: "", visi: "", misi: "", mapsEmbedUrl: "",
};

function SettingsPage() {
  const { data: company } = useCompany();
  const save = useCompanyMutation();
  const [form, setForm] = useState<CompanyInfo>(blank);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => { if (company) setForm(company); }, [company]);

  const handleLogo = async (file: File | null) => {
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { path, publicUrl } = await uploadImage({
        file,
        bucket: "company-assets",
        folder: "company/logo",
        oldPath: form.logoPath,
      });
      setForm({ ...form, logoPath: path, logoDataUrl: publicUrl });
    } catch (e: any) {
      toast.error("Gagal unggah logo", { description: e?.message });
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    const old = form.logoPath;
    setForm({ ...form, logoDataUrl: null, logoPath: null });
    if (old) await deleteImage("company-assets", old);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Profil Perusahaan</h1>
        <p className="text-sm text-muted-foreground mt-1">Informasi ini akan tampil di landing page.</p>
      </div>

      <form onSubmit={submit} className="bg-card border rounded-xl p-6 space-y-5">
        <Field label="Logo">
          <div className="flex items-center gap-4">
            {form.logoDataUrl ? (
              <div className="relative">
                <img src={form.logoDataUrl} alt="Logo" className="h-20 w-20 object-contain rounded-md border bg-background" />
                <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"><X className="h-3 w-3" /></button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-md border-2 border-dashed flex items-center justify-center text-xs text-muted-foreground">No logo</div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-muted cursor-pointer text-sm">
              {uploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload Logo
              <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={(e) => handleLogo(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Perusahaan"><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Tagline"><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          <Field label="No HP"><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Email"><input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Alamat Lengkap" className="sm:col-span-2">
            <textarea className="input min-h-[72px] resize-y" placeholder="Jl. Contoh No. 123, Kel. ..., Kec. ..., Kota ..., Provinsi ..., Kode Pos" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </Field>
          <Field label="WhatsApp"><input className="input" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></Field>
          <Field label="Instagram"><input className="input" value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></Field>
          <Field label="TikTok"><input className="input" value={form.tiktok} onChange={(e) => setForm({ ...form, tiktok: e.target.value })} /></Field>
        </div>

        <Field label="Google Maps Embed URL">
          <textarea
            className="input min-h-[72px] font-mono text-xs"
            placeholder='Buka Google Maps → Bagikan → Sematkan peta → Salin HTML, atau tempel URL src dari iframe (contoh: https://www.google.com/maps/embed?pb=...)'
            value={form.mapsEmbedUrl}
            onChange={(e) => {
              const raw = e.target.value;
              // Auto-extract src URL if user pastes full <iframe ...> tag
              const m = raw.match(/src=["']([^"']+)["']/);
              setForm({ ...form, mapsEmbedUrl: m ? m[1] : raw });
            }}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Tempel <em>iframe embed</em> dari Google Maps. Otomatis mengambil URL dari tag iframe. Akan tampil sebagai peta interaktif di footer landing page.
          </p>
          {form.mapsEmbedUrl && (
            <div className="mt-2 rounded-md overflow-hidden border">
              <iframe src={form.mapsEmbedUrl} className="w-full h-40" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Preview peta" />
            </div>
          )}
        </Field>

        <Field label="Visi"><textarea className="input min-h-[80px]" value={form.visi} onChange={(e) => setForm({ ...form, visi: e.target.value })} /></Field>
        <Field label="Misi"><textarea className="input min-h-[100px]" value={form.misi} onChange={(e) => setForm({ ...form, misi: e.target.value })} /></Field>

        <div className="flex justify-end gap-2 items-center">
          {saved && <span className="text-sm text-money-positive inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Tersimpan</span>}
          <button type="submit" disabled={save.isPending} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">Simpan</button>
        </div>
        <style>{`.input{width:100%;padding:.5rem .75rem;border:1px solid var(--color-input);border-radius:.5rem;background:var(--color-background);font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-ring)}`}</style>
      </form>

      <AdminCredentialsCard />
    </div>
  );
}

function AdminCredentialsCard() {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminCredentials().then((c) => {
      if (c) setCreds(c);
      setLoaded(true);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds.username.trim() || !creds.password.trim()) return;
    setSaving(true);
    await updateAdminCredentials(creds.username, creds.password);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={submit} className="bg-card border rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-primary" />
        <h2 className="font-semibold">Kredensial Admin</h2>
      </div>
      <p className="text-sm text-muted-foreground">Ubah username & password untuk login ke halaman admin.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Username</span>
          <input className="mt-1.5 w-full px-3 py-2 rounded-md border border-input bg-background text-sm" value={creds.username} onChange={(e) => setCreds({ ...creds, username: e.target.value })} disabled={!loaded} />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Password</span>
          <input type="text" className="mt-1.5 w-full px-3 py-2 rounded-md border border-input bg-background text-sm" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} disabled={!loaded} />
        </label>
      </div>
      <div className="flex justify-end gap-2 items-center">
        {saved && <span className="text-sm text-money-positive inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Tersimpan</span>}
        <button type="submit" disabled={saving || !loaded} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">Simpan Kredensial</button>
      </div>
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