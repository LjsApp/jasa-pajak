import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useRef, useEffect } from "react";
import { useArticles, useArticleMutations, type Article } from "@/lib/store";
import { uploadImage, deleteImage } from "@/lib/upload";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, ExternalLink, Eye, EyeOff,
  Bold, Italic, Heading, List, Link as LinkIcon,
  Search, Loader2, Download, Upload,
} from "lucide-react";

export const Route = createFileRoute("/artikel")({
  head: () => ({ meta: [{ title: "Artikel — LJS" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ArticleAdmin,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

type FormState = {
  id?: string;
  slug: string; title: string; excerpt: string;
  coverImageUrl: string; coverImagePath: string | null; content: string; tags: string;
  published: boolean;
};
const empty: FormState = {
  slug: "", title: "", excerpt: "", coverImageUrl: "", coverImagePath: null, content: "", tags: "", published: false,
};

const PAGE_SIZE = 10;

function ArticleAdmin() {
  const { data: articles = [], isLoading } = useArticles();
  const { add, update, remove } = useArticleMutations();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  const saving = add.isPending || update.isPending;

  // Cleanup blob URL when changed or unmounted
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  // --- Filter & Pagination ---
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.tags.toLowerCase().includes(q)
    );
  }, [articles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  // --- Form helpers ---
  const startNew = () => {
    if (localPreview) { URL.revokeObjectURL(localPreview); setLocalPreview(null); }
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (a: Article) => {
    if (localPreview) { URL.revokeObjectURL(localPreview); setLocalPreview(null); }
    setForm({
      id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt,
      coverImageUrl: a.coverImageUrl ?? "",
      coverImagePath: a.coverImagePath ?? null,
      content: a.content, tags: a.tags, published: a.published,
    });
    setOpen(true);
  };

  const onTitleChange = (v: string) => {
    setForm((f) => ({ ...f, title: v, slug: f.id ? f.slug : slugify(v) }));
  };

  const handleFile = async (file: File) => {
    // Client-side validation
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const MAX = 5 * 1024 * 1024;
    if (file.size > MAX) {
      toast.error("Ukuran gambar maksimal 5 MB");
      return;
    }
    // Instant local preview so UI doesn't "hilang" while uploading
    const objectUrl = URL.createObjectURL(file);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(objectUrl);

    setUploadingCover(true);
    try {
      const folder = `articles/${form.slug || "untitled"}`;
      const { path, publicUrl } = await uploadImage({
        file,
        bucket: "article-images",
        folder,
        oldPath: form.coverImagePath,
      });
      // Cache-buster prevents stale 404 from Supabase CDN right after upload
      const bustedUrl = `${publicUrl}?v=${Date.now()}`;
      setForm((f) => ({ ...f, coverImagePath: path, coverImageUrl: bustedUrl }));
      toast.success("Gambar berhasil diunggah");
    } catch (e: any) {
      toast.error("Gagal mengunggah gambar", { description: e?.message });
      // Drop preview on failure
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    } finally {
      setUploadingCover(false);
      // Reset file input so picking the same file again still fires onChange
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  const clearCover = async () => {
    const old = form.coverImagePath;
    if (localPreview) { URL.revokeObjectURL(localPreview); setLocalPreview(null); }
    setForm((f) => ({ ...f, coverImageUrl: "", coverImagePath: null }));
    if (old) await deleteImage("article-images", old);
  };

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Judul dan slug wajib diisi");
      return;
    }
    const payload = {
      slug: form.slug, title: form.title, excerpt: form.excerpt,
      coverImageUrl: form.coverImagePath ? null : (form.coverImageUrl || null),
      coverImagePath: form.coverImagePath,
      content: form.content,
      tags: form.tags, published: form.published, publishedAt: null,
    };
    try {
      if (form.id) {
        await update.mutateAsync({ id: form.id, patch: payload });
        setOpen(false);
        toast.success("Artikel berhasil diperbarui!", {
          description: `"${form.title}" telah disimpan.`,
          duration: 4000,
        });
      } else {
        try {
          await add.mutateAsync(payload);
          setOpen(false);
          toast.success("Artikel berhasil dibuat!", {
            description: `"${form.title}" siap dipublikasikan.`,
            duration: 4000,
          });
        } catch (err: any) {
          if (err?.code === "23505" || err?.message?.includes("duplicate") || err?.status === 409) {
            const newSlug = `${payload.slug}-${Math.floor(Math.random() * 10000)}`;
            await add.mutateAsync({ ...payload, slug: newSlug });
            setOpen(false);
            toast.success("Artikel berhasil dibuat!", {
              description: "URL disesuaikan otomatis untuk mencegah duplikat.",
              duration: 4000,
            });
          } else {
            throw err;
          }
        }
      }
    } catch (e: any) {
      toast.error("Gagal menyimpan artikel", {
        description: e?.message || "Terjadi kesalahan tak terduga.",
        duration: 5000,
      });
    }
  };

  const del = async (id: string, title: string) => {
    try {
      await remove.mutateAsync(id);
      toast.success("Artikel berhasil dihapus!", {
        description: `"${title}" telah dihapus permanen.`,
        duration: 4000,
      });
    } catch (e: any) {
      toast.error("Gagal menghapus artikel", {
        description: e?.message || "Terjadi kesalahan tak terduga.",
        duration: 5000,
      });
    }
  };

  // Simple toolbar wrappers for content textarea
  const contentRef = (el: HTMLTextAreaElement | null) => { (window as any).__artikelTa = el; };
  const wrap = (before: string, after = before) => {
    const ta: HTMLTextAreaElement | null = (window as any).__artikelTa;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const v = form.content;
    const sel = v.slice(s, e) || "teks";
    const next = v.slice(0, s) + before + sel + after + v.slice(e);
    setForm((f) => ({ ...f, content: next }));
    setTimeout(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); }, 0);
  };
  const insertLine = (prefix: string) => {
    const ta: HTMLTextAreaElement | null = (window as any).__artikelTa;
    if (!ta) return;
    const s = ta.selectionStart;
    const v = form.content;
    const before = v.slice(0, s), after = v.slice(s);
    const insertion = (before.endsWith("\n") || before === "" ? "" : "\n") + prefix;
    setForm((f) => ({ ...f, content: before + insertion + after }));
  };

  // --- Export / Import JSON ---
  const exportJson = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: articles.length,
      articles: articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        coverImagePath: a.coverImagePath,
        coverImageUrl: a.coverImageUrl,
        content: a.content,
        tags: a.tags,
        published: a.published,
        publishedAt: a.publishedAt,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    const fname = `articles-backup-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}.json`;
    a.href = url; a.download = fname; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Export berhasil: ${articles.length} artikel`);
  };

  const importJson = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : parsed?.articles;
      if (!Array.isArray(list)) throw new Error("Format JSON tidak valid (missing 'articles')");

      let added = 0, updated = 0, skipped = 0;
      const existingBySlug = new Map(articles.map((a) => [a.slug, a]));

      for (const item of list) {
        if (!item?.slug || !item?.title) { skipped++; continue; }
        const row = {
          slug: String(item.slug),
          title: String(item.title),
          excerpt: String(item.excerpt ?? ""),
          cover_image_path: item.coverImagePath ?? null,
          cover_image_url: item.coverImagePath ? null : (item.coverImageUrl ?? null),
          content: String(item.content ?? ""),
          tags: String(item.tags ?? ""),
          published: !!item.published,
          published_at: item.publishedAt ?? (item.published ? new Date().toISOString() : null),
          updated_at: new Date().toISOString(),
        };
        const existing = existingBySlug.get(row.slug);
        if (existing) {
          const { error } = await (supabase.from("articles") as any).update(row).eq("id", existing.id);
          if (error) { skipped++; continue; }
          updated++;
        } else {
          const { error } = await (supabase.from("articles") as any).insert(row);
          if (error) { skipped++; continue; }
          added++;
        }
      }
      toast.success("Import selesai", { description: `${added} ditambah, ${updated} diperbarui, ${skipped} dilewati.` });
      // Trigger refetch
      window.dispatchEvent(new Event("focus"));
    } catch (e: any) {
      toast.error("Gagal import JSON", { description: e?.message });
    } finally {
      setImporting(false);
      if (importFileRef.current) importFileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Artikel</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel yang tampil di halaman /blog.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={importFileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => importFileRef.current?.click()}
            disabled={importing}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import JSON
          </button>
          <button
            type="button"
            onClick={exportJson}
            disabled={articles.length === 0}
            className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border hover:bg-muted disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> Export JSON
          </button>
          <a href="/blog" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border hover:bg-muted">
            <ExternalLink className="h-4 w-4" /> Lihat Blog
          </a>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={startNew}><Plus className="h-4 w-4" /> Artikel Baru</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{form.id ? "Edit Artikel" : "Artikel Baru"}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Judul</label>
                  <Input value={form.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Judul artikel" />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Slug (URL)</label>
                    <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="contoh-slug-artikel" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Tag (pisah koma)</label>
                    <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Pajak, UMKM, PPh 21" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Ringkasan</label>
                  <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat artikel" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Cover Image</label>
                  <div className="flex items-center gap-3">
                    <Input ref={coverFileRef} type="file" accept="image/*" disabled={uploadingCover} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                    {uploadingCover && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {(form.coverImageUrl || localPreview) && (
                      <button type="button" onClick={clearCover} className="text-xs text-red-600 hover:underline">Hapus</button>
                    )}
                  </div>
                  {(localPreview || form.coverImageUrl) && (
                    <img
                      src={localPreview || form.coverImageUrl}
                      alt=""
                      className="mt-2 h-32 rounded border object-cover"
                      onError={(e) => {
                        // Retry once with new cache-buster (Supabase CDN propagation)
                        const img = e.currentTarget;
                        if (!img.dataset.retried && form.coverImageUrl) {
                          img.dataset.retried = "1";
                          img.src = `${form.coverImageUrl.split("?")[0]}?v=${Date.now() + 1}`;
                        }
                      }}
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Konten (HTML didukung)</label>
                  <div className="flex items-center gap-1 mb-1.5 border rounded-t-md p-1 bg-muted/40">
                    <ToolbarBtn onClick={() => wrap("<strong>", "</strong>")} title="Bold"><Bold className="h-3.5 w-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => wrap("<em>", "</em>")} title="Italic"><Italic className="h-3.5 w-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => insertLine("<h2>Judul</h2>\n")} title="Heading"><Heading className="h-3.5 w-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => insertLine("<ul>\n  <li>Item</li>\n</ul>\n")} title="List"><List className="h-3.5 w-3.5" /></ToolbarBtn>
                    <ToolbarBtn onClick={() => wrap('<a href="https://" target="_blank" rel="noreferrer">', "</a>")} title="Link"><LinkIcon className="h-3.5 w-3.5" /></ToolbarBtn>
                  </div>
                  <Textarea ref={contentRef} rows={14} className="rounded-t-none font-mono text-xs" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="<p>Tulis konten artikel di sini. Gunakan tag HTML untuk format.</p>" />
                </div>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
                  Terbitkan (tampil di /blog)
                </label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button>
                <Button onClick={save} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cari berdasarkan judul, slug, atau tag..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          // Skeleton rows
          <div>
            <div className="bg-muted/50 px-4 py-3 grid grid-cols-[1fr_auto_auto_auto] md:grid-cols-[1fr_180px_100px_80px] gap-4 border-b">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12 hidden md:block" />
              <Skeleton className="h-3 w-12 hidden md:block" />
              <Skeleton className="h-3 w-8 ml-auto" />
            </div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4 border-t">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-36 hidden md:block" />
                <Skeleton className="h-6 w-16 rounded-full hidden md:block" />
                <div className="flex gap-1 ml-auto">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">Belum ada artikel. Klik "Artikel Baru" untuk membuat.</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            Tidak ada artikel yang cocok dengan "<strong>{search}</strong>".
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Judul</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Slug</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a) => (
                <tr key={a.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">/blog/{a.slug}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {a.published ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-50 text-green-700"><Eye className="h-3 w-3" /> Publish</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600"><EyeOff className="h-3 w-3" /> Draft</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(a)}><Pencil className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus artikel?</AlertDialogTitle>
                            <AlertDialogDescription>"{a.title}" akan dihapus permanen dan tidak bisa dikembalikan.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => del(a.id, a.title)}>Hapus</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Info */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="font-semibold text-foreground">
              {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)}
            </span>{" "}
            dari <span className="font-semibold text-foreground">{filtered.length}</span> artikel
            {search && <> (difilter dari {articles.length} total)</>}
          </p>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={safePage === i + 1}
                      onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

function ToolbarBtn({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={title} className="p-1.5 rounded hover:bg-background border border-transparent hover:border-input">
      {children}
    </button>
  );
}
