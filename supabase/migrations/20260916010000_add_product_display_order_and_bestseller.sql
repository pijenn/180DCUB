-- Migration: Add display_order and is_best_seller to products table
-- Allows admin to arrange product placement and highlight up to 3 best seller products

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT false;

-- Create index for performance on product placement queries
CREATE INDEX IF NOT EXISTS idx_products_display_order 
ON public.products (is_best_seller DESC, display_order ASC, created_at DESC);
