'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function fetchApplicants() {
  try {
    const { data, error } = await supabaseAdmin
      .from('become_applicants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applicants:', error);
      return { success: false, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error fetching applicants:', error);
    return { success: false, data: [] };
  }
}

export async function saveApplicant(payload: any) {
  try {
    const { error } = await supabaseAdmin
      .from('become_applicants')
      .upsert(payload);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function deleteApplicant(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('become_applicants')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function fetchWritingTestSubmissions(department?: string, search?: string) {
  try {
    let query = supabaseAdmin
      .from('become_writing_tests')
      .select('*')
      .order('created_at', { ascending: false });

    if (department && department !== 'ALL') {
      query = query.eq('department', department);
    }

    if (search && search.trim()) {
      query = query.or(`name.ilike.%${search}%,nim.ilike.%${search}%`);
    }

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Error fetching writing test submissions:', error);
      return { success: false, data: [] };
    }

    if (!submissions || submissions.length === 0) {
      return { success: true, data: [] };
    }

    // Enrich with user email and phone number if user_id exists
    const userIds = Array.from(new Set(submissions.map((s: any) => s.user_id).filter(Boolean)));
    const userMap: Record<string, { email?: string; phone_number?: string; full_name?: string }> = {};

    if (userIds.length > 0) {
      const { data: usersData, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, full_name, phone_number')
        .in('id', userIds);

      if (!userError && usersData) {
        usersData.forEach((u: any) => {
          userMap[u.id] = u;
        });
      }
    }

    const enriched = submissions.map((sub: any) => ({
      ...sub,
      user_email: userMap[sub.user_id]?.email || null,
      user_phone: userMap[sub.user_id]?.phone_number || null,
      user_full_name: userMap[sub.user_id]?.full_name || null,
    }));

    return { success: true, data: enriched };
  } catch (error: any) {
    console.error('Unexpected error fetching writing test submissions:', error);
    return { success: false, data: [], error: error.message };
  }
}

export async function deleteWritingTestSubmission(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from('become_writing_tests')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}
