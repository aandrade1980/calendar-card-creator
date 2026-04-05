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

  const patterns = [
    // 1. Explicit ranges: "18:30 a 21:30", "18:30 to 21:30", "6:30 PM - 9:30 PM"
    // Capture group 2 is always the end time
    /(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)\s*(?:to|a|until|through|[-–—])\s*(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)(?:\s*(?:hrs?|hours?|hr\.?))?/i,
    
    // 2. Explicit end phrases: "ends at 21:30", "finishes at 9:00 PM"
    // Capture group 1 is the end time
    /(?:ends?|finishes?|until)\s+(?:at\s+)?(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/i,
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = notes.match(patterns[i]);
    if (match) {
      // If it's the range pattern (index 0), end time is in group 2.
      // If it's the phrase pattern (index 1), end time is in group 1.
      const rawTime = i === 0 ? match[2] : match[1];
      let timeStr = rawTime.trim().toUpperCase();

      // Clean up suffixes
      timeStr = timeStr.replace(/\s*(hrs?|hours?|hr\.?)\b/gi, '').trim();

      // 12h -> 24h
      if (timeStr.includes('AM') || timeStr.includes('PM')) {
        const isPM = timeStr.includes('PM');
        const [h, m] = timeStr.replace(/[APM]/gi, '').trim().split(':').map(Number);
        let hour24 = h % 12;
        if (isPM) hour24 += 12;
        return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }

      // Already 24h
      const [h, m] = timeStr.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }
  }

  return undefined;
}

/**
 * Get end time: first check explicit end_time, then parse from notes, then try parsing from time itself
 */
export function getEndTime(info: BirthdayInfo): string | undefined {
  return info.end_time || parseEndTimeFromNotes(info.additional_notes) || parseEndTimeFromNotes(info.time);
}

/**
 * Parse start time from the time field.
 * If it's a range like "18:30 to 21:30", it returns the first time "18:30".
 */
export function parseStartTime(timeStr: string): string {
  // Specifically look for the FIRST time pattern in the string
  const match = timeStr.match(/(\d{1,2}:\d{2}(?:\s*[APap][Mm])?)/);
  if (match) {
    let time = match[1].trim().toUpperCase();
    if (time.includes('AM') || time.includes('PM')) {
      const isPM = time.includes('PM');
      const [h, m] = time.replace(/[APM]/gi, '').trim().split(':').map(Number);
      let hour24 = h % 12;
      if (isPM) hour24 += 12;
      return `${hour24.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
    const [h, m] = time.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
  }
  // Fallback to original if no match, though we hope for HH:MM
  return timeStr.split(/\s+/)[0].replace(/[^0-9:]/g, '');
}

export function generateGoogleCalendarUrl(info: BirthdayInfo): string {
  const cleanStartTime = parseStartTime(info.time);
  const startDate = info.date.replace(/-/g, "");
  const startTime = cleanStartTime.replace(":", "") + "00";

  // Calculate end time: use explicit end_time or parse from notes, otherwise default to +2 hours
  let endTime: string;
  const endTimeStr = getEndTime(info);
  if (endTimeStr) {
    endTime = endTimeStr.replace(":", "") + "00";
  } else {
    const [h, m] = cleanStartTime.split(":").map(Number);
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
  const cleanStartTime = parseStartTime(info.time);
  const startDate = info.date.replace(/-/g, "");
  const startTime = cleanStartTime.replace(":", "") + "00";

  // Calculate end time: use explicit end_time or parse from notes, otherwise default to +2 hours
  let endTime: string;
  const endTimeStr = getEndTime(info);
  if (endTimeStr) {
    endTime = endTimeStr.replace(":", "") + "00";
  } else {
    const [h, m] = cleanStartTime.split(":").map(Number);
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
