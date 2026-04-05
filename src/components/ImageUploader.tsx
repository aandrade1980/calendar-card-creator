import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
  onReset?: () => void;
}

export function ImageUploader({ onImageSelected, isProcessing, onReset }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onImageSelected(base64);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="w-full">
      <motion.div
        layout
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50"
          } ${preview ? "p-4" : "p-12 md:p-20 lg:p-24"}`}
      >
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative group overflow-hidden rounded-xl">
                <img
                  src={preview}
                  alt="Birthday invitation preview"
                  className="w-full max-h-80 object-contain rounded-xl"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="analyzing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-center gap-3 text-primary font-semibold py-2"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="animate-pulse">Analyzing invitation details…</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="actions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="group/btn text-muted-foreground hover:text-primary hover:border-primary/50 transition-all rounded-full px-6"
                        onClick={() => {
                          setPreview(null);
                          onReset?.();
                        }}
                      >
                        <motion.div
                          whileHover={{ rotate: -180 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                        </motion.div>
                        Use a different image
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.label 
              key="uploader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
                className={`h-20 w-20 md:h-28 lg:h-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner`}
              >
                {isProcessing ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <ImageIcon className="h-10 w-10" />
                )}
              </motion.div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-foreground">
                  Upload the invitation
                </p>
                <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
                  Drop it here or click to browse
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) processFile(file);
                }}
              />
            </motion.label>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
