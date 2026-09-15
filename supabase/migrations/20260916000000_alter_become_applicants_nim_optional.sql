-- Migration: Make NIM optional in become_applicants table and add index on lower(email)
ALTER TABLE become_applicants ALTER COLUMN nim DROP NOT NULL;

-- Create unique index on lower(email) so that email is uniquely identified
CREATE UNIQUE INDEX IF NOT EXISTS become_applicants_email_idx ON become_applicants (LOWER(email));
