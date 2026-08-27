"use client";

import type {} from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import type { PieceType } from "../../chess/types";
import type { Palette } from "../data/palettes";
import { creatureGeometry, SLOTS, type Slot } from "../utils/creature-geometry";

/**
 * A creature, as five meshes.
 *
 * The shapes live in utils/creature-geometry, merged by colour; this just picks
 * the right materials for the team and hangs them on the shared geometry. Both
 * are cached, so a board with sixteen crabs on it uploads one crab's worth of
 * vertices and one set of materials.
 */

// Keyed by palette rather than by side, so the same colour picked by either
// player reuses one material.
const materials = new Map<string, THREE.MeshStandardMaterial>();

function materialFor(palette: Palette, slot: Slot): THREE.MeshStandardMaterial {
  const key = `${palette.id}:${slot}`;
  const existing = materials.get(key);
  if (existing) return existing;

  const colour =
    slot === "body"
      ? palette.body
      : slot === "belly"
        ? palette.belly
        : slot === "accent"
          ? palette.accent
          : slot === "white"
            ? "#FFFFFF"
            : palette.eye;

  const material = new THREE.MeshStandardMaterial({
    color: colour,
    roughness: slot === "white" || slot === "dark" ? 0.18 : 0.55,
    metalness: 0.02,
  });

  materials.set(key, material);
  return material;
}

export function CreatureModel({ type, palette }: { type: PieceType; palette: Palette }) {
  const geometry = useMemo(() => creatureGeometry(type), [type]);

  return (
    <group>
      {SLOTS.map((slot) => (
        <mesh key={slot} geometry={geometry[slot]} material={materialFor(palette, slot)} />
      ))}
    </group>
  );
}
