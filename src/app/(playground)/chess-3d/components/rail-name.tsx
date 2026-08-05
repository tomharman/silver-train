"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Whose side is whose, written onto the board itself.
 *
 * A card floating over the scene told you the same thing, but it sat outside
 * the world and took up room that the board wanted. Painting the name into the
 * rail each player sits behind is both clearer and one less panel: you look at
 * the end of the board you're playing from and your name is there.
 *
 * The text is drawn into a canvas and used as a texture rather than going
 * through a 3D text library. That avoids shipping a font file and a mesh-
 * generating dependency for what is, in the end, eight characters — and it
 * means the label can use the same Geist Mono the rest of the app is set in,
 * by asking the document which family that actually resolved to.
 */

const WIDTH = 512;
const HEIGHT = 96;

/**
 * next/font generates a family name at build time and hangs it off a CSS
 * variable, so the only way to name it in a canvas is to ask the document.
 */
function monoFamily(): string {
  if (typeof window === "undefined") return "monospace";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-geist-mono")
    .trim();
  return value ? `${value}, ui-monospace, monospace` : "ui-monospace, SFMono-Regular, monospace";
}

function drawLabel(text: string, colour: string): THREE.CanvasTexture | null {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.font = `700 60px ${monoFamily()}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.letterSpacing = "6px";

  const label = text.toUpperCase().slice(0, 14);

  // A dark halo, so the name holds up over a pale rail as well as a dark one.
  context.lineWidth = 8;
  context.strokeStyle = "rgba(0,0,0,0.45)";
  context.strokeText(label, WIDTH / 2, HEIGHT / 2);

  context.fillStyle = colour;
  context.fillText(label, WIDTH / 2, HEIGHT / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

interface RailNameProps {
  name: string;
  colour: string;
  /** Distance from the middle of the board to the rail. */
  depth: number;
  /**
   * +1 is the near rail. White's home rank is at positive z — the camera sits
   * on that side — so the player nearest you is +1, not -1.
   */
  side: 1 | -1;
  active: boolean;
  width: number;
}

export function RailName({ name, colour, depth, side, active, width }: RailNameProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const label = useRef<THREE.Mesh>(null);
  const marker = useRef<THREE.Group>(null);

  // Waiting for fonts means the label is drawn in Geist Mono rather than in
  // whatever the fallback happened to be at first paint.
  useEffect(() => {
    let live = true;
    const draw = () => {
      if (!live) return;
      const next = drawLabel(name, colour);
      setTexture((previous) => {
        previous?.dispose();
        return next;
      });
    };

    if (document.fonts?.status === "loaded") draw();
    else void document.fonts?.ready.then(draw).catch(draw);

    return () => {
      live = false;
    };
  }, [name, colour]);

  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (label.current) {
      const material = label.current.material as THREE.MeshBasicMaterial;
      // The waiting player's name sits back; yours comes forward.
      const wanted = active ? 1 : 0.58;
      material.opacity += (wanted - material.opacity) * 0.1;
    }
    if (marker.current) {
      marker.current.visible = active;
      marker.current.position.y = 0.34 + Math.sin(t * 2.6) * 0.07;
      marker.current.rotation.y = t * 1.4;
    }
  });

  const size = useMemo(() => Math.min(width * 0.68, 3.8), [width]);

  return (
    <group position={[0, 0, side * depth]}>
      {/*
        A -90° turn about X lays the plane flat with its face up, its left-to-
        right still along +x and its "up" pointing away from the camera — which
        is exactly how you read text lying on a table in front of you. No
        further rotation, on either rail: both are read from the same seat.
      */}
      <mesh ref={label} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[size, size * (HEIGHT / WIDTH)]} />
        {texture && (
          <meshBasicMaterial map={texture} transparent opacity={0.4} depthWrite={false} />
        )}
      </mesh>

      {/* A little spinning marker beside your name when it's your go. */}
      <group ref={marker} position={[side * size * 0.62, 0.34, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.13, 0.24, 4]} />
          <meshStandardMaterial
            color={colour}
            emissive={colour}
            emissiveIntensity={0.55}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}
