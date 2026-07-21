import { Drawer } from "vaul";
import { useMemo, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, ExternalLink, Newspaper, X } from "lucide-react";
import type { Article } from "@/lib/store";
import DOMPurify from "dompurify";

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

export function ArticleBottomSheet({
  article,
  articles,
  onOpenChange,
  onSelect,
}: {
  article: Article | null;
  articles: Article[];
  onOpenChange: (open: boolean) => void;
  onSelect: (a: Article) => void;
}) {
  // Ref untuk scroll konten utama (kanan)
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top saat artikel berganti
  useEffect(() => {
    if (article?.id) {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [article?.id]);

  const related = useMemo(() => {
    if (!article) return [];
    const myTags = article.tags
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    return articles
      .filter((a) => a.id !== article.id)
      .map((a) => {
        const tags = a.tags
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);
        const score = tags.filter((t) => myTags.includes(t)).length;
        return { a, score };
      })
      .sort(
        (x, y) =>
          y.score - x.score ||
          new Date(y.a.publishedAt || y.a.createdAt).getTime() -
            new Date(x.a.publishedAt || x.a.createdAt).getTime(),
      )
      .slice(0, 6)
      .map((x) => x.a);
  }, [article, articles]);

  return (
    <Drawer.Root open={!!article} onOpenChange={onOpenChange} shouldScaleBackground>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-[92vh] flex-col rounded-t-2xl bg-white outline-none"
        >
          {/* Drag handle */}
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300" />

          {/* Header bar */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0 border-b border-slate-100">
            <Drawer.Title className="text-xs font-bold uppercase tracking-wider text-[#16a34a]">
              Artikel
            </Drawer.Title>
            <div className="flex items-center gap-1">
              {article && (
                <Link
                  to="/blog/$slug"
                  params={{ slug: article.slug }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#16a34a] px-2 py-1 rounded"
                >
                  Buka penuh <ExternalLink className="h-3 w-3" />
                </Link>
              )}
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Tutup"
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>

          {/* Body: two-column on desktop, single-column on mobile */}
          <div className="flex flex-1 min-h-0">

            {/* ── KIRI: Sidebar Artikel Terkait (25%) — desktop only ── */}
            {related.length > 0 && (
              <aside className="hidden md:flex flex-col w-[25%] shrink-0 border-r border-slate-100 overflow-y-auto overscroll-contain bg-slate-50/60">
                <div className="px-4 pt-4 pb-2 shrink-0">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Artikel Terkait
                  </h2>
                </div>
                <div className="flex flex-col gap-0.5 px-2 pb-6">
                  {related.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className="group text-left flex gap-2.5 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
                    >
                      {/* Thumbnail */}
                      <div className="h-14 w-[4.5rem] shrink-0 rounded-md overflow-hidden bg-slate-200">
                        {a.coverImageUrl ? (
                          <img
                            src={a.coverImageUrl}
                            alt={a.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-[#0b2545] to-[#1e3a5f] flex items-center justify-center">
                            <Newspaper className="h-4 w-4 text-white/40" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-[11px] font-semibold text-[#0b2545] leading-snug line-clamp-3 group-hover:text-[#16a34a] transition-colors">
                          {a.title}
                        </h3>
                      </div>
                    </button>
                  ))}
                </div>
              </aside>
            )}

            {/* ── KANAN: Konten Artikel Utama (75% / full on mobile) ── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-8 pb-10 pt-4">
              {article && (
                <article>
                  {article.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.tags
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((tg) => (
                          <span
                            key={tg}
                            className="text-[11px] font-bold uppercase text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded"
                          >
                            {tg}
                          </span>
                        ))}
                    </div>
                  )}
                  <h1 className="text-2xl md:text-3xl font-black text-[#0b2545] leading-tight">
                    {article.title}
                  </h1>
                  {article.publishedAt && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      {fmtDate(article.publishedAt)}
                    </div>
                  )}
                  {article.coverImageUrl && (
                    <img
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="mt-5 w-full rounded-xl border max-h-80 object-cover"
                    />
                  )}
                  {article.excerpt && (
                    <p className="mt-5 text-base text-slate-600 leading-relaxed font-medium border-l-4 border-[#16a34a] pl-4 bg-[#16a34a]/5 py-3 rounded-r-lg">
                      {article.excerpt}
                    </p>
                  )}
                  <div
                    className="prose prose-slate mt-6 max-w-none prose-headings:text-[#0b2545] prose-a:text-[#16a34a]"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                  />
                </article>
              )}

              {/* Artikel Terkait — mobile only (di bawah konten) */}
              {article && related.length > 0 && (
                <section className="mt-10 pt-6 border-t md:hidden">
                  <h2 className="text-lg font-bold text-[#0b2545] mb-4">
                    Artikel Terkait
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {related.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => onSelect(a)}
                        className="group text-left flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                      >
                        <div className="h-16 w-20 shrink-0 rounded-md overflow-hidden bg-slate-100">
                          {a.coverImageUrl ? (
                            <img
                              src={a.coverImageUrl}
                              alt={a.title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[#0b2545] to-[#1e3a5f] flex items-center justify-center">
                              <Newspaper className="h-4 w-4 text-white/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#0b2545] leading-snug line-clamp-2 group-hover:text-[#16a34a] transition-colors">
                            {a.title}
                          </h3>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>

          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
