# Shader Playground

An interactive WebGL shader generator that creates animated gradients based on colours extracted from uploaded images.

## Features

- **Image Upload**: Drag & drop or click to upload images
- **Colour Extraction**: Uses k-means clustering to extract 5 dominant colours from images
- **Animated Shaders**: Real-time WebGL fragment shader with:
  - Fractional Brownian Motion (FBM) noise
  - Multi-octave noise layering
  - Smooth colour blending
  - Subtle shimmer effects
- **Live Controls**:
  - **Speed**: Control animation speed (0.1x - 3x)
  - **Scale**: Adjust noise pattern size
  - **Complexity**: Modulate noise detail level

## Implementation

### Components

- **page.tsx**: Main page component with state management
- **image-upload.tsx**: Drag-and-drop image upload interface
- **shader-canvas.tsx**: WebGL canvas with animation loop
- **color-palette.tsx**: Displays extracted colours
- **shader-controls.tsx**: Slider controls for shader parameters

### Utilities

- **colour-extraction.ts**: K-means clustering for colour extraction
- **webgl-utils.ts**: WebGL shader compilation and setup

### Shader Details

The fragment shader uses:
- **6 octaves** of FBM noise for organic movement
- **Multiple time offsets** for layered animation
- **Smooth colour interpolation** based on noise values
- **Complexity modulation** via power function
- **Shimmer effect** using sine waves

## How to Use

1. Navigate to `/shaders` in the app
2. Upload an image or drag & drop
3. The shader will automatically generate with extracted colours
4. Adjust the controls to fine-tune the animation
5. Upload a new image to try different colour palettes

## Technical Stack

- **Next.js 16** - React framework
- **WebGL** - Fragment shaders
- **TypeScript** - Type safety
- **Radix UI** - Slider components
- **Tailwind CSS** - Styling
