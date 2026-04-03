import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/ImageUploader";
import { BirthdayResult } from "@/components/BirthdayResult";
import { BirthdayInfo } from "@/lib/calendar";
import { PartyPopper } from "lucide-react";

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BirthdayInfo | null>(null);

  const handleImageSelected = async (base64: string) => {
    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("extract-birthday", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setResult(data.data);
        toast.success("Birthday details extracted!");
      } else {
        toast.error(data?.error || "Could not extract birthday info from this image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <header className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <PartyPopper className="h-4 w-4" />
            Birthday Invite Scanner
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight">
            Scan it. Save it.
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
            Upload a birthday invitation image and we'll extract the details and add it to your calendar.
          </p>
        </header>

        <div className="space-y-8">
          <ImageUploader onImageSelected={handleImageSelected} isProcessing={isProcessing} />
          {result && <BirthdayResult info={result} />}
        </div>
      </div>
    </div>
  );
}
