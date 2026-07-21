CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "articles public read" ON public.articles FOR SELECT USING (true);
CREATE POLICY "articles public write" ON public.articles FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_articles_published ON public.articles(published, published_at DESC);
CREATE INDEX idx_articles_slug ON public.articles(slug);