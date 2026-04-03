import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageSelected, isProcessing }: ImageUploaderProps) {
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
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50"
        } ${preview ? "p-4" : "p-12"}`}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Birthday invitation preview"
              className="w-full max-h-80 object-contain rounded-xl"
            />
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Extracting birthday details…</span>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center gap-4 cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              {isProcessing ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <ImageIcon className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                Drop your birthday invite here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse • PNG, JPG, WEBP
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
          </label>
        )}
      </div>
      {preview && !isProcessing && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-muted-foreground"
          onClick={() => setPreview(null)}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload a different image
        </Button>
      )}
    </div>
  );
}
