'use server';

import { createClient } from '@supabase/supabase-js';
import { normalizePhoneNumber } from '@/lib/interviewConstants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface PanelistPayload {
  name: string;
  department: string;
  division?: string | null;
  phone_number: string;
}

export interface SlotPayload {
  slot_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
}

/**
 * Fetch all panelists with their total and booked slot counts
 */
export async function fetchPanelists() {
  try {
    const { data: panelists, error: panelistError } = await supabaseAdmin
      .from('interview_panelists')
      .select('*')
      .order('created_at', { ascending: false });

    if (panelistError) {
      console.error('Error fetching panelists:', panelistError);
      return { success: false, data: [] };
    }

    if (!panelists || panelists.length === 0) {
      return { success: true, data: [] };
    }

    // Get slot counts for each panelist
    const { data: slots, error: slotsError } = await supabaseAdmin
      .from('interview_slots')
      .select('panelist_id, is_booked');

    const countsMap: Record<string, { total: number; booked: number }> = {};
    if (!slotsError && slots) {
      slots.forEach((s) => {
        if (!countsMap[s.panelist_id]) {
          countsMap[s.panelist_id] = { total: 0, booked: 0 };
        }
        countsMap[s.panelist_id].total += 1;
        if (s.is_booked) {
          countsMap[s.panelist_id].booked += 1;
        }
      });
    }

    const enriched = panelists.map((p) => ({
      ...p,
      total_slots: countsMap[p.id]?.total || 0,
      booked_slots: countsMap[p.id]?.booked || 0,
    }));

    return { success: true, data: enriched };
  } catch (error: any) {
    console.error('Unexpected error fetching panelists:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Create a new panelist and assign available interview slots
 */
export async function createPanelistWithSlots(
  panelist: PanelistPayload,
  slots: SlotPayload[]
) {
  try {
    // 1. Validation
    if (!panelist.name.trim()) {
      return { success: false, error: 'Panelist name is required' };
    }
    if (!panelist.department.trim()) {
      return { success: false, error: 'Department is required' };
    }

    const cleanPhone = normalizePhoneNumber(panelist.phone_number);
    if (!cleanPhone.startsWith('62') || cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Phone number must start with 62 (e.g., 628123456789) and have at least 10 digits',
      };
    }

    if (!slots || slots.length === 0) {
      return {
        success: false,
        error: 'Please select at least one available time slot for this panelist',
      };
    }

    // 2. Insert panelist
    const { data: insertedPanelist, error: panelistError } = await supabaseAdmin
      .from('interview_panelists')
      .insert({
        name: panelist.name.trim(),
        department: panelist.department.trim(),
        division: panelist.division?.trim() || null,
        phone_number: cleanPhone,
      })
      .select()
      .single();

    if (panelistError || !insertedPanelist) {
      console.error('Error creating panelist:', panelistError);
      return { success: false, error: panelistError?.message || 'Failed to create panelist' };
    }

    // 3. Insert available slots
    const slotRecords = slots.map((s) => ({
      panelist_id: insertedPanelist.id,
      slot_date: s.slot_date,
      start_time: s.start_time,
      end_time: s.end_time,
      is_booked: false,
    }));

    const { error: slotInsertError } = await supabaseAdmin
      .from('interview_slots')
      .insert(slotRecords);

    if (slotInsertError) {
      console.error('Error creating slots:', slotInsertError);
      // Clean up panelist if slot insert failed
      await supabaseAdmin.from('interview_panelists').delete().eq('id', insertedPanelist.id);
      return { success: false, error: slotInsertError.message };
    }

    return { success: true, panelistId: insertedPanelist.id };
  } catch (error: any) {
    console.error('Unexpected error creating panelist:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Fetch slots for a specific panelist (for inspection/editing)
 */
export async function fetchPanelistSlots(panelistId: string) {
  try {
    const { data: slots, error } = await supabaseAdmin
      .from('interview_slots')
      .select('*')
      .eq('panelist_id', panelistId)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      return { success: false, data: [] };
    }

    return { success: true, data: slots };
  } catch (error: any) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Update an existing panelist's profile data (name, department, division, phone)
 * and update their available slots (preserving any already-booked candidate slots).
 */
export async function updatePanelistWithSlots(
  panelistId: string,
  panelist: PanelistPayload,
  desiredSlots: SlotPayload[]
) {
  try {
    if (!panelistId) {
      return { success: false, error: 'Panelist ID is required' };
    }
    if (!panelist.name.trim()) {
      return { success: false, error: 'Panelist name is required' };
    }
    if (!panelist.department.trim()) {
      return { success: false, error: 'Department is required' };
    }

    const cleanPhone = normalizePhoneNumber(panelist.phone_number);
    if (!cleanPhone.startsWith('62') || cleanPhone.length < 10) {
      return {
        success: false,
        error: 'Phone number must start with 62 (e.g., 628123456789) and have at least 10 digits',
      };
    }

    // 1. Fetch current existing slots for this panelist
    const { data: existingSlots, error: fetchSlotsErr } = await supabaseAdmin
      .from('interview_slots')
      .select('*')
      .eq('panelist_id', panelistId);

    if (fetchSlotsErr) {
      return { success: false, error: 'Failed to fetch existing panelist slots' };
    }

    const currentSlots = existingSlots || [];
    const bookedSlots = currentSlots.filter((s) => s.is_booked);

    // If total slots requested + booked slots = 0
    if (desiredSlots.length === 0 && bookedSlots.length === 0) {
      return {
        success: false,
        error: 'Please select at least one available time slot for this panelist',
      };
    }

    // 2. Update panelist information
    const { error: panelistUpdateErr } = await supabaseAdmin
      .from('interview_panelists')
      .update({
        name: panelist.name.trim(),
        department: panelist.department.trim(),
        division: panelist.division?.trim() || null,
        phone_number: cleanPhone,
      })
      .eq('id', panelistId);

    if (panelistUpdateErr) {
      console.error('Error updating panelist:', panelistUpdateErr);
      return { success: false, error: panelistUpdateErr.message };
    }

    // 3. Reconcile slots
    // Set of keys for desired slots: "YYYY-MM-DD_HH:mm"
    const desiredKeySet = new Set(
      desiredSlots.map((s) => `${s.slot_date}_${s.start_time}`)
    );

    // Existing slot keys:
    const existingKeySet = new Set(
      currentSlots.map((s) => `${s.slot_date}_${s.start_time}`)
    );

    // Slots to DELETE: Existing unbooked slots that are NOT in desired slots
    // Note: NEVER delete booked slots!
    const slotsToDelete = currentSlots.filter(
      (s) => !s.is_booked && !desiredKeySet.has(`${s.slot_date}_${s.start_time}`)
    );

    if (slotsToDelete.length > 0) {
      const idsToDelete = slotsToDelete.map((s) => s.id);
      const { error: deleteErr } = await supabaseAdmin
        .from('interview_slots')
        .delete()
        .in('id', idsToDelete);

      if (deleteErr) {
        console.error('Error deleting unselected slots:', deleteErr);
        return { success: false, error: 'Failed to remove old slots: ' + deleteErr.message };
      }
    }

    // Slots to INSERT: Desired slots that are NOT already in current slots
    const slotsToInsert = desiredSlots.filter(
      (s) => !existingKeySet.has(`${s.slot_date}_${s.start_time}`)
    );

    if (slotsToInsert.length > 0) {
      const recordsToInsert = slotsToInsert.map((s) => ({
        panelist_id: panelistId,
        slot_date: s.slot_date,
        start_time: s.start_time,
        end_time: s.end_time,
        is_booked: false,
      }));

      const { error: insertErr } = await supabaseAdmin
        .from('interview_slots')
        .insert(recordsToInsert);

      if (insertErr) {
        console.error('Error inserting new slots:', insertErr);
        return { success: false, error: 'Failed to insert new slots: ' + insertErr.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error updating panelist:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Delete a panelist and their slots
 */
export async function deletePanelist(panelistId: string) {
  try {
    // Check if any slots are already booked
    const { data: bookedSlots } = await supabaseAdmin
      .from('interview_slots')
      .select('id')
      .eq('panelist_id', panelistId)
      .eq('is_booked', true);

    if (bookedSlots && bookedSlots.length > 0) {
      return {
        success: false,
        error: `Cannot delete panelist: ${bookedSlots.length} slot(s) are already booked by candidates. Please reassign or cancel those bookings first.`,
      };
    }

    const { error } = await supabaseAdmin
      .from('interview_panelists')
      .delete()
      .eq('id', panelistId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Fetch all booked interview appointments with candidate & panelist details
 */
export async function fetchBookedInterviews() {
  try {
    const { data: bookings, error } = await supabaseAdmin
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
        notes,
        panelist:interview_panelists (
          id,
          name,
          department,
          division,
          phone_number
        )
      `)
      .eq('is_booked', true)
      .order('slot_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching bookings:', error);
      return { success: false, data: [] };
    }

    return { success: true, data: bookings || [] };
  } catch (error: any) {
    console.error('Unexpected error fetching bookings:', error);
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Admin cancels an interview booking (releases the slot)
 */
export async function adminCancelBooking(slotId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('interview_slots')
      .update({
        is_booked: false,
        booked_by_nim: null,
        booked_by_name: null,
        booked_by_email: null,
        booked_at: null,
      })
      .eq('id', slotId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
}
