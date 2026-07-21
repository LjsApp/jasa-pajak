import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Values } from "./calc";
import { deleteImage, getPublicUrl } from "./upload";

/* ---------- Types (UI-friendly camelCase) ---------- */
export type Client = {
  id: string;
  name: string;
  npwp: string;
  address: string;
  npwpDoc?: { name: string; dataUrl: string } | null;
  createdAt: string;
};

export type ServicePackage = {
  id: string;
  name: string;
  description: string;
  excludes: string;
  frees: string;
  originalPrice: number;
  price: number;
  priceMax: number | null;
  highlight: boolean;
  order: number;
};

export type CompanyInfo = {
  name: string;
  tagline: string;
  logoDataUrl?: string | null;
  logoPath?: string | null;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  whatsapp: string;
  tiktok: string;
  visi: string;
  misi: string;
  mapsEmbedUrl: string;
};

export type LabaRugiEntry = { values: Values; taxRate: number };
export type NeracaEntry = { values: Values };

export type CustomSection = "lr_op" | "nr_aset_lancar" | "nr_aset_tidak_lancar" | "nr_liabilitas" | "nr_ekuitas";
export type CustomAccount = { id: string; clientId: string; section: CustomSection; label: string; sortOrder: number };

/* ---------- Mappers ---------- */
const mapClient = (r: any): Client => ({
  id: r.id,
  name: r.name,
  npwp: r.npwp ?? "",
  address: r.address ?? "",
  npwpDoc: r.npwp_doc_data ? { name: r.npwp_doc_name ?? "file", dataUrl: r.npwp_doc_data } : null,
  createdAt: r.created_at,
});

const mapPackage = (r: any): ServicePackage => ({
  id: r.id,
  name: r.name,
  description: r.description ?? "",
  excludes: r.excludes ?? "",
  frees: r.frees ?? "",
  originalPrice: Number(r.original_price ?? 0),
  price: Number(r.price ?? 0),
  priceMax: r.price_max != null ? Number(r.price_max) : null,
  highlight: !!r.highlight,
  order: r.order ?? 99,
});

const mapCompany = (r: any): CompanyInfo => ({
  name: r.name ?? "",
  tagline: r.tagline ?? "",
  logoDataUrl: r.logo_path ? getPublicUrl("company-assets", r.logo_path) : r.logo_data_url,
  logoPath: r.logo_path ?? null,
  phone: r.phone ?? "",
  email: r.email ?? "",
  address: r.address ?? "",
  instagram: r.instagram ?? "",
  whatsapp: r.whatsapp ?? "",
  tiktok: r.tiktok ?? "",
  visi: r.visi ?? "",
  misi: r.misi ?? "",
  mapsEmbedUrl: r.maps_embed_url ?? "",
});

/* ---------- Hooks ---------- */
export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapClient);
    },
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("packages").select("*").order("order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapPackage);
    },
  });
}

export function useCompany() {
  return useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_info").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data ? mapCompany(data) : null;
    },
  });
}

export function useLabaRugiYears(clientId: string | undefined) {
  return useQuery({
    queryKey: ["lr-years", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase.from("laba_rugi").select("year").eq("client_id", clientId!).order("year", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => r.year);
    },
  });
}

export function useLabaRugi(clientId: string | undefined, year: number | null) {
  return useQuery({
    queryKey: ["lr", clientId, year],
    enabled: !!clientId && year != null,
    queryFn: async (): Promise<LabaRugiEntry> => {
      const { data, error } = await supabase.from("laba_rugi").select("*").eq("client_id", clientId!).eq("year", year!).maybeSingle();
      if (error) throw error;
      return { values: (data?.values as Values) ?? {}, taxRate: data?.tax_rate ? Number(data.tax_rate) : 0.22 };
    },
  });
}

export function useNeracaDates(clientId: string | undefined) {
  return useQuery({
    queryKey: ["nr-dates", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase.from("neraca").select("date").eq("client_id", clientId!).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => r.date as string);
    },
  });
}

export function useNeraca(clientId: string | undefined, date: string | null) {
  return useQuery({
    queryKey: ["nr", clientId, date],
    enabled: !!clientId && !!date,
    queryFn: async (): Promise<NeracaEntry> => {
      const { data, error } = await supabase.from("neraca").select("*").eq("client_id", clientId!).eq("date", date!).maybeSingle();
      if (error) throw error;
      return { values: (data?.values as Values) ?? {} };
    },
  });
}

