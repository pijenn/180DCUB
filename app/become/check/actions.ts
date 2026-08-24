'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function checkAnnouncementStatus(nim: string, email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('become_applicants')
      .select('status_1, status_2')
      .eq('nim', nim)
      .eq('email', email)
      .single();

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
