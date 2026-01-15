"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleEngine } from "./engine/particle-engine";
import { InteractionManager } from "./engine/interaction-manager";
import { ImageUpload } from "./components/image-upload";
import { ColorPicker } from "./components/color-picker";
import type { ParticleData, UIState } from "./types/particle";
import { getDefaultColorPalette, hexToPixiColor } from "./data/constants";

export default function ParticleImagePage() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ParticleEngine | null>(null);
  const interactionManagerRef = useRef<InteractionManager | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasImage, setHasImage] = useState(false);
  const [uiState, setUIState] = useState<UIState>({
    particleCount: 0,
    fps: 0,
    isAnimating: false,
  });

  // Color settings
  const [colorPalette, setColorPalette] = useState<string[]>(
    getDefaultColorPalette((theme as "light" | "dark") || "dark")
  );
  const [useImageColors, setUseImageColors] = useState(false);

  // Store particles temporarily
  const [pendingParticles, setPendingParticles] = useState<ParticleData[] | null>(null);

  // Initialize engine when container is ready
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasImage) return;

    // Only initialize once when hasImage becomes true
    if (engineRef.current) return;

    const initEngine = async () => {
      console.log("Initializing engine...");
      const engine = new ParticleEngine();
      await engine.init(container);
      console.log("Engine initialized");

      // Setup UI callback
      engine.onUIUpdate((state) => {
        setUIState(state);
      });

      engineRef.current = engine;

      // Setup interaction manager
      const canvas = engine.getCanvas();
      if (canvas) {
        const interactionManager = new InteractionManager(
          canvas,
          (x, y) => engine.onMouseMove(x, y),
          (x, y) => engine.onMouseDown(x, y),
          () => engine.onMouseUp(),
          () => engine.onDoubleClick()
        );
        interactionManagerRef.current = interactionManager;
      }

      // Load pending particles if available
      if (pendingParticles) {
        console.log("Loading", pendingParticles.length, "particles");
        engine.loadParticles(pendingParticles);

        // Apply color palette if not using image colors
        if (!useImageColors) {
          const pixiColors = colorPalette.map(hexToPixiColor);
          engine.applyColorPalette(pixiColors);
        }
        setPendingParticles(null);
      }
    };

    initEngine();

    // Cleanup
    return () => {
      if (interactionManagerRef.current) {
        interactionManagerRef.current.destroy();
        interactionManagerRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  }, [hasImage]);

  // Update theme
  useEffect(() => {
    if (engineRef.current) {
      const bgColor = theme === "dark" ? 0x0a0a0a : 0xfafafa;
      engineRef.current.setBackgroundColor(bgColor);
    }

    // Update default color palette based on theme
    if (!hasImage) {
      setColorPalette(
        getDefaultColorPalette((theme as "light" | "dark") || "dark")
      );
    }
  }, [theme, hasImage]);

  // Handle image loaded
  const handleImageLoaded = (particles: ParticleData[]) => {
    console.log("Image loaded with", particles.length, "particles");
    setPendingParticles(particles);
    setHasImage(true);
  };

  // Handle color palette change
  const handleColorChange = (newPalette: string[]) => {
    setColorPalette(newPalette);

    if (engineRef.current && !useImageColors) {
      const pixiColors = newPalette.map(hexToPixiColor);
      engineRef.current.applyColorPalette(pixiColors);
    }
  };

  // Handle use image colors toggle
  const handleUseImageColorsChange = (value: boolean) => {
    setUseImageColors(value);

    // If we have a loaded image, we need to reload it
    // For now, user will need to re-upload the image
    // TODO: Store original particle data to allow toggling
  };

  // Handle new image upload
  const handleNewImage = () => {
    setHasImage(false);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="w-32" /> {/* Spacer */}
          <h1 className="text-2xl font-semibold">Particle Image</h1>
          {hasImage && (
            <Button variant="outline" size="sm" onClick={handleNewImage}>
              <Upload className="h-4 w-4 mr-2" />
              New Image
            </Button>
          )}
          {!hasImage && <div className="w-32" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {!hasImage ? (
          <ImageUpload
            onImageLoaded={handleImageLoaded}
            useImageColors={useImageColors}
          />
        ) : (
          <>
            <div
              ref={containerRef}
              className="w-full max-w-4xl rounded-lg overflow-hidden shadow-lg bg-card"
              style={{ height: "70vh", minHeight: "400px" }}
            />

            {/* Controls */}
            <div className="w-full max-w-4xl">
              <ColorPicker
                colorPalette={colorPalette}
                useImageColors={useImageColors}
                onColorChange={handleColorChange}
                onUseImageColorsChange={handleUseImageColorsChange}
              />
            </div>

            {/* FPS Display (dev mode) */}
            {process.env.NODE_ENV === "development" && (
              <div className="fixed top-20 right-4 p-2 bg-black/50 text-white text-xs rounded font-mono">
                FPS: {uiState.fps} | Particles: {uiState.particleCount}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden file input for "New Image" button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const { ImageProcessor } = await import("./utils/image-processor");
          const processor = new ImageProcessor();
          const particles = await processor.processImage(
            file,
            30000,
            useImageColors
          );
          handleImageLoaded(particles);
        }}
      />
    </div>
  );
}
