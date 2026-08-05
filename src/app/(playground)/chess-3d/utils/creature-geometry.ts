import * as THREE from "three";

import type { PieceType } from "../../chess/types";

/**
 * Creatures, built once as five merged geometries each.
 *
 * The first version of this was lovely declarative JSX — a mesh per fin, per
 * claw, per spike — and it cost about twenty draw calls per creature. Thirty-two
 * of those on the Real Chess board came to nearly nine hundred draw calls,
 * which is fine on a desktop and hopeless on the phone this is actually played
 * on.
 *
 * So each creature is now described as a list of primitives with a transform,
 * and everything sharing a colour is merged into one geometry: body, belly,
 * accent, eye-white, eye-dark. Five draw calls instead of twenty, the shapes
 * unchanged. Geometry is cached per creature type and shared by both teams —
 * only the materials differ — so a board of sixteen crabs uploads one crab.
 */

export type Slot = "body" | "belly" | "accent" | "white" | "dark";

export type CreatureGeometry = Record<Slot, THREE.BufferGeometry>;

interface Part {
  slot: Slot;
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
}

type Vec3 = [number, number, number];

function transform(
  position: Vec3 = [0, 0, 0],
  rotation: Vec3 = [0, 0, 0],
  scale: number | Vec3 = 1,
): THREE.Matrix4 {
  const s = typeof scale === "number" ? ([scale, scale, scale] as Vec3) : scale;
  return new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
    new THREE.Vector3(...s),
  );
}

/** Nests a transform inside a parent, the way a child mesh sits in a group. */
function within(parent: THREE.Matrix4, child: THREE.Matrix4): THREE.Matrix4 {
  return parent.clone().multiply(child);
}

const sphere = (radius: number, w = 12, h = 10) => new THREE.SphereGeometry(radius, w, h);
const cone = (radius: number, height: number, sides = 8) =>
  new THREE.ConeGeometry(radius, height, sides);
const capsule = (radius: number, length: number) =>
  new THREE.CapsuleGeometry(radius, length, 3, 6);
const dome = (radius: number) =>
  new THREE.SphereGeometry(radius, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);

/**
 * Concatenates geometries into one. Everything is converted to non-indexed
 * first, which sidesteps re-basing indices and costs nothing that matters —
 * the triangle count is identical and these are tiny shapes.
 */
