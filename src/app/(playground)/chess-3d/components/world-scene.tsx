"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { FloraKind, SceneConfig } from "../data/scenes";

/**
 * The world around the board — reef, jungle or desert.
 *
 * All three are the same handful of tricks with different numbers: fog for
 * depth, something growing out of the ground that never stops moving, specks
 * drifting through the air, things wandering past in the distance, and light
 * from a sky you can't see. Everything is procedural, so a whole new place
 * costs one entry in data/scenes.ts and nothing else.
 */

/**
 * Something growing. A stack of tapering segments, each a child of the one
 * below, so a bend low down carries everything above it.
 *
 * The three kinds differ only in proportion and how hard they move: kelp is
 * thin and sways a lot, ferns are broader and sway less, cacti are fat, armed
 * and almost still.
 */
function Growth({
  position,
  height,
  phase,
  tint,
  kind,
  sway,
}: {
  position: [number, number, number];
  height: number;
  phase: number;
  tint: string;
  kind: FloraKind;
  sway: number;
}) {
  const segments = kind === "cactus" ? 2 : 3;
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < segments; i += 1) {
      const group = refs.current[i];
      if (!group) continue;
      const lean = Math.sin(t * 0.7 + phase + i * 0.5) * (0.06 + i * 0.045) * sway;
      group.rotation.z = lean;
      group.rotation.x = Math.cos(t * 0.5 + phase + i * 0.4) * (0.03 + i * 0.03) * sway;
    }
  });

  const segHeight = height / segments;

  const segment = (i: number): React.ReactNode => {
    if (i >= segments) return null;
    const taper = 1 - i / (segments + 1.5);
    const width = (kind === "cactus" ? 0.28 : 0.13) * taper;
    const side = i % 2 ? 1 : -1;

    return (
      <group
        ref={(el) => {
          refs.current[i] = el;
        }}
        position={[0, i === 0 ? 0 : segHeight, 0]}
      >
        {kind === "cactus" ? (
          <mesh position={[0, segHeight / 2, 0]}>
            <capsuleGeometry args={[width, segHeight, 4, 8]} />
            <meshStandardMaterial color={tint} roughness={0.9} />
          </mesh>
        ) : (
          <mesh position={[0, segHeight / 2, 0]}>
            <boxGeometry args={[width, segHeight, 0.045]} />
            <meshStandardMaterial color={tint} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* An arm on a cactus, a frond on everything else. */}
        {kind === "cactus" ? (
          i === segments - 1 ? (
            <mesh
              position={[side * width * 2.2, segHeight * 0.8, 0]}
              rotation={[0, 0, side * -0.35]}
            >
              <capsuleGeometry args={[width * 0.55, segHeight * 0.7, 4, 7]} />
              <meshStandardMaterial color={tint} roughness={0.9} />
            </mesh>
          ) : null
        ) : (
          <mesh
            position={[side * width * 1.9, segHeight * 0.58, 0]}
            rotation={[0, 0, side * -0.75]}
            scale={kind === "fern" ? [0.55, 1.7, 0.08] : [0.32, 1.5, 0.07]}
          >
            <sphereGeometry args={[width * (kind === "fern" ? 3.2 : 2.2), 7, 5]} />
            <meshStandardMaterial color={tint} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        )}

        {segment(i + 1)}
      </group>
    );
  };

  return <group position={position}>{segment(0)}</group>;
}

