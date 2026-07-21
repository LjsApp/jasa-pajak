
CREATE TABLE public.custom_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  section TEXT NOT NULL CHECK (section IN ('lr_op','nr_aset_lancar','nr_aset_tidak_lancar','nr_liabilitas','nr_ekuitas')),
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 99,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_custom_accounts_client_section ON public.custom_accounts(client_id, section);

ALTER TABLE public.custom_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_accounts public read" ON public.custom_accounts FOR SELECT USING (true);
CREATE POLICY "custom_accounts public write" ON public.custom_accounts FOR ALL USING (true) WITH CHECK (true);