function mergeParts(parts: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4 }[]) {
  if (parts.length === 0) return new THREE.BufferGeometry();

  const flat = parts.map(({ geometry, matrix }) => {
    const copy = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    copy.applyMatrix4(matrix);
    copy.computeVertexNormals();
    geometry.dispose();
    return copy;
  });

  const total = flat.reduce((count, g) => count + g.getAttribute("position").count, 0);
  const positions = new Float32Array(total * 3);
  const normals = new Float32Array(total * 3);

  let offset = 0;
  for (const g of flat) {
    const position = g.getAttribute("position");
    const normal = g.getAttribute("normal");
    positions.set(position.array as Float32Array, offset * 3);
    normals.set(normal.array as Float32Array, offset * 3);
    offset += position.count;
    g.dispose();
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  merged.computeBoundingSphere();
  return merged;
}

/** Both eyes, plus pupils and glints. */
function eyes(spread: number, y: number, z: number, size: number): Part[] {
  const parts: Part[] = [];
  for (const side of [-1, 1]) {
    const root = transform([side * spread, y, z]);
    parts.push({ slot: "white", geometry: sphere(size, 12, 10), matrix: root });
    parts.push({
      slot: "dark",
      geometry: sphere(size * 0.52, 10, 8),
      matrix: within(root, transform([side * size * 0.16, 0, size * 0.62])),
    });
    parts.push({
      slot: "white",
      geometry: sphere(size * 0.18, 6, 5),
      matrix: within(root, transform([side * size * 0.3, size * 0.28, size * 0.85])),
    });
  }
  return parts;
}

function crab(): Part[] {
  const parts: Part[] = [
    { slot: "body", geometry: sphere(0.42, 16, 12), matrix: transform([0, 0.26, 0], [0, 0, 0], [1, 0.62, 0.85]) },
    { slot: "belly", geometry: sphere(0.34, 12, 10), matrix: transform([0, 0.2, 0.2], [0, 0, 0], [0.8, 0.4, 0.5]) },
  ];

  for (const side of [-1, 1]) {
    const claw = transform([side * 0.42, 0.2, 0.18], [0, side * -0.5, 0]);
    parts.push({ slot: "accent", geometry: sphere(0.16, 10, 8), matrix: claw });
    parts.push({
      slot: "accent",
      geometry: cone(0.07, 0.2, 7),
      matrix: within(claw, transform([side * 0.1, 0.09, 0.06], [0, 0, side * -0.6])),
    });
    // Four legs a side became two: at this size nobody counts them, and every
    // one was a draw call.
    for (const i of [0, 1]) {
      parts.push({
        slot: "body",
        geometry: capsule(0.033, 0.2),
        matrix: transform([side * 0.34, 0.08, -0.04 - i * 0.2], [0, 0, side * 0.9]),
      });
    }
    parts.push({
      slot: "body",
      geometry: capsule(0.033, 0.14),
      matrix: transform([side * 0.15, 0.5, 0.16]),
    });
  }

  return [...parts, ...eyes(0.15, 0.6, 0.18, 0.095)];
}

function dolphin(): Part[] {
  const root = transform([0, 0.42, 0], [-0.12, 0, 0]);
  const parts: Part[] = [
    { slot: "body", geometry: sphere(0.42, 16, 12), matrix: within(root, transform([0, 0, 0], [0, 0, 0], [0.62, 0.6, 1.25])) },
    { slot: "belly", geometry: sphere(0.4, 12, 10), matrix: within(root, transform([0, -0.09, 0.06], [0, 0, 0], [0.44, 0.34, 1.0])) },
    { slot: "body", geometry: cone(0.13, 0.34, 10), matrix: within(root, transform([0, -0.04, 0.54], [Math.PI / 2, 0, 0])) },
    { slot: "accent", geometry: cone(0.13, 0.32, 4), matrix: within(root, transform([0, 0.34, -0.02], [0.5, 0, 0])) },
    { slot: "accent", geometry: cone(0.2, 0.3, 4), matrix: within(root, transform([0, 0.02, -0.56], [0, 0, Math.PI / 2], [0.35, 1, 1])) },
  ];

  for (const side of [-1, 1]) {
    parts.push({
      slot: "accent",
      geometry: cone(0.1, 0.3, 4),
      matrix: within(root, transform([side * 0.26, -0.08, 0.14], [0.2, 0, side * 1.1], [1, 0.35, 1])),
    });
  }

  return [
    ...parts,
    ...eyes(0.19, 0.1, 0.34, 0.085).map((part) => ({ ...part, matrix: within(root, part.matrix) })),
  ];
}

function seahorse(): Part[] {
  const root = transform([0, 0.1, 0]);
  const segments = [
    { y: 0.78, r: 0.2, z: 0.02 },
    { y: 0.6, r: 0.22, z: 0.0 },
    { y: 0.43, r: 0.19, z: -0.04 },
    { y: 0.28, r: 0.15, z: -0.1 },
    { y: 0.14, r: 0.1, z: -0.22 },
  ];

  const parts: Part[] = segments.map((segment, i) => ({
    slot: i < 3 ? ("body" as Slot) : ("belly" as Slot),
    geometry: sphere(segment.r, 12, 10),
    matrix: within(root, transform([0, segment.y, segment.z])),
  }));

  parts.push({
    slot: "belly",
    geometry: cone(0.07, 0.28, 8),
    matrix: within(root, transform([0, 0.76, 0.28], [Math.PI / 2, 0, 0])),
  });
  for (const x of [-0.11, 0, 0.11]) {
    parts.push({
      slot: "accent",
      geometry: cone(0.05, 0.18, 5),
      matrix: within(root, transform([x, 0.97, -0.02], [0, 0, x * 2])),
    });
  }
  parts.push({
    slot: "accent",
    geometry: cone(0.14, 0.36, 5),
    matrix: within(root, transform([0, 0.5, -0.2], [0.3, 0, 0], [0.35, 1, 1])),
  });

  return [
    ...parts,
    ...eyes(0.13, 0.82, 0.16, 0.075).map((part) => ({ ...part, matrix: within(root, part.matrix) })),
  ];
}

function turtle(): Part[] {
  const parts: Part[] = [
    // The shell is the whole turtle at a glance, so it wears the team colour.
    // It used to be the accent, which is why two players with different
    // palettes could both end up with a yellow turtle.
    { slot: "body", geometry: dome(0.46), matrix: transform([0, 0.28, 0], [0, 0, 0], [1, 0.62, 1.05]) },
    { slot: "belly", geometry: sphere(0.44, 12, 8), matrix: transform([0, 0.16, 0], [0, 0, 0], [1, 0.3, 1.05]) },
    { slot: "belly", geometry: sphere(0.19, 12, 10), matrix: transform([0, 0.24, 0.46], [0, 0, 0], [0.85, 0.8, 1]) },
  ];

  for (const i of [0, 1, 2]) {
    const angle = (i / 3) * Math.PI * 2;
    parts.push({
      slot: "accent",
      geometry: sphere(0.11, 8, 6),
      matrix: transform([Math.cos(angle) * 0.26, 0.42, Math.sin(angle) * 0.28], [0, 0, 0], [1, 0.45, 1]),
    });
  }

  for (const [side, z] of [
    [-1, 0.28],
    [1, 0.28],
    [-1, -0.26],
    [1, -0.26],
  ] as [number, number][]) {
    parts.push({
      slot: "belly",
      geometry: sphere(0.17, 8, 6),
      matrix: transform([side * 0.42, 0.12, z], [0, side * 0.5, side * 0.4], [1, 0.3, 0.7]),
    });
  }

  return [...parts, ...eyes(0.1, 0.3, 0.58, 0.065)];
}

function octopus(): Part[] {
  const parts: Part[] = [
    { slot: "body", geometry: sphere(0.38, 16, 14), matrix: transform([0, 0.56, 0], [0, 0, 0], [1, 1.12, 1]) },
  ];

  for (const i of [0, 1, 2, 3, 4]) {
    const angle = (i / 5) * Math.PI * 2;
    parts.push({
      slot: "accent",
      geometry: cone(0.05, 0.16, 5),
      matrix: transform(
        [Math.cos(angle) * 0.16, 0.98, Math.sin(angle) * 0.16],
        [Math.cos(angle) * 0.3, 0, -Math.sin(angle) * 0.3],
      ),
    });
  }

  for (let i = 0; i < 8; i += 1) {
    const arm = transform([0, 0, 0], [0, (i / 8) * Math.PI * 2, 0]);
    parts.push({
      slot: "body",
      geometry: cone(0.085, 0.46, 7),
      matrix: within(arm, transform([0, 0.16, 0.28], [0.9, 0, 0])),
    });
    parts.push({
      slot: "belly",
      geometry: sphere(0.06, 6, 5),
      matrix: within(arm, transform([0, 0.06, 0.44])),
    });
  }

  return [...parts, ...eyes(0.16, 0.62, 0.31, 0.11)];
}

function pufferfish(): Part[] {
  const root = transform([0, 0.5, 0]);
  const parts: Part[] = [
    { slot: "body", geometry: sphere(0.44, 18, 14), matrix: root },
    { slot: "belly", geometry: sphere(0.4, 12, 10), matrix: within(root, transform([0, -0.12, 0.08], [0, 0, 0], [0.9, 0.7, 0.9])) },
  ];

  // Spikes spread with the golden angle. Twelve reads as "spiky" just as well
  // as twenty-four did, for half the geometry.
  const SPIKES = 12;
  for (let i = 0; i < SPIKES; i += 1) {
    const cosPhi = 1 - ((i + 0.5) / SPIKES) * 2;
    const phi = Math.acos(cosPhi);
    const theta = i * 2.399963;
    if (Math.sin(phi) * Math.cos(theta) > 0.5 && Math.abs(cosPhi) < 0.55) continue;

    const spike = within(transform([0, 0, 0], [0, theta, 0]), transform([0, 0, 0], [phi, 0, 0]));
    parts.push({
      slot: "accent",
      geometry: cone(0.045, 0.18, 5),
      matrix: within(root, within(spike, transform([0, 0.5, 0]))),
    });
  }

  for (const i of [0, 1, 2, 3, 4]) {
    const angle = (i / 5) * Math.PI * 2;
    parts.push({
      slot: "accent",
      geometry: cone(0.055, 0.2, 5),
      matrix: within(
        root,
        transform(
          [Math.cos(angle) * 0.17, 0.5, Math.sin(angle) * 0.17],
          [Math.cos(angle) * 0.35, 0, -Math.sin(angle) * 0.35],
        ),
      ),
    });
  }

  for (const side of [-1, 1]) {
    parts.push({
      slot: "belly",
      geometry: cone(0.1, 0.26, 5),
      matrix: within(root, transform([side * 0.42, -0.04, 0.06], [0, 0, side * 0.8], [1, 0.35, 0.8])),
    });
  }

  return [
    ...parts,
    ...eyes(0.18, 0.08, 0.38, 0.11).map((part) => ({ ...part, matrix: within(root, part.matrix) })),
  ];
}

const BUILDERS: Record<PieceType, () => Part[]> = {
  pawn: crab,
  knight: dolphin,
  bishop: seahorse,
  rook: turtle,
  queen: octopus,
  king: pufferfish,
};

const cache = new Map<PieceType, CreatureGeometry>();

/** Shapes are identical for both teams, so one build serves the whole board. */
export function creatureGeometry(type: PieceType): CreatureGeometry {
  const cached = cache.get(type);
  if (cached) return cached;

  const parts = BUILDERS[type]();
  const slots: Slot[] = ["body", "belly", "accent", "white", "dark"];

  const built = {} as CreatureGeometry;
  for (const slot of slots) {
    built[slot] = mergeParts(parts.filter((part) => part.slot === slot));
  }

  cache.set(type, built);
  return built;
}

export const SLOTS: Slot[] = ["body", "belly", "accent", "white", "dark"];
