'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function checkAnnouncementStatus(emailOrNim: string, maybeEmail?: string) {
  try {
    // If two arguments were passed (legacy nim, email), use the second arg as email
    const emailToQuery = (maybeEmail && maybeEmail.trim()) ? maybeEmail : emailOrNim;
    const cleanEmail = emailToQuery ? emailToQuery.trim() : '';

    if (!cleanEmail) {
      return { success: false, status: null, error: 'Email is required' };
    }

    const { data, error } = await supabaseAdmin
      .from('become_applicants')
      .select('name, nim, email, status_1, status_2')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('Error fetching applicant status:', error);
      return { success: false, status: null };
    }

    if (!data) {
      return { success: false, status: null };
    }

    return { success: true, status: data };
  } catch (error) {
    console.error('Unexpected error checking status:', error);
    return { success: false, status: null };
  }
}

