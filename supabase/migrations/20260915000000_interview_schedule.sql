-- Migration: Create interview_panelists and interview_slots, and add ADMINBECOME role

-- 1. Add ADMINBECOME to user_role enum
DO $$
BEGIN
    ALTER TYPE user_role ADD VALUE 'ADMINBECOME';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create interview_panelists table
CREATE TABLE IF NOT EXISTS public.interview_panelists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    division TEXT,
    phone_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create interview_slots table
CREATE TABLE IF NOT EXISTS public.interview_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panelist_id UUID NOT NULL REFERENCES public.interview_panelists(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_booked BOOLEAN DEFAULT false,
    booked_by_nim TEXT,
    booked_by_name TEXT,
    booked_by_email TEXT,
    booked_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT uq_panelist_slot UNIQUE (panelist_id, slot_date, start_time)
);

-- 4. Unique index ensuring a candidate NIM can only hold 1 active booked slot at a time
CREATE UNIQUE INDEX IF NOT EXISTS uq_candidate_active_booking 
ON public.interview_slots (booked_by_nim) 
WHERE is_booked = true;

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_interview_slots_date ON public.interview_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_interview_slots_panelist ON public.interview_slots(panelist_id);
CREATE INDEX IF NOT EXISTS idx_interview_panelists_dept ON public.interview_panelists(department, division);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.interview_panelists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;

-- Allow public read access (booking operations and management are handled securely through server actions with service role key)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'interview_panelists' AND policyname = 'Allow public read of panelists'
    ) THEN
        CREATE POLICY "Allow public read of panelists" 
        ON public.interview_panelists FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'interview_slots' AND policyname = 'Allow public read of interview slots'
    ) THEN
        CREATE POLICY "Allow public read of interview slots" 
        ON public.interview_slots FOR SELECT 
        USING (true);
    END IF;
END $$;
