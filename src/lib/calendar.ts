export interface BirthdayInfo {
  name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  additional_notes?: string;
}

export function generateGoogleCalendarUrl(info: BirthdayInfo): string {
  const startDate = info.date.replace(/-/g, "");
  const startTime = info.time.replace(":", "") + "00";
  // Assume 2 hour event
  const [h, m] = info.time.split(":").map(Number);
  const endH = ((h + 2) % 24).toString().padStart(2, "0");
  const endTime = `${endH}${m.toString().padStart(2, "0")}00`;

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
  const [h, m] = info.time.split(":").map(Number);
  const endH = ((h + 2) % 24).toString().padStart(2, "0");
  const endTime = `${endH}${m.toString().padStart(2, "0")}00`;

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
