"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { Color, PieceType } from "../../chess/types";
import { CREATURES, TRAVEL_STYLE } from "../data/creatures";
import { CreatureModel } from "./creature-models";

/**
 * One creature, and how it gets about.
 *
 * Travel is animated here rather than by a spring library: when the target
 * square changes we note where we were, then ease across over the creature's
 * own duration, adding an arc so a dolphin genuinely leaps over things and a
 * turtle barely leaves the floor. On top of that everything idles — a slow bob
 * and sway — because a creature that holds perfectly still looks dead.
 */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

interface CreatureProps {
  type: PieceType;
  team: Color;
  target: [number, number, number];
  /** Changing this is what starts a journey. */
  square: number;
  /** Phase offset so a rank of crabs doesn't bob in lockstep. */
  seed: number;
  selected: boolean;
  /** Board-wide size multiplier: the 8x8 needs everyone a little smaller. */
  sizing?: number;
  /** Set while this one is being eaten: it spins away and shrinks. */
  dying?: boolean;
}

export function Creature({
  type,
  team,
  target,
  square,
  seed,
  selected,
  sizing = 1,
  dying = false,
}: CreatureProps) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);

  const creature = CREATURES[type];
  const style = TRAVEL_STYLE[creature.travel];

  // Scratch vectors live in refs rather than useMemo: they are mutable state,
  // not memoised values, and pretending otherwise confuses both the reader and
  // the compiler.
  const from = useRef(new THREE.Vector3(...target));
  const to = useRef(new THREE.Vector3());
  const progress = useRef(1);
  const death = useRef(0);
  const firstPlacement = useRef(true);

  // A new square means a new journey.
  useEffect(() => {
    if (firstPlacement.current) {
      firstPlacement.current = false;
      return;
    }
    if (group.current) from.current.copy(group.current.position);
    progress.current = 0;
  }, [square]);

  useFrame((state, delta) => {
    const node = group.current;
    const body = inner.current;
    if (!node || !body) return;

    const t = state.clock.elapsedTime;
    const step = Math.min(delta, 0.05);

    // Recomputed here rather than during render: a ref is mutable state, and
    // writing to one while rendering is a bug waiting to happen.
    to.current.set(target[0], target[1] + creature.hover, target[2]);

    if (dying) {
      // Eaten: spiral up and away, shrinking out of existence.
      death.current = Math.min(1, death.current + step / 0.55);
      const d = death.current;
      node.position.y = to.current.y + d * 1.1;
      node.scale.setScalar(Math.max(0.001, 1 - d));
      body.rotation.y += step * 9;
      body.rotation.z = d * 1.4;
      return;
    }

    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + step / style.duration);
      const p = easeOutCubic(progress.current);
      node.position.lerpVectors(from.current, to.current, p);
      // The arc, at its highest halfway across.
      node.position.y += Math.sin(Math.PI * progress.current) * style.arc;
      if (style.spin) body.rotation.y = Math.sin(Math.PI * progress.current) * style.spin * Math.PI;
    } else {
      node.position.copy(to.current);
      if (style.spin) body.rotation.y = 0;
    }

    // Idle: everything down here is floating in a current.
    node.position.y += Math.sin(t * 1.5 + seed) * 0.035;
    body.rotation.z = Math.sin(t * 1.1 + seed * 1.7) * 0.05;
    body.rotation.x = Math.cos(t * 0.9 + seed) * 0.035;

    // Picked up: lift and grow a touch, so it's obvious which one is chosen.
    const wanted = selected ? 1.16 : 1;
    const current = node.scale.x;
    node.scale.setScalar(current + (wanted - current) * Math.min(1, step * 12));
    if (selected) node.position.y += 0.16 + Math.sin(t * 4) * 0.04;
  });

  return (
    <group ref={group} position={[target[0], target[1] + creature.hover, target[2]]}>
      {/* A blob of shadow. Far cheaper than a real shadow map and, for a board
          of cartoon animals, reads better than one. */}
      <mesh position={[0, -creature.hover + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3 * creature.scale * sizing * 1.5, 18]} />
        <meshBasicMaterial color="#062F3D" transparent opacity={0.28} />
      </mesh>

      <group
        ref={inner}
        scale={creature.scale * sizing}
        // White sits nearest the camera, so it turns to face the enemy.
        rotation={[0, team === "white" ? Math.PI : 0, 0]}
      >
        <CreatureModel type={type} team={team} />
      </group>
    </group>
  );
}
