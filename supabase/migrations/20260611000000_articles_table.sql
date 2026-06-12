-- Create Articles Table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  jenis_artikel TEXT NOT NULL,
  link_instagram TEXT NOT NULL,
  foto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Articles are viewable by everyone
CREATE POLICY "Articles are viewable by everyone" ON public.articles
  FOR SELECT USING (true);

-- Only admins can modify articles
-- We check if the user has role 'ADMIN' in the users table
CREATE POLICY "Only admins can insert articles" ON public.articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

CREATE POLICY "Only admins can update articles" ON public.articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );

CREATE POLICY "Only admins can delete articles" ON public.articles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'ADMIN')
  );