function Undergrowth({ radius, scene }: { radius: number; scene: SceneConfig }) {
  const stalks = useMemo(() => {
    const out: { position: [number, number, number]; height: number; phase: number; tint: string }[] =
      [];

    // Angles are measured round from +z, which is where the camera sits. The
    // wedge in front of the board is left empty on purpose: something growing
    // up through the middle of the game is the fastest way to make a beautiful
    // scene unplayable.
    const CLEAR = 1.0;
    const bands = [
      { count: 10, gap: 1.0, height: 1.5, spread: 0.55 },
      { count: 9, gap: 5.5, height: 3.0, spread: 1.5 },
    ];

    bands.forEach((band, b) => {
      const step = (Math.PI * 2 - CLEAR * 2) / band.count;
      for (let i = 0; i < band.count; i += 1) {
        const angle = CLEAR + step * (i + 0.5) + b * 0.4;
        const distance = radius + band.gap + (i % 4) * band.spread;
        out.push({
          position: [Math.sin(angle) * distance, -0.4, Math.cos(angle) * distance],
          height: band.height + (i % 5) * 0.55,
          phase: i * 1.7 + b * 2.1,
          tint: scene.floraTints[(i + b) % scene.floraTints.length],
        });
      }
    });
    return out;
  }, [radius, scene]);

  return (
    <>
      {stalks.map((stalk, i) => (
        <Growth key={i} {...stalk} kind={scene.flora} sway={scene.sway} />
      ))}
    </>
  );
}

/** Bubbles, fireflies or dust — one instanced mesh, so they cost almost nothing. */
function Motes({ radius, scene }: { radius: number; scene: SceneConfig }) {
  const count = scene.motes.count;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        z: (Math.sin(i * 78.233) * 12345.6789) % 1,
        speed: 0.35 + ((i * 7) % 10) / 14,
        size: scene.motes.size * (0.7 + ((i * 3) % 7) / 10),
        offset: (i / count) * 9,
        wobble: ((i * 5) % 10) / 10,
      })),
    [count, scene.motes.size],
  );

  useFrame(({ clock }) => {
    const instanced = mesh.current;
    if (!instanced) return;
    const t = clock.elapsedTime;
    const rise = scene.motes.rise;

    seeds.forEach((seed, i) => {
      // Bubbles race upwards; dust and fireflies hang about and bob instead.
      const climb = ((t * seed.speed * rise + seed.offset) % 9) - 1.2;
      const y =
        rise > 0.5 ? climb : 0.5 + climb * 0.4 + Math.sin(t * 0.5 + seed.wobble * 7) * 0.5;
      const x = seed.x * radius * 2.4 + Math.sin(t * 0.8 + seed.wobble * 6) * 0.18;
      const z = seed.z * radius * 2.4 + Math.cos(t * 0.6 + seed.wobble * 6) * 0.18;
      dummy.position.set(x, y, z);
      // Fireflies pulse; everything else holds its size.
      const flicker = scene.motes.glow
        ? 0.5 + Math.abs(Math.sin(t * 2 + seed.wobble * 9)) * 0.9
        : 1;
      dummy.scale.setScalar(seed.size * flicker);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });

    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      key={scene.id}
      ref={mesh}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <sphereGeometry args={[1, 8, 6]} />
      {scene.motes.glow ? (
        <meshBasicMaterial color={scene.motes.colour} transparent opacity={0.95} />
      ) : (
        <meshStandardMaterial
          color={scene.motes.colour}
          transparent
          opacity={0.38}
          roughness={0.05}
        />
      )}
    </instancedMesh>
  );
}

