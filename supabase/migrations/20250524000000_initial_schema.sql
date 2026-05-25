-- Create Custom Enum Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE product_type AS ENUM ('DECK', 'CASEBOOK', 'MENTORING');
CREATE TYPE voucher_type AS ENUM ('PERCENTAGE', 'FLAT');
CREATE TYPE applicable_type AS ENUM ('ALL', 'DECK', 'CASEBOOK', 'MENTORING');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- Create Users Table (Linked to Supabase Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Products Table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type product_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT,
  owner TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Mentoring Schedules Table
CREATE TABLE public.mentoring_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT false,
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Create Voucher Code Table
CREATE TABLE public.voucher_code (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode_voucher TEXT UNIQUE NOT NULL,
  tipe_potongan voucher_type NOT NULL,
  nilai_potongan INTEGER NOT NULL,
  max_discount INTEGER,
  kuota INTEGER NOT NULL DEFAULT 0,
  applicable_type applicable_type NOT NULL DEFAULT 'ALL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Carts Table
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- One cart per user
);

-- Create Cart Items Table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.mentoring_schedules(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Transactions Table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  midtrans_transaction_id TEXT,
  status transaction_status NOT NULL DEFAULT 'PENDING',
  total_amount INTEGER NOT NULL,
  voucher_id UUID REFERENCES public.voucher_code(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Transaction Items Table
CREATE TABLE public.transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
  schedule_id UUID REFERENCES public.mentoring_schedules(id) ON DELETE SET NULL,
  price_at_buy INTEGER NOT NULL
);

-- SET UP ROW LEVEL SECURITY (RLS)

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_code ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Products & Mentoring Schedules are readable by everyone
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Mentoring schedules are viewable by everyone" ON public.mentoring_schedules
  FOR SELECT USING (true);

-- Users can read and update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Carts & Cart Items are readable and writable by the owner
CREATE POLICY "Users can view own cart" ON public.carts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart" ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart items" ON public.cart_items
  FOR ALL USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transaction items" ON public.transaction_items
  FOR SELECT USING (
    transaction_id IN (SELECT id FROM public.transactions WHERE user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 'USER');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
