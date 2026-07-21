-- Add path columns (keep existing URL columns for backward compatibility)
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_image_path TEXT;
ALTER TABLE public.company_info ADD COLUMN IF NOT EXISTS logo_path TEXT;

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "article images public read" ON storage.objects;
CREATE POLICY "article images public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "article images public write" ON storage.objects;
CREATE POLICY "article images public write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "article images public update" ON storage.objects;
CREATE POLICY "article images public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'article-images') WITH CHECK (bucket_id = 'article-images');

DROP POLICY IF EXISTS "article images public delete" ON storage.objects;
CREATE POLICY "article images public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "company assets public read" ON storage.objects;
CREATE POLICY "company assets public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-assets');

DROP POLICY IF EXISTS "company assets public write" ON storage.objects;
CREATE POLICY "company assets public write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'company-assets');

DROP POLICY IF EXISTS "company assets public update" ON storage.objects;
CREATE POLICY "company assets public update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'company-assets') WITH CHECK (bucket_id = 'company-assets');

DROP POLICY IF EXISTS "company assets public delete" ON storage.objects;
CREATE POLICY "company assets public delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'company-assets');
