'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifies candidate eligibility based on Batch 1 status (status_1 = true)
 * and retrieves existing booking if already booked.
 */
export async function verifyCandidateEligibility(nim: string, email: string) {
  try {
    const cleanNim = nim.trim();
    const cleanEmail = email.trim();

    if (!cleanNim || !cleanEmail) {
      return { success: false, error: 'Please enter both your NIM and Email' };
    }

    // 1. Check become_applicants table
    const { data: applicant, error: applicantError } = await supabaseAdmin
      .from('become_applicants')
      .select('name, nim, email, status_1')
      .eq('nim', cleanNim)
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (applicantError) {
      console.error('Error verifying applicant:', applicantError);
      return { success: false, error: 'Failed to verify candidate. Please try again.' };
    }

    if (!applicant) {
      return {
        success: false,
        error: 'No applicant record found for this NIM and Email combination.',
      };
    }

    if (!applicant.status_1) {
      return {
        success: false,
        error: 'We are sorry, but this feature is exclusively for candidates who passed Batch 1 selection.',
      };
    }

    // 2. Check if candidate already has an existing booked slot
    const { data: existingBooking, error: bookingError } = await supabaseAdmin
      .from('interview_slots')
      .select(`
        id,
        slot_date,
        start_time,
        end_time,
        is_booked,
        booked_by_nim,
        booked_by_name,
        booked_by_email,
        booked_at,
        panelist:interview_panelists (
          id,
          name,
          department,
          division,
          phone_number
        )
      `)
      .eq('booked_by_nim', cleanNim)
      .eq('is_booked', true)
      .maybeSingle();

    return {
      success: true,
      candidate: {
        name: applicant.name,
        nim: applicant.nim,
        email: applicant.email,
      },
      existingBooking: existingBooking || null,
    };
  } catch (error: any) {
    console.error('Unexpected error during candidate verification:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
}

/**
 * Fetch available (unbooked) interview slots for a chosen department & division
 */
export async function fetchAvailableSlots(department: string, division?: string | null) {
  try {
    // 1. Find all panelists for this department (& division if provided)
    let panelistQuery = supabaseAdmin
      .from('interview_panelists')
      .select('id, name, department, division, phone_number')
      .eq('department', department);

    if (division && division.trim()) {
      panelistQuery = panelistQuery.eq('division', division.trim());
    }

    const { data: panelists, error: panelistError } = await panelistQuery;

    if (panelistError) {
      console.error('Error fetching panelists:', panelistError);
      return { success: false, data: [] };
    }

    if (!panelists || panelists.length === 0) {
      return { success: true, data: [] };
    }

    const panelistIds = panelists.map((p) => p.id);
    const panelistMap = new Map(panelists.map((p) => [p.id, p]));

    // 2. Find all unbooked slots for these panelists
    const { data: slots, error: slotsError } = await supabaseAdmin
      .from('interview_slots')
      .select('*')
      .in('panelist_id', panelistIds)
      .eq('is_booked', false)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (slotsError) {
      console.error('Error fetching slots:', slotsError);
      return { success: false, data: [] };
    }

    const enrichedSlots = (slots || []).map((slot) => ({
      ...slot,
      panelist: panelistMap.get(slot.panelist_id),
    }));

    return { success: true, data: enrichedSlots };
  } catch (error: any) {
    console.error('Unexpected error fetching available slots:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Atomically book an interview slot for a candidate
 */
export async function bookInterviewSlot(payload: {
  slotId: string;
  nim: string;
  email: string;
  name: string;
}) {
  try {
    const { slotId, nim, email, name } = payload;
    const cleanNim = nim.trim();

    // 1. Verify candidate doesn't already have an active booking
    const { data: currentBooking } = await supabaseAdmin
      .from('interview_slots')
      .select('id')
      .eq('booked_by_nim', cleanNim)
      .eq('is_booked', true)
      .maybeSingle();

    if (currentBooking) {
      return {
        success: false,
        error: 'You already have an active interview schedule. Please cancel your existing booking first if you wish to choose another time.',
      };
    }

    // 2. Check if the requested slot is still available
    const { data: slot, error: slotCheckError } = await supabaseAdmin
      .from('interview_slots')
      .select(`
        id,
        slot_date,
        start_time,
        end_time,
        is_booked,
        panelist:interview_panelists (
          id,
          name,
          department,
          division,
          phone_number
        )
      `)
      .eq('id', slotId)
      .single();

    if (slotCheckError || !slot) {
      return { success: false, error: 'The selected time slot could not be found.' };
    }

    if (slot.is_booked) {
      return {
        success: false,
        error: 'This time slot has just been booked by another candidate. Please select a different slot.',
      };
    }

    // 3. Atomically update the slot
    const { data: updatedSlot, error: updateError } = await supabaseAdmin
      .from('interview_slots')
      .update({
        is_booked: true,
        booked_by_nim: cleanNim,
        booked_by_name: name.trim(),
        booked_by_email: email.trim(),
        booked_at: new Date().toISOString(),
      })
      .eq('id', slotId)
      .eq('is_booked', false) // Ensure concurrency lock
      .select(`
        id,
        slot_date,
        start_time,
        end_time,
        is_booked,
        booked_by_nim,
        booked_by_name,
        booked_by_email,
        booked_at,
        panelist:interview_panelists (
          id,
          name,
          department,
          division,
          phone_number
        )
      `)
      .single();

    if (updateError || !updatedSlot) {
      return {
        success: false,
        error: 'Unable to reserve this slot (it may have just been claimed). Please try another slot.',
      };
    }

    return {
      success: true,
      booking: updatedSlot,
    };
  } catch (error: any) {
    console.error('Unexpected error booking slot:', error);
    return { success: false, error: error.message || 'Booking failed' };
  }
}

/**
 * Candidate cancels their own booking to pick a new slot
 */
export async function cancelCandidateBooking(slotId: string, nim: string) {
  try {
    const cleanNim = nim.trim();

    const { error } = await supabaseAdmin
      .from('interview_slots')
      .update({
        is_booked: false,
        booked_by_nim: null,
        booked_by_name: null,
        booked_by_email: null,
        booked_at: null,
      })
      .eq('id', slotId)
      .eq('booked_by_nim', cleanNim);

    if (error) {
      console.error('Error cancelling candidate booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Cancellation failed' };
  }
}
