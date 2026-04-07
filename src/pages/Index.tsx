import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/ImageUploader";
import { BirthdayResult } from "@/components/BirthdayResult";
import { BirthdayInfo } from "@/lib/calendar";
import { PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

async function compressImage(base64: string, maxWidth = 900, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = base64;
  });
}

export default function Index() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<BirthdayInfo | null>(null);
  const lastRequestRef = useRef<number>(0); // ✅ cooldown tracker

  const handleImageSelected = async (base64: string) => {
    // ✅ Cooldown check
    const elapsed = Date.now() - lastRequestRef.current;
    if (elapsed < 5000) {
      toast.warning("Please wait a moment before scanning another image.");
      return;
    }
    lastRequestRef.current = Date.now();

    setIsProcessing(true);
    setResult(null);

    try {
      const compressed = await compressImage(base64);

      const { data, error } = await supabase.functions.invoke("extract-birthday", {
        body: { imageBase64: compressed },
      });

      // ✅ Handle rate limit explicitly
      if (error?.status === 429) {
        toast.error("The service is busy, please try again in a minute.");
        return;
      }

      if (error) throw error;

      if (data?.success && data?.data) {
        setResult(data.data);
        toast.success("Birthday details extracted!");

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
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
        <header className="text-center mb-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <PartyPopper className="h-4 w-4" />
            Birthday Invite Scanner
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100, damping: 15 }}
            className="text-4xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight"
          >
            Scan it. <span className="text-primary">Save it.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-4 text-muted-foreground text-lg max-w-md mx-auto"
          >
            Upload a birthday invitation image and we'll extract the details and add it to your calendar.
          </motion.p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="space-y-8"
        >
          <ImageUploader onImageSelected={handleImageSelected} isProcessing={isProcessing} onReset={() => setResult(null)} />
          {result && <BirthdayResult info={result} />}
        </motion.div>
      </div>
    </div>
  );
}