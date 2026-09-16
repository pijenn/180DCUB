export interface DepartmentConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  divisions: string[];
}

export const BOD_BOM_DIVISION = 'BoD/BoM';

/**
 * Helper to check if a division string represents BoD/BoM
 */
export function isBodBomDivision(division?: string | null): boolean {
  if (!division) return false;
  const clean = division.trim().toLowerCase();
  return clean === 'bod/bom' || clean === 'bod / bom' || clean === 'bod-bom';
}

/**
 * Returns available sub-division options for admin panelist creation & editing.
 * Departments with sub-divisions get: [...divisions, 'BoD/BoM']
 * Departments without sub-divisions (HR, Consulting) get: ['General', 'BoD/BoM']
 */
export function getAdminDivisionsForDepartment(departmentName: string): string[] {
  const dept = DEPARTMENTS.find((d) => d.name === departmentName);
  if (!dept || dept.divisions.length === 0) {
    return ['General', BOD_BOM_DIVISION];
  }
  return [...dept.divisions, BOD_BOM_DIVISION];
}

export const DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'hr',
    name: 'Human Resource',
    shortName: 'HR',
    logo: '/logodept/hr.png',
    divisions: [], // No sub-divisions
  },
  {
    id: 'sng',
    name: 'Strategy & Growth',
    shortName: 'S&G',
    logo: '/logodept/sng.png',
    divisions: ['Product', 'Program'],
  },
  {
    id: 'mkt',
    name: 'Marketing',
    shortName: 'Marketing',
    logo: '/logodept/mkt.png',
    divisions: ['Graphic Design', 'Motion', 'Brand Communication'],
  },
  {
    id: 'lnf',
    name: 'Legal & Finance',
    shortName: 'L&F',
    logo: '/logodept/lnf.png',
    divisions: ['Legal', 'Finance'],
  },
  {
    id: 'cons',
    name: 'Consulting',
    shortName: 'Consulting',
    logo: '/logodept/cons.png',
    divisions: [], // No sub-divisions
  },
  {
    id: 'ca',
    name: 'Client Acquisition',
    shortName: 'CA',
    logo: '/logodept/ca.png',
    divisions: ['Client Relation', 'Knowledge'],
  },
];

export interface InterviewDate {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // "Thu"
  formattedLabel: string; // "17 Sep"
  fullLabel: string; // "Thursday, 17 September 2026"
}

// Interview dates: 17, 18, 21, 22, 23, 24 September 2026
export const INTERVIEW_DATES: InterviewDate[] = [
  { dateStr: '2026-09-17', dayLabel: 'Thu', formattedLabel: '17 Sep', fullLabel: 'Thursday, 17 September 2026' },
  { dateStr: '2026-09-18', dayLabel: 'Fri', formattedLabel: '18 Sep', fullLabel: 'Friday, 18 September 2026' },
  { dateStr: '2026-09-21', dayLabel: 'Mon', formattedLabel: '21 Sep', fullLabel: 'Monday, 21 September 2026' },
  { dateStr: '2026-09-22', dayLabel: 'Tue', formattedLabel: '22 Sep', fullLabel: 'Tuesday, 22 September 2026' },
  { dateStr: '2026-09-23', dayLabel: 'Wed', formattedLabel: '23 Sep', fullLabel: 'Wednesday, 23 September 2026' },
  { dateStr: '2026-09-24', dayLabel: 'Thu', formattedLabel: '24 Sep', fullLabel: 'Thursday, 24 September 2026' },
];

export interface TimeSlotConfig {
  id: string; // e.g. "08:00-09:00"
  startTime: string; // "08:00"
  endTime: string; // "09:00"
  label: string; // "08:00 - 09:00"
}

// 08:00 - 20:00 (12 one-hour slots)
export const TIME_SLOTS: TimeSlotConfig[] = [
  { id: '08:00-09:00', startTime: '08:00', endTime: '09:00', label: '08:00 - 09:00' },
  { id: '09:00-10:00', startTime: '09:00', endTime: '10:00', label: '09:00 - 10:00' },
  { id: '10:00-11:00', startTime: '10:00', endTime: '11:00', label: '10:00 - 11:00' },
  { id: '11:00-12:00', startTime: '11:00', endTime: '12:00', label: '11:00 - 12:00' },
  { id: '12:00-13:00', startTime: '12:00', endTime: '13:00', label: '12:00 - 13:00' },
  { id: '13:00-14:00', startTime: '13:00', endTime: '14:00', label: '13:00 - 14:00' },
  { id: '14:00-15:00', startTime: '14:00', endTime: '15:00', label: '14:00 - 15:00' },
  { id: '15:00-16:00', startTime: '15:00', endTime: '16:00', label: '15:00 - 16:00' },
  { id: '16:00-17:00', startTime: '16:00', endTime: '17:00', label: '16:00 - 17:00' },
  { id: '17:00-18:00', startTime: '17:00', endTime: '18:00', label: '17:00 - 18:00' },
  { id: '18:00-19:00', startTime: '18:00', endTime: '19:00', label: '18:00 - 19:00' },
  { id: '19:00-20:00', startTime: '19:00', endTime: '20:00', label: '19:00 - 20:00' },
];

/**
 * Normalizes phone numbers to standard 62XXXXXXXX format
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generates WhatsApp click-to-chat URL with pre-filled message
 */
export function generateWhatsAppLink(
  phoneNumber: string,
  panelistName: string,
  candidateName: string,
  candidateNim: string,
  department: string,
  division: string | null | undefined,
  dateLabel: string,
  timeSlot: string
): string {
  const cleanPhone = normalizePhoneNumber(phoneNumber);
  const deptDivision = division ? `${department} - ${division}` : department;
  const message = `Hello ${panelistName},\n\nI am *${candidateName}* (NIM: *${candidateNim}*) for *${deptDivision}*. I have confirmed my interview schedule on *${dateLabel}* at *${timeSlot}*.\n\nLooking forward to speaking with you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
