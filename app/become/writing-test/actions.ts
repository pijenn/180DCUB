'use server';

import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createServiceClient(supabaseUrl, supabaseServiceKey);

export interface SubmitWritingTestPayload {
  name: string;
  nim: string;
  department: string;
  driveLink: string;
}

export async function submitWritingTest(payload: SubmitWritingTestPayload) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'You must be signed in to submit your writing test.' };
    }

    const { name, nim, department, driveLink } = payload;

    if (!name || !name.trim()) {
      return { success: false, error: 'Name is required.' };
    }

    if (!nim || !nim.trim()) {
      return { success: false, error: 'NIM is required.' };
    }

    if (!department || !department.trim()) {
      return { success: false, error: 'Please select a department.' };
    }

    if (!driveLink || !driveLink.trim()) {
      return { success: false, error: 'Google Drive link is required.' };
    }

    // Basic URL validation
    try {
      new URL(driveLink);
    } catch {
      return { success: false, error: 'Please enter a valid URL for the Drive link.' };
    }

    // Insert into become_writing_tests table using service role
    const { data, error } = await supabaseAdmin
      .from('become_writing_tests')
      .insert({
        user_id: user.id,
        name: name.trim(),
        nim: nim.trim(),
        department: department.trim(),
        drive_link: driveLink.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting writing test submission:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Unexpected error in submitWritingTest:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}
