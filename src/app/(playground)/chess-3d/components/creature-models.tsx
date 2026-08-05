"use client";

import type {} from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import type { Color, PieceType } from "../../chess/types";
import { TEAMS } from "../data/creatures";
import { creatureGeometry, SLOTS, type Slot } from "../utils/creature-geometry";

/**
 * A creature, as five meshes.
 *
 * The shapes live in utils/creature-geometry, merged by colour; this just picks
 * the right materials for the team and hangs them on the shared geometry. Both
 * are cached, so a board with sixteen crabs on it uploads one crab's worth of
 * vertices and one set of materials.
 */

const materials = new Map<string, THREE.MeshStandardMaterial>();

function materialFor(team: Color, slot: Slot): THREE.MeshStandardMaterial {
  const key = `${team}:${slot}`;
  const existing = materials.get(key);
  if (existing) return existing;

  const colours = TEAMS[team];
  const colour =
    slot === "body"
      ? colours.body
      : slot === "belly"
        ? colours.belly
        : slot === "accent"
          ? colours.accent
          : slot === "white"
            ? "#FFFFFF"
            : colours.eye;

  const material = new THREE.MeshStandardMaterial({
    color: colour,
    roughness: slot === "white" || slot === "dark" ? 0.18 : 0.55,
    metalness: 0.02,
  });

  materials.set(key, material);
  return material;
}

export function CreatureModel({ type, team }: { type: PieceType; team: Color }) {
  const geometry = useMemo(() => creatureGeometry(type), [type]);

  return (
    <group>
      {SLOTS.map((slot) => (
        <mesh key={slot} geometry={geometry[slot]} material={materialFor(team, slot)} />
      ))}
    </group>
  );
}