/** Fish, butterflies, or circling birds. */
function Wanderers({ radius, scene }: { radius: number; scene: SceneConfig }) {
  const group = useRef<THREE.Group>(null);
  const config = scene.wanderers;

  const flock = useMemo(() => {
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => ({
      radius: radius + 2.2 + (i % 4) * 1.5,
      height: config.height + ((i * 3) % 5) * 0.75,
      speed: 0.12 + ((i * 7) % 6) / 26,
      phase: (i / config.count) * Math.PI * 2,
      scale: 0.16 + ((i * 5) % 4) * 0.05,
      colour: config.colours[i % config.colours.length],
    }));
  }, [radius, config]);

  useFrame(({ clock }) => {
    const container = group.current;
    if (!container) return;
    const t = clock.elapsedTime;

    container.children.forEach((child, i) => {
      const f = flock[i];
      if (!f) return;
      const angle = t * f.speed + f.phase;
      child.position.set(
        Math.cos(angle) * f.radius,
        f.height + Math.sin(t * 0.9 + f.phase) * 0.3,
        Math.sin(angle) * f.radius,
      );
      child.rotation.y = -angle + Math.PI / 2;
    });
  });

  if (!config) return null;

  return (
    <group ref={group}>
      {flock.map((f, i) => (
        <group key={i} scale={f.scale}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.45, 1.5, 8]} />
            <meshStandardMaterial color={f.colour} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Shafts of light from above. */
function Shafts({ radius, scene }: { radius: number; scene: SceneConfig }) {
  const group = useRef<THREE.Group>(null);
  const config = scene.shafts;

  useFrame(({ clock }) => {
    const container = group.current;
    if (!container || !config) return;
    container.rotation.y = clock.elapsedTime * 0.035;
    container.children.forEach((child, i) => {
      const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      material.opacity =
        config.opacity * (0.7 + Math.abs(Math.sin(clock.elapsedTime * 0.4 + i)) * 1.0);
    });
  });

  if (!config) return null;

  return (
    <group ref={group}>
      {Array.from({ length: 3 }, (_, i) => {
        const angle = (i / 3) * Math.PI * 2 + 0.6;
        const distance = radius * 0.9 + (i % 2) * 1.6;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * distance, 8, Math.sin(angle) * distance]}
            rotation={[0.1 * Math.sin(angle), 0, 0.1 * Math.cos(angle)]}
          >
            <coneGeometry args={[0.9 + (i % 3) * 0.35, 16, 5, 1, true]} />
            <meshBasicMaterial
              color={config.colour}
              transparent
              opacity={config.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Boulders and blooms, clustered round the plinth. */
function Rockery({ radius, scene }: { radius: number; scene: SceneConfig }) {
  const rocks = useMemo(() => {
    const out: {
      position: [number, number, number];
      scale: [number, number, number];
      colour: string;
      bloom: boolean;
    }[] = [];

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2 + 0.5;
      const distance = radius * 0.82 + (i % 3) * 0.7;
      const bloom = i % 3 === 0;
      out.push({
        position: [Math.sin(angle) * distance, -0.42, Math.cos(angle) * distance],
        scale: bloom
          ? [0.5 + (i % 3) * 0.12, 0.55 + (i % 4) * 0.16, 0.09]
          : [0.5 + (i % 4) * 0.2, 0.32 + (i % 3) * 0.16, 0.55 + (i % 3) * 0.2],
        colour: bloom
          ? scene.bloomTints[i % scene.bloomTints.length]
          : scene.rockTints[i % scene.rockTints.length],
        bloom,
      });
    }
    return out;
  }, [radius, scene]);

  return (
    <>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          scale={rock.scale}
          rotation={[0, i * 1.3, rock.bloom ? 0.12 : 0]}
        >
          <sphereGeometry args={[1, rock.bloom ? 10 : 7, rock.bloom ? 8 : 5]} />
          <meshStandardMaterial
            color={rock.colour}
            roughness={0.95}
            flatShading={!rock.bloom}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

export function WorldScene({ radius, scene }: { radius: number; scene: SceneConfig }) {
  return (
    <>
      {/* The background has to be the fog colour exactly. Anything else and the
          ground stops at a visible edge instead of fading into the distance. */}
      <color attach="background" args={[scene.air]} />
      <fogExp2 attach="fog" args={[scene.air, scene.fogDensity]} />

      <ambientLight intensity={scene.ambientIntensity} color={scene.ambient} />
      <directionalLight position={[4, 12, 6]} intensity={scene.keyIntensity} color={scene.key} />
      <pointLight
        position={[-5, -1.5, -4]}
        intensity={scene.fillIntensity}
        color={scene.fill}
        distance={26}
        decay={2}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <circleGeometry args={[radius * 3.2, 48]} />
        <meshStandardMaterial color={scene.ground} roughness={1} />
      </mesh>

      <Rockery radius={radius} scene={scene} />
      <Shafts radius={radius} scene={scene} />
      <Undergrowth radius={radius} scene={scene} />
      <Wanderers radius={radius} scene={scene} />
      <Motes radius={radius} scene={scene} />
    </>
  );
}
