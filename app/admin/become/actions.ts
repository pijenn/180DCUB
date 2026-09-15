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
    const dataToSave = { ...payload };

    // If no ID is provided, look up by email first to avoid duplicate entries
    if (!dataToSave.id && dataToSave.email) {
      const cleanEmail = dataToSave.email.trim();
      const { data: existing } = await supabaseAdmin
        .from('become_applicants')
        .select('id, nim')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (existing) {
        dataToSave.id = existing.id;
        if (!dataToSave.nim) {
          dataToSave.nim = existing.nim;
        }
      } else if (!dataToSave.nim) {
        dataToSave.nim = cleanEmail;
      }
    } else if (!dataToSave.nim && dataToSave.email) {
      dataToSave.nim = dataToSave.email.trim();
    }

    const { error } = await supabaseAdmin
      .from('become_applicants')
      .upsert(dataToSave, { onConflict: dataToSave.id ? 'id' : 'nim' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

export async function saveMultipleApplicants(
  applicants: {
    nim?: string;
    name: string;
    email: string;
    status_1: boolean;
    status_2: boolean;
  }[]
) {
  try {
    if (!applicants || applicants.length === 0) {
      return { success: false, error: 'No applicant data provided' };
    }

    // Process in chunks of 200 to prevent payload size issues
    const chunkSize = 200;
    for (let i = 0; i < applicants.length; i += chunkSize) {
      const chunk = applicants.slice(i, i + chunkSize);

      // Check existing applicants by email in this batch
      const emails = chunk.map((a) => a.email.trim());
      const { data: existingData } = await supabaseAdmin
        .from('become_applicants')
        .select('id, email, nim')
        .in('email', emails);

      const existingMap = new Map<string, { id: string; nim: string }>();
      if (existingData) {
        existingData.forEach((row: any) => {
          if (row.email) {
            existingMap.set(row.email.toLowerCase(), { id: row.id, nim: row.nim });
          }
        });
      }

      const preparedChunk = chunk.map((applicant) => {
        const cleanEmail = applicant.email.trim();
        const existing = existingMap.get(cleanEmail.toLowerCase());

        return {
          ...(existing?.id ? { id: existing.id } : {}),
          name: applicant.name.trim(),
          email: cleanEmail,
          nim: applicant.nim?.trim() || existing?.nim || cleanEmail,
          status_1: applicant.status_1,
          status_2: applicant.status_2,
        };
      });

      const { error } = await supabaseAdmin
        .from('become_applicants')
        .upsert(preparedChunk, { onConflict: 'id' });

      if (error) {
        console.error('Error saving multiple applicants chunk:', error);
        return { success: false, error: error.message };
      }
    }

    return { success: true, count: applicants.length };
  } catch (error: any) {
    console.error('Unexpected error saving multiple applicants:', error);
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
