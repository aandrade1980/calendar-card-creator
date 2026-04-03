import { CalendarPlus, MapPin, Clock, User, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BirthdayInfo, generateGoogleCalendarUrl, generateIcsFile } from "@/lib/calendar";

interface BirthdayResultProps {
  info: BirthdayInfo;
}

export function BirthdayResult({ info }: BirthdayResultProps) {
  const googleUrl = generateGoogleCalendarUrl(info);

  const handleDownloadIcs = () => {
    const ics = generateIcsFile(info);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${info.name}-birthday.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-card">
      <div className="h-2 bg-gradient-to-r from-primary via-secondary to-celebration" />
      <CardContent className="p-6 space-y-5">
        <h2 className="text-2xl font-bold text-foreground">
          🎂 {info.name}'s Birthday
        </h2>

        <div className="grid gap-3">
          <InfoRow icon={<User className="h-4 w-4" />} label="Who" value={info.name} />
          <InfoRow icon={<CalendarPlus className="h-4 w-4" />} label="Date" value={formatDate(info.date)} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Time" value={formatTime(info.time)} />
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Where" value={info.location} />
          {info.additional_notes && (
            <InfoRow icon={<FileText className="h-4 w-4" />} label="Notes" value={info.additional_notes} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1" size="lg">
            <a href={googleUrl} target="_blank" rel="noopener noreferrer">
              <CalendarPlus className="h-5 w-5 mr-2" />
              Add to Google Calendar
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownloadIcs}
            className="flex-1"
          >
            <Download className="h-5 w-5 mr-2" />
            Download .ics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
