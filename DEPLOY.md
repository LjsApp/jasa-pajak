# Deploy Guide

Project ini = **TanStack Start + Vite**, dibangun untuk runtime Cloudflare Workers (via `wrangler.jsonc` & plugin Cloudflare bawaan template Lovable). Itu sebabnya deploy ke Vercel sebagai project Next.js/Static menghasilkan **404 NOT_FOUND** seperti gambar yang Anda lihat: Vercel tidak otomatis tahu cara menjalankan SSR entry `src/server.ts` (yang adalah Cloudflare Worker handler).

Berikut 2 opsi deploy. **Opsi A direkomendasikan** karena paling stabil.

---

## Opsi A — Publish lewat Lovable (rekomendasi)

1. Klik tombol **Publish** di kanan atas editor Lovable.
2. App akan live di `https://<nama-project>.lovable.app`.
3. Pasang custom domain dari **Project Settings → Domains** atau dari dialog Publish.

Keuntungan:
- Sudah teruji untuk template ini (Cloudflare Workers + Supabase).
- SSR, route `/blog/$slug`, dan API motivasi/cuaca jalan tanpa konfigurasi tambahan.
- Env Supabase otomatis ter-inject.

---

## Opsi B — Vercel

TanStack Start mendukung Vercel sebagai deployment target. Tapi template Lovable saat ini **tidak** memaketkan preset Vercel — perlu sedikit pekerjaan manual di Vercel.

### Langkah di Vercel Dashboard

1. **Import Git Repository** project ini.
2. **Framework Preset**: pilih **Other** (jangan Next.js/Vite default).
3. **Build Command**: `bun run build`
4. **Output Directory**: kosongkan (gunakan default — Vite menulis ke `dist/`).
5. **Environment Variables** (wajib semua, jika tidak app akan crash):

   | Nama | Nilai |
   | --- | --- |
   | `VITE_SUPABASE_URL` | sama seperti di `.env` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | sama seperti di `.env` |
   | `VITE_SUPABASE_PROJECT_ID` | sama seperti di `.env` |
   | `SUPABASE_URL` | sama seperti di `.env` |
   | `SUPABASE_PUBLISHABLE_KEY` | sama seperti di `.env` |
   | `SUPABASE_SERVICE_ROLE_KEY` | dari Supabase dashboard (Settings → API) |

6. **Deploy.**

### Catatan penting Opsi B

- Server-side endpoint TanStack (`createServerFn`, route di bawah `src/routes/api/*`) **tidak otomatis bekerja** di Vercel tanpa adapter resmi. Saat ini project belum memakai server function—seluruh data dibaca via `@supabase/supabase-js` di browser, sehingga halaman publik (`/`, `/blog`, `/blog/<slug>`) tetap render normal sebagai SPA.
- Jika nanti ada penambahan server function, perlu setup adapter Vercel TanStack Start (`@tanstack/react-start/vercel`).
- Image upload tetap berfungsi karena pakai Supabase Storage, bukan filesystem.

File `vercel.json` di repo sudah disetel untuk SPA rewrite (semua request → `index.html`) supaya deep link `/blog/<slug>` tidak 404 saat refresh.

---

## Troubleshooting

- **404 di Vercel pada refresh `/blog/...`** → pastikan `vercel.json` ada di root.
- **`Missing Supabase environment variable(s)`** → env belum di-set di dashboard Vercel.
- **Login admin tidak jalan** → tabel `admin_credentials` masih kosong; isi via Supabase SQL editor.