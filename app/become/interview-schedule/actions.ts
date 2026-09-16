'use server';

import { createClient } from '@supabase/supabase-js';
import { isBodBomDivision } from '@/lib/interviewConstants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifies candidate eligibility based on Batch 1 status (status_1 = true)
 * and retrieves existing booking if already booked.
 */
export async function verifyCandidateEligibility(nim: string, email: string) {
  try {
    const cleanNim = (nim || '').trim();
    const cleanEmail = (email || '').trim();

    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email' };
    }

    // 1. Check become_applicants table by email only
    const { data: applicant, error: applicantError } = await supabaseAdmin
      .from('become_applicants')
      .select('name, nim, email, status_1')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (applicantError) {
      console.error('Error verifying applicant:', applicantError);
      return { success: false, error: 'Failed to verify candidate. Please try again.' };
    }

    if (!applicant) {
      return {
        success: false,
        error: 'No applicant record found for this Email address. Please check your registered email.',
      };
    }

    if (!applicant.status_1) {
      return {
        success: false,
        error: 'We are sorry, but this feature is exclusively for candidates who passed Batch 1 selection.',
      };
    }

    // 2. Check if candidate already has an existing booked slot (by email or NIM)
    let bookingQuery = supabaseAdmin
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
      .eq('is_booked', true);

    if (cleanNim) {
      bookingQuery = bookingQuery.or(`booked_by_email.ilike."${cleanEmail}",booked_by_nim.eq."${cleanNim}"`);
    } else {
      bookingQuery = bookingQuery.ilike('booked_by_email', cleanEmail);
    }

    const { data: existingBooking, error: bookingError } = await bookingQuery.maybeSingle();

    return {
      success: true,
      candidate: {
        name: applicant.name,
        nim: applicant.nim || cleanNim || '',
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
    // 1. Find all panelists for this department (or cross-department)
    const { data: panelists, error: panelistError } = await supabaseAdmin
      .from('interview_panelists')
      .select('id, name, department, division, phone_number')
      .or(`department.eq."${department}",department.eq."All Departments",department.eq."ALL"`);

    if (panelistError) {
      console.error('Error fetching panelists:', panelistError);
      return { success: false, data: [] };
    }

    if (!panelists || panelists.length === 0) {
      return { success: true, data: [] };
    }

    const cleanDiv = (division || '').trim().toLowerCase();
    const filteredPanelists = panelists.filter((p) => {
      // If no specific division was specified (e.g. HR or Consulting general), show all panelists for that department
      if (!cleanDiv || cleanDiv === 'general') return true;

      const pDiv = (p.division || '').trim().toLowerCase();
      // BoD/BoM panelists can interview candidates across ALL subdivisions in this department!
      if (isBodBomDivision(p.division)) return true;

      // Exact match with chosen division
      return pDiv === cleanDiv;
    });

    if (filteredPanelists.length === 0) {
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
    const cleanNim = (nim || '').trim();
    const cleanEmail = (email || '').trim();

    // 1. Verify candidate doesn't already have an active booking
    let currentBookingQuery = supabaseAdmin
      .from('interview_slots')
      .select('id')
      .eq('is_booked', true);

    if (cleanNim) {
      currentBookingQuery = currentBookingQuery.or(`booked_by_email.ilike."${cleanEmail}",booked_by_nim.eq."${cleanNim}"`);
    } else {
      currentBookingQuery = currentBookingQuery.ilike('booked_by_email', cleanEmail);
    }

    const { data: currentBooking } = await currentBookingQuery.maybeSingle();

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
        booked_by_nim: cleanNim || null,
        booked_by_name: name.trim(),
        booked_by_email: cleanEmail,
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
export async function cancelCandidateBooking(slotId: string, nim?: string, email?: string) {
  try {
    const cleanNim = (nim || '').trim();
    const cleanEmail = (email || '').trim();

    let cancelQuery = supabaseAdmin
      .from('interview_slots')
      .update({
        is_booked: false,
        booked_by_nim: null,
        booked_by_name: null,
        booked_by_email: null,
        booked_at: null,
      })
      .eq('id', slotId);

    if (cleanEmail && cleanNim) {
      cancelQuery = cancelQuery.or(`booked_by_email.ilike."${cleanEmail}",booked_by_nim.eq."${cleanNim}"`);
    } else if (cleanEmail) {
      cancelQuery = cancelQuery.ilike('booked_by_email', cleanEmail);
    } else if (cleanNim) {
      cancelQuery = cancelQuery.eq('booked_by_nim', cleanNim);
    }

    const { error } = await cancelQuery;

    if (error) {
      console.error('Error cancelling candidate booking:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Cancellation failed' };
  }
}
