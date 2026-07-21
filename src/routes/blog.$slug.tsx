import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useArticleBySlug, useArticles } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { SiteNavbar } from "@/components/SiteNavbar";
import { Newspaper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";

// Loader: fetch artikel untuk head() SEO dinamis
const articleLoader = async ({ params }: { params: { slug: string } }) => {
  const { data } = await (supabase
    .from("articles")
    .select("*")
    .eq("slug", params.slug)
    .eq("published", true)
    .maybeSingle()) as { data: any };
  if (!data) return null;
  const coverImageUrl = data.cover_image_path
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/article-images/${data.cover_image_path}`
    : (data.cover_image_url ?? null);
  return {
    title: data.title as string,
    excerpt: (data.excerpt ?? "") as string,
    coverImageUrl: coverImageUrl as string | null,
    publishedAt: data.published_at as string | null,
    tags: (data.tags ?? "") as string,
  };
};

export const Route = createFileRoute("/blog/$slug")({
  loader: articleLoader,
  head: ({ loaderData: article }) => {
    if (!article) {
      return {
        meta: [
          { title: "Artikel tidak ditemukan — LJS" },
          { name: "robots", content: "noindex, follow" },
        ],
      };
    }
    return {
      meta: [
        { title: `${article.title} — LJS` },
        { name: "description", content: article.excerpt || "Baca artikel pajak terbaru dari LJS Konsultan Pajak." },
        { property: "og:type", content: "article" },
        { property: "og:title", content: article.title },
        { property: "og:description", content: article.excerpt || "" },
        { property: "og:image", content: article.coverImageUrl || "https://layanan-jasa-solusi.vercel.app/og-image.png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "article:published_time", content: article.publishedAt || "" },
        { property: "article:tag", content: article.tags },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: article.title },
        { name: "twitter:description", content: article.excerpt || "" },
        { name: "twitter:image", content: article.coverImageUrl || "https://layanan-jasa-solusi.vercel.app/og-image.png" },
        { name: "robots", content: "index, follow" },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { t } = useT();
  const { data: article, isLoading } = useArticleBySlug(slug);
  const { data: allArticles = [] } = useArticles({ onlyPublished: true });

  const related = useMemo(() => {
    if (!article) return [];
    const myTags = article.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    return allArticles
      .filter((a) => a.id !== article.id)
      .map((a) => {
        const tags = a.tags.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
        const overlap = tags.filter((tg) => myTags.includes(tg)).length;
        return { a, score: overlap };
      })
      .sort((x, y) => y.score - x.score || (new Date(y.a.publishedAt || y.a.createdAt).getTime() - new Date(x.a.publishedAt || x.a.createdAt).getTime()))
      .slice(0, 3)
      .map((x) => x.a);
  }, [article, allArticles]);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <SiteNavbar />
      <article className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <Link to="/blog" className="text-sm text-[#16a34a] font-semibold hover:underline">{t.blog_back}</Link>
        {isLoading && <div className="mt-6 text-slate-500">Memuat…</div>}
        {!isLoading && !article && <div className="mt-6 text-slate-500">Artikel tidak ditemukan.</div>}
        {article && (
          <>
            {article.tags && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {article.tags.split(",").map((s) => s.trim()).filter(Boolean).map((tg) => (
                  <Link key={tg} to="/blog" className="text-[11px] font-semibold text-[#16a34a] bg-[#16a34a]/10 hover:bg-[#16a34a]/20 px-2 py-0.5 rounded uppercase tracking-wide">{tg}</Link>
                ))}
              </div>
            )}
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-[#0b2545] leading-tight">{article.title}</h1>
            {article.publishedAt && (
              <div className="mt-3 text-sm text-slate-500">
                {t.blog_published} {new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            )}
            {article.coverImageUrl && (
              <img src={article.coverImageUrl} alt={article.title} className="mt-6 w-full rounded-xl border" />
            )}
            {article.excerpt && <p className="mt-6 text-lg text-slate-600 leading-relaxed font-medium">{article.excerpt}</p>}
            <div
              className="prose prose-slate mt-8 max-w-none prose-headings:text-[#0b2545] prose-a:text-[#16a34a]"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
            />
          </>
        )}
      </article>

      {article && related.length > 0 && (
        <section className="bg-slate-50 border-t py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-[#0b2545] mb-6">Artikel Terkait</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {related.map((a) => (
                <Link key={a.id} to="/blog/$slug" params={{ slug: a.slug }} className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  {a.coverImageUrl ? (
                    <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      <img src={a.coverImageUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-[#0b2545] to-[#1e3a5f] flex items-center justify-center text-white/40">
                      <Newspaper className="h-8 w-8" />
                    </div>
                  )}
                  <div className="p-4">
                    {a.tags && <div className="text-[10px] font-semibold text-[#16a34a] uppercase tracking-wide mb-1.5">{a.tags.split(",")[0]?.trim()}</div>}
                    <h3 className="font-bold text-[#0b2545] text-sm leading-snug group-hover:underline line-clamp-2">{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
