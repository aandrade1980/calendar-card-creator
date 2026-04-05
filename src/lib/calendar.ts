export interface BirthdayInfo {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  end_time?: string; // HH:MM - explicitly stated end time
  additional_notes?: string;
}

/**
 * Parse end time from additional_notes if not directly extracted.
 * Looks for patterns like "ends at 20:00", "finishes at 8:00 PM", etc.
 */
export function parseEndTimeFromNotes(notes?: string): string | undefined {
  if (!notes) return undefined;

  // Match patterns like "ends at 20:00", "ends at 8:00 PM", "18:30 to 21:30 hrs", "18:30 a 21:30"
  const patterns = [
    // Match time ranges like "18:30 to 21:30", "18:30 a 21:30", "6:30 PM to 8:30 PM" - capture SECOND time
    /\d{1,2}:\d{2}(?:\s*[APap][Mm])?\s*(?:to|a|[-–—])\s*(\d{1,2}:\d{2}(?:\s*[APap][Mm])?(?:\s*(?:hrs?|hours?))?)/i,
    // Match "Time is 18:30 to 21:30 hrs" or "Time is 18:30 a 21:30 hrs"
    /time\s+is\s+\d{1,2}:\d{2}\s*(?:to|a|[-–—])\s*(\d{1,2}:\d{2}(?:\s*[APap][Mm])?(?:\s*(?:hrs?|hours?))?)/i,
    /ends?\s+at\s+(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/i,
    /finishes?\s+at\s+(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/i,
    /until\s+(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/i,
  ];

  for (const pattern of patterns) {
    const match = notes.match(pattern);
    if (match) {
      let timeStr = match[1].trim().toUpperCase();

      // Strip out "hrs", "hours", "hr", etc. that may be appended
      timeStr = timeStr.replace(/\s*(hrs?|hours?|hrs?\.?)\b/gi, '').trim();

      // Convert 12-hour to 24-hour format
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const isPM = timeStr.includes('PM');
        const [h, m] = timeStr.replace(/[APM]/gi, '').trim().split(':').map(Number);
        let hour24 = h % 12;
        if (isPM) hour24 += 12;
        return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }

      // Already in 24-hour format
      const [h, m] = timeStr.split(':').map(Number);
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }

  return undefined;
}

/**
 * Get end time: first check explicit end_time, then parse from notes
 */
export function getEndTime(info: BirthdayInfo): string | undefined {
  return info.end_time || parseEndTimeFromNotes(info.additional_notes);
}

export function generateGoogleCalendarUrl(info: BirthdayInfo): string {
  const startDate = info.date.replace(/-/g, "");
  const startTime = info.time.replace(":", "") + "00";

  // Calculate end time: use explicit end_time or parse from notes, otherwise default to +2 hours
  let endTime: string;
  const endTimeStr = getEndTime(info);
  if (endTimeStr) {
    endTime = endTimeStr.replace(":", "") + "00";
  } else {
    const [h, m] = info.time.split(":").map(Number);
    const endH = ((h + 2) % 24).toString().padStart(2, "0");
    endTime = `${endH}${m.toString().padStart(2, "0")}00`;
  }

  const dates = `${startDate}T${startTime}/${startDate}T${endTime}`;
  const title = `🎂 ${info.name}'s Birthday Party`;
  const details = info.additional_notes || `Birthday celebration for ${info.name}`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates,
    location: info.location,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateIcsFile(info: BirthdayInfo): string {
  const startDate = info.date.replace(/-/g, "");
  const startTime = info.time.replace(":", "") + "00";

  // Calculate end time: use explicit end_time or parse from notes, otherwise default to +2 hours
  let endTime: string;
  const endTimeStr = getEndTime(info);
  if (endTimeStr) {
    endTime = endTimeStr.replace(":", "") + "00";
  } else {
    const [h, m] = info.time.split(":").map(Number);
    const endH = ((h + 2) % 24).toString().padStart(2, "0");
    endTime = `${endH}${m.toString().padStart(2, "0")}00`;
  }

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${startDate}T${startTime}`,
    `DTEND:${startDate}T${endTime}`,
    `SUMMARY:🎂 ${info.name}'s Birthday Party`,
    `LOCATION:${info.location}`,
    `DESCRIPTION:${info.additional_notes || `Birthday celebration for ${info.name}`}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
