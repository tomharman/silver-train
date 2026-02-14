"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  onImageLoaded: (imageData: ImageData) => void;
}

export function ImageUpload({ onImageLoaded }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          onImageLoaded(imageData);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-12
        text-center cursor-pointer transition-colors
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        hover:border-primary hover:bg-primary/5
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Drop image here or click to upload
      </p>
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
