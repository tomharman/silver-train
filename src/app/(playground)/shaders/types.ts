/**
 * Type definitions for shader playground
 */

export enum EffectMode {
  GradientFlow = 'gradient',
  InfinityMirror = 'mirror',
  Kaleidoscope = 'kaleidoscope',
  Combined = 'combined', // Kaleidoscope + Mirror
}

export enum ShapeType {
  Rectangle = 'rectangle',
  Circle = 'circle',
  Triangle = 'triangle',
  Hexagon = 'hexagon',
}

export type GradientStop = {
  id: string;  // Unique identifier for React keys
  position: number;  // 0.0 to 1.0
  color: [number, number, number];  // RGB 0-1
  hardEdge: boolean;  // sharp vs smooth transition
};

export interface ShapeParams {
  layerCount: number;  // 5-50
  type: ShapeType;
  spacing: number;  // 0.5-5.0
  sizeScale: number;  // 0.8-0.98 - how much smaller each layer is
  cornerRadius: number;  // 0-0.5 - for rectangles
  rotation: number;  // -180 to 180 degrees
  rotationPerLayer: number;  // 0-45 degrees - cumulative
}

export interface KaleidoscopeParams {
  segments: number;  // 3-24
  mirrorX: boolean;
  mirrorY: boolean;
  rotation: number;  // -180 to 180 degrees
  centerOffsetX: number;  // -1.0 to 1.0
  centerOffsetY: number;  // -1.0 to 1.0
}

export interface AnimationParams {
  speed: number;  // 0.1-3.0x
  pulseIntensity: number;  // 0-1.0
  reverse: boolean;
  timeOffset: number;  // 0-10.0
  scaleAnimation: boolean;  // breathe/pulse overall scale
}

export interface ColorEnhancement {
  luminosity: number;  // 1.0-2.0
  saturation: number;  // 0.5-2.0
  autoExtract: boolean;  // auto-extract from uploaded image
}

export interface ShaderConfig {
  effectMode: EffectMode;
  gradient: {
    stops: GradientStop[];
  };
  shape: ShapeParams;
  kaleidoscope: KaleidoscopeParams;
  animation: AnimationParams;
  enhancement: ColorEnhancement;
}

// Default values
export const DEFAULT_GRADIENT_STOPS: GradientStop[] = [
  {
    id: 'stop-0',
    position: 0.0,
    color: [0.4, 0.43, 0.92],  // Purple-blue
    hardEdge: false,
  },
  {
    id: 'stop-1',
    position: 0.25,
    color: [0.46, 0.29, 0.64],  // Deep purple
    hardEdge: false,
  },
  {
    id: 'stop-2',
    position: 0.5,
    color: [0.2, 0.2, 0.3],  // Dark grey-blue
    hardEdge: false,
  },
  {
    id: 'stop-3',
    position: 0.75,
    color: [0.8, 0.5, 0.9],  // Light purple
    hardEdge: false,
  },
  {
    id: 'stop-4',
    position: 1.0,
    color: [0.1, 0.1, 0.2],  // Very dark blue
    hardEdge: false,
  },
];

export const DEFAULT_SHAPE_PARAMS: ShapeParams = {
  layerCount: 20,
  type: ShapeType.Rectangle,
  spacing: 1.5,
  sizeScale: 0.92,
  cornerRadius: 0.1,
  rotation: 0,
  rotationPerLayer: 5,
};

export const DEFAULT_KALEIDOSCOPE_PARAMS: KaleidoscopeParams = {
  segments: 8,
  mirrorX: false,
  mirrorY: true,
  rotation: 0,
  centerOffsetX: 0,
  centerOffsetY: 0,
};

export const DEFAULT_ANIMATION_PARAMS: AnimationParams = {
  speed: 1.0,
  pulseIntensity: 0.0,
  reverse: false,
  timeOffset: 0,
  scaleAnimation: false,
};

export const DEFAULT_COLOR_ENHANCEMENT: ColorEnhancement = {
  luminosity: 1.3,
  saturation: 1.1,
  autoExtract: true,
};

export const DEFAULT_SHADER_CONFIG: ShaderConfig = {
  effectMode: EffectMode.GradientFlow,
  gradient: {
    stops: DEFAULT_GRADIENT_STOPS,
  },
  shape: DEFAULT_SHAPE_PARAMS,
  kaleidoscope: DEFAULT_KALEIDOSCOPE_PARAMS,
  animation: DEFAULT_ANIMATION_PARAMS,
  enhancement: DEFAULT_COLOR_ENHANCEMENT,
};
