"use client";

import { useCallback, useRef, useState, type ChangeEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ParticleData } from "../types/particle";

interface ImageUploadProps {
  onImageLoaded: (particles: ParticleData[]) => void;
  useImageColors: boolean;
}

export function ImageUpload({
  onImageLoaded,
  useImageColors,
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large. Please use an image under 5MB");
      return;
    }

    // Clear previous errors
    setError(null);
    setIsProcessing(true);

    try {
      const { ImageProcessor } = await import("../utils/image-processor");
      const processor = new ImageProcessor();
      const particleData = await processor.processImage(
        file,
        30000,
        useImageColors
      );

      if (particleData.length === 0) {
        setError("Image has no visible pixels. Try a different image.");
        return;
      }

      onImageLoaded(particleData);
    } catch (err) {
      console.error("Image processing failed:", err);
      setError("Failed to process image. Please try another.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      await processFile(file);
    },
    [useImageColors]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      await processFile(file);
    },
    [useImageColors]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div
        className={cn(
          "w-full max-w-md p-12 border-2 border-dashed rounded-lg",
          "transition-colors duration-200 cursor-pointer",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Upload className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold mb-1">Drop an image here</p>
            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Choose Image
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing image...
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm max-w-md">
          {error}
        </div>
      )}
    </div>
  );
}
