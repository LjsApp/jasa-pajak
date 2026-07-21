
-- Admin credentials (single row, custom auth — not Supabase auth)
CREATE TABLE public.admin_credentials (
  id INT PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton_admin CHECK (id = 1)
);
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin creds public read" ON public.admin_credentials FOR SELECT USING (true);
CREATE POLICY "admin creds public update" ON public.admin_credentials FOR UPDATE USING (true);
CREATE POLICY "admin creds public insert" ON public.admin_credentials FOR INSERT WITH CHECK (true);
INSERT INTO public.admin_credentials (id, username, password) VALUES (1, 'admin', 'admin123');

-- Company info (singleton)
CREATE TABLE public.company_info (
  id INT PRIMARY KEY DEFAULT 1,
  name TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  logo_data_url TEXT,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  tiktok TEXT NOT NULL DEFAULT '',
  visi TEXT NOT NULL DEFAULT '',
  misi TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton_company CHECK (id = 1)
);
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company public read" ON public.company_info FOR SELECT USING (true);
CREATE POLICY "company public write" ON public.company_info FOR ALL USING (true) WITH CHECK (true);
INSERT INTO public.company_info (id, name, tagline, phone, email, address, instagram, whatsapp, tiktok, visi, misi) VALUES (
  1,
  'LJS — Layanan Jasa Solusi',
  'Solusi Pajak Profesional untuk Bisnis Anda',
  '+62 811-3079-091',
  'konsultasiljs@gmail.com',
  'Jl. Ngagel Rejo 1b No.5',
  'layanan_jasa_solusi1',
  '+62 812-3194-3222',
  'konsultasipajak.ljs',
  'Menjadi mitra terpercaya UMKM dan korporasi dalam pengelolaan perpajakan yang transparan, akurat, dan tepat waktu.',
  'Memberikan layanan konsultasi & administrasi pajak yang efisien, mudah dipahami, dan sesuai regulasi terbaru.'
);

-- Service packages
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  excludes TEXT NOT NULL DEFAULT '',
  frees TEXT NOT NULL DEFAULT '',
  original_price BIGINT NOT NULL DEFAULT 0,
  price BIGINT NOT NULL DEFAULT 0,
  price_max BIGINT,
  highlight BOOLEAN NOT NULL DEFAULT false,
  "order" INT NOT NULL DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages public read" ON public.packages FOR SELECT USING (true);
CREATE POLICY "packages public write" ON public.packages FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.packages (name, description, original_price, price, price_max, "order", highlight, frees) VALUES
('Paket Basic',
 E'Pembuatan Faktur Pajak hingga 10 faktur\nPembuatan ID Billing PPN + Pelaporan SPT Masa PPN\nPembuatan ID Billing + Pelaporan PPh Final & Koreksi Omset\nHitung PPh 21 karyawan (1-5 orang)\nPembuatan ID Billing + Pelaporan PPH 25\nCek dan koreksi/Hitung PPh 22/23',
 2500000, 2000000, NULL, 1, false, ''),
('Paket Standard',
 E'Pembuatan Faktur Pajak hingga 11-20 faktur\nPembuatan ID Billing PPN + Pelaporan SPT Masa PPN\nPembuatan ID Billing + Pelaporan PPh Final & Koreksi Omset\nHitung PPh 21 karyawan (6-15 orang)\nPembuatan ID Billing + Pelaporan PPH 25\nCek dan koreksi/Hitung PPh 22/23\nSupport konsultasi ringan via chat/Call',
 3000000, 2500000, NULL, 2, true, 'Konsultasi via chat'),
('Paket Premium',
 E'Pembuatan Faktur Pajak hingga 50 faktur\nPembuatan ID Billing PPN + Pelaporan SPT Masa PPN\nPembuatan ID Billing + Pelaporan PPh Final & Koreksi Omset\nHitung PPh 21 karyawan (15-50 orang)\nPembuatan ID Billing + Pelaporan PPH 25\nPrioritas pengerjaan\nSupport konsultasi via chat/call/zoom meeting\nInclude Pelaporan SPT Tahunan Badan & Direktur',
 5000000, 3000000, NULL, 3, false, E'Konsultasi via Zoom\nPelaporan SPT Tahunan Badan');

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npwp TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  npwp_doc_name TEXT,
  npwp_doc_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients public read" ON public.clients FOR SELECT USING (true);
CREATE POLICY "clients public write" ON public.clients FOR ALL USING (true) WITH CHECK (true);

-- Laba Rugi entries (per client per year)
CREATE TABLE public.laba_rugi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  year INT NOT NULL,
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  tax_rate NUMERIC NOT NULL DEFAULT 0.22,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, year)
);
ALTER TABLE public.laba_rugi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "laba_rugi public" ON public.laba_rugi FOR ALL USING (true) WITH CHECK (true);

-- Neraca entries (per client per date)
CREATE TABLE public.neraca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id, date)
);
ALTER TABLE public.neraca ENABLE ROW LEVEL SECURITY;
CREATE POLICY "neraca public" ON public.neraca FOR ALL USING (true) WITH CHECK (true);
