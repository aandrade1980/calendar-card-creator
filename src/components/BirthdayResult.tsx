import { CalendarPlus, MapPin, Clock, User, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BirthdayInfo, generateGoogleCalendarUrl, generateIcsFile, getEndTime } from "@/lib/calendar";
import { motion } from "framer-motion";

interface BirthdayResultProps {
  info: BirthdayInfo;
}

const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

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

  const formatTimeRange = (info: BirthdayInfo) => {
    const [h, m] = info.time.split(":").map(Number);
    const startAmpm = h >= 12 ? "PM" : "AM";
    const startHour12 = h % 12 || 12;

    let endH: number, endAmpm: string, endHour12: number;
    const effectiveEndTime = getEndTime(info);
    if (effectiveEndTime) {
      const [endHour, endMin] = effectiveEndTime.split(":").map(Number);
      endH = endHour;
      endAmpm = endH >= 12 ? "PM" : "AM";
      endHour12 = endH % 12 || 12;
      return `${startHour12}:${m.toString().padStart(2, "0")} ${startAmpm} - ${endHour12}:${endMin.toString().padStart(2, "0")} ${endAmpm}`;
    }

    // Default to +2 hours if no end time
    endH = (h + 2) % 24;
    endAmpm = endH >= 12 ? "PM" : "AM";
    endHour12 = endH % 12 || 12;
    return `${startHour12}:${m.toString().padStart(2, "0")} ${startAmpm} - ${endHour12}:${m.toString().padStart(2, "0")} ${endAmpm}`;
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full"
    >
      <Card className="overflow-hidden border-0 shadow-xl bg-card">
        <div className="h-2 bg-gradient-to-r from-primary via-secondary to-celebration" />
        <CardContent className="p-6 space-y-6">
          <motion.h2 
            variants={item}
            className="text-2xl font-bold text-foreground"
          >
            🎂 {info.name}'s Birthday
          </motion.h2>

          <div className="grid gap-1">
            <InfoRow icon={<User className="h-4 w-4" />} label="Who" value={info.name} />
            <InfoRow icon={<CalendarPlus className="h-4 w-4" />} label="Date" value={formatDate(info.date)} />
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Time" value={formatTimeRange(info)} />
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Where" value={info.location} />
            {info.additional_notes && (
              <InfoRow icon={<FileText className="h-4 w-4" />} label="Notes" value={info.additional_notes} />
            )}
          </div>

          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <Button 
              asChild 
              className="flex-1 py-6 text-base sm:py-0 sm:text-sm h-14 sm:h-11 transition-transform active:scale-95" 
              size="lg"
            >
              <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                <CalendarPlus className="h-5 w-5 mr-2" />
                Add to Google Calendar
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleDownloadIcs}
              className="flex-1 py-6 text-base sm:py-0 sm:text-sm h-14 sm:h-11 transition-transform active:scale-95"
            >
              <Download className="h-5 w-5 mr-2" />
              Download .ics
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div 
      variants={item}
      className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0 hover:bg-primary/5 transition-colors rounded-lg px-2 -mx-2"
    >
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-foreground font-semibold leading-tight mt-0.5">{value}</p>
      </div>
    </motion.div>
  );
}
