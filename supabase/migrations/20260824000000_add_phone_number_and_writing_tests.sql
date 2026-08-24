-- Migration: Add phone_number to users and create become_writing_tests table

-- 1. Add phone_number column to users table if it does not exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- 2. Create become_writing_tests table for candidate submissions
CREATE TABLE IF NOT EXISTS public.become_writing_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    nim TEXT NOT NULL,
    department TEXT NOT NULL,
    drive_link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.become_writing_tests ENABLE ROW LEVEL SECURITY;

-- 4. Policies for become_writing_tests
-- Authenticated users can insert their own test submission
CREATE POLICY "Authenticated users can submit writing test" ON public.become_writing_tests
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Authenticated users can view their own submission
CREATE POLICY "Users can view own writing test submission" ON public.become_writing_tests
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Admins can view and manage all writing test submissions
CREATE POLICY "Admins can view all writing test submissions" ON public.become_writing_tests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'ADMIN'
        )
    );