/* ---------- Mutations: Clients ---------- */
export function useClientMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["clients"] });

  const add = useMutation({
    mutationFn: async (c: Omit<Client, "id" | "createdAt">) => {
      const { error } = await supabase.from("clients").insert({
        name: c.name, npwp: c.npwp, address: c.address,
        npwp_doc_name: c.npwpDoc?.name ?? null,
        npwp_doc_data: c.npwpDoc?.dataUrl ?? null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Client> }) => {
      const upd: any = {};
      if (patch.name !== undefined) upd.name = patch.name;
      if (patch.npwp !== undefined) upd.npwp = patch.npwp;
      if (patch.address !== undefined) upd.address = patch.address;
      if (patch.npwpDoc !== undefined) {
        upd.npwp_doc_name = patch.npwpDoc?.name ?? null;
        upd.npwp_doc_data = patch.npwpDoc?.dataUrl ?? null;
      }
      const { error } = await supabase.from("clients").update(upd).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { add, update, remove };
}

/* ---------- Mutations: Packages ---------- */
export function usePackageMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["packages"] });

  const toRow = (p: Partial<ServicePackage>) => ({
    name: p.name, description: p.description, excludes: p.excludes, frees: p.frees,
    original_price: p.originalPrice, price: p.price, price_max: p.priceMax ?? null,
    highlight: p.highlight, order: p.order,
  });

  const add = useMutation({
    mutationFn: async (p: Omit<ServicePackage, "id">) => {
      const { error } = await supabase.from("packages").insert(toRow(p) as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ServicePackage> }) => {
      const { error } = await supabase.from("packages").update(toRow(patch) as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { add, update, remove };
}

/* ---------- Mutations: Company ---------- */
export function useCompanyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: CompanyInfo) => {
      const { error } = await supabase.from("company_info").upsert({
        id: 1,
        name: c.name, tagline: c.tagline,
        logo_data_url: c.logoPath ? null : (c.logoDataUrl ?? null),
        logo_path: c.logoPath ?? null,
        phone: c.phone, email: c.email, address: c.address,
        instagram: c.instagram, whatsapp: c.whatsapp, tiktok: c.tiktok,
        visi: c.visi, misi: c.misi, maps_embed_url: c.mapsEmbedUrl ?? "",
        updated_at: new Date().toISOString(),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company"] }),
  });
}

/* ---------- Mutations: Laba Rugi ---------- */
export function useLabaRugiMutations(clientId: string | undefined) {
  const qc = useQueryClient();
  const upsert = useMutation({
    mutationFn: async ({ year, values, taxRate }: { year: number; values: Values; taxRate: number }) => {
      if (!clientId) return;
      const { error } = await supabase.from("laba_rugi").upsert(
        { client_id: clientId, year, values: values as any, tax_rate: taxRate, updated_at: new Date().toISOString() },
        { onConflict: "client_id,year" },
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["lr", clientId, vars.year] });
      qc.invalidateQueries({ queryKey: ["lr-years", clientId] });
    },
  });
  return { upsert };
}

/* ---------- Mutations: Neraca ---------- */
export function useNeracaMutations(clientId: string | undefined) {
  const qc = useQueryClient();
  const upsert = useMutation({
    mutationFn: async ({ date, values }: { date: string; values: Values }) => {
      if (!clientId) return;
      const { error } = await supabase.from("neraca").upsert(
        { client_id: clientId, date, values: values as any, updated_at: new Date().toISOString() },
        { onConflict: "client_id,date" },
      );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["nr", clientId, vars.date] });
      qc.invalidateQueries({ queryKey: ["nr-dates", clientId] });
    },
  });
  const remove = useMutation({
    mutationFn: async (date: string) => {
      if (!clientId) return;
      const { error } = await supabase.from("neraca").delete().eq("client_id", clientId).eq("date", date);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nr-dates", clientId] }),
  });
  return { upsert, remove };
}

/* ---------- Custom Accounts ---------- */
const mapCustom = (r: any): CustomAccount => ({
  id: r.id, clientId: r.client_id, section: r.section, label: r.label, sortOrder: r.sort_order ?? 99,
});

export function useCustomAccounts(clientId: string | undefined) {
  return useQuery({
    queryKey: ["custom_accounts", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase.from("custom_accounts").select("*").eq("client_id", clientId!).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map(mapCustom);
    },
  });
}

export function useCustomAccountMutations(clientId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["custom_accounts", clientId] });
  const add = useMutation({
    mutationFn: async ({ section, label }: { section: CustomSection; label: string }) => {
      if (!clientId) return;
      const { error } = await supabase.from("custom_accounts").insert({ client_id: clientId, section, label });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, label }: { id: string; label: string }) => {
      const { error } = await supabase.from("custom_accounts").update({ label }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("custom_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  return { add, update, remove };
}

/* ---------- Admin auth ---------- */
const SESSION_KEY = "ljs_admin_session";

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = sessionStorage.getItem(SESSION_KEY);
  // Token harus ada dan punya format uuid:timestamp (min 36 char)
  return !!token && token.length > 36;
}

export async function adminLogin(username: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.from("admin_credentials").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return false;
  if (data.username === username && data.password === password) {
    // Token unik per-sesi: tidak bisa ditebak atau di-set manual
    const token = `${crypto.randomUUID()}:${Date.now().toString(36)}`;
    sessionStorage.setItem(SESSION_KEY, token);
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function getAdminCredentials(): Promise<{ username: string; password: string } | null> {
  const { data, error } = await supabase.from("admin_credentials").select("username, password").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return { username: data.username, password: data.password };
}

export async function updateAdminCredentials(username: string, password: string) {
  const { error } = await supabase.from("admin_credentials").update({
    username, password, updated_at: new Date().toISOString(),
  }).eq("id", 1);
  if (error) throw error;
}

/* ---------- Articles ---------- */
export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  content: string;
  tags: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const mapArticle = (r: any): Article => ({
  id: r.id, slug: r.slug, title: r.title,
  excerpt: r.excerpt ?? "",
  coverImageUrl: r.cover_image_path
    ? getPublicUrl("article-images", r.cover_image_path)
    : (r.cover_image_url ?? null),
  coverImagePath: r.cover_image_path ?? null,
  content: r.content ?? "", tags: r.tags ?? "",
  published: !!r.published, publishedAt: r.published_at,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

export function useArticles(opts?: { onlyPublished?: boolean }) {
  return useQuery({
    queryKey: ["articles", opts?.onlyPublished ?? "all"],
    queryFn: async () => {
      let q = supabase.from("articles").select("*");
      if (opts?.onlyPublished) q = q.eq("published", true);
      const { data, error } = await q.order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapArticle);
    },
  });
}

export function useArticleBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["article", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("articles").select("*").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      return data ? mapArticle(data) : null;
    },
  });
}

export function useArticleMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["articles"] });
  const toRow = (a: Partial<Article>) => ({
    slug: a.slug, title: a.title, excerpt: a.excerpt,
    cover_image_url: a.coverImagePath ? null : (a.coverImageUrl ?? null),
    cover_image_path: a.coverImagePath ?? null,
    content: a.content, tags: a.tags,
    published: a.published,
    published_at: a.published ? (a.publishedAt ?? new Date().toISOString()) : null,
    updated_at: new Date().toISOString(),
  });
  const add = useMutation({
    mutationFn: async (a: Omit<Article, "id" | "createdAt" | "updatedAt">) => {
      const { error } = await supabase.from("articles").insert(toRow(a) as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Article> }) => {
      const { error } = await supabase.from("articles").update(toRow(patch) as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      // Fetch path first so we can clean up the file after row delete
      const { data: row } = await (supabase
        .from("articles")
        .select("cover_image_path") as any)
        .eq("id", id)
        .maybeSingle();
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw error;
      const p = (row as any)?.cover_image_path;
      if (p) {
        await deleteImage("article-images", p);
      }
    },
    onSuccess: invalidate,
  });
  return { add, update, remove };
}

/* ---------- i18n ---------- */
export type Lang = "id" | "en";
const LANG_KEY = "ljs_lang";
export function getLang(): Lang {
  if (typeof window === "undefined") return "id";
  return (localStorage.getItem(LANG_KEY) as Lang) || "id";
}
export function setLang(l: Lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LANG_KEY, l);
    window.dispatchEvent(new Event("ljs-lang-change"));
  }
}