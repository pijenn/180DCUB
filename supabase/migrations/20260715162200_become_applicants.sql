-- Migration: Create become_applicants table
CREATE TABLE become_applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nim TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    status_1 BOOLEAN DEFAULT false,
    status_2 BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE become_applicants ENABLE ROW LEVEL SECURITY;

-- We intentionally DO NOT add any public SELECT policies here.
-- The only way to access this data is through a secure Server Action
-- that uses the service_role key to bypass RLS, or an authenticated admin.

-- You can add policies for authenticated admins if needed later.
