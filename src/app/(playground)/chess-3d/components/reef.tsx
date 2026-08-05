"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The Sunken Jungle.
 *
 * Everything here is procedural — no models, no textures, nothing to download.
 * The look comes from four cheap tricks stacked on top of each other: heavy
 * blue-green fog for depth, shafts of light from a surface you can't see, kelp
 * that never stops moving, and a steady drift of bubbles. Together they make
 * the board feel like it is sitting somewhere, which is the whole point.
 */

export const WATER = "#0E5A70";
export const WATER_DEEP = "#062F3D";

/** Kelp: a stack of tapering segments that bends more the higher it gets. */
function Kelp({
  position,
  height,
  phase,
  tint,
}: {
  position: [number, number, number];
  height: number;
  phase: number;
  tint: string;
}) {
  const segments = 3;
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < segments; i += 1) {
      const group = refs.current[i];
      if (!group) continue;
      // Each segment leans a little further than the one below it, so the whole
      // frond curves rather than pivoting like a stick.
      const lean = Math.sin(t * 0.7 + phase + i * 0.5) * (0.06 + i * 0.045);
      group.rotation.z = lean;
      group.rotation.x = Math.cos(t * 0.5 + phase + i * 0.4) * (0.03 + i * 0.03);
    }
  });

  const segHeight = height / segments;

  // Each segment contains the next one, so a bend low down carries everything
  // above it. Written as recursion rather than a loop that reassigns a variable
  // holding JSX, which is a shape the React compiler cannot follow.
  const segment = (i: number): React.ReactNode => {
    if (i >= segments) return null;
    const width = 0.13 * (1 - i / (segments + 1.5));
    const side = i % 2 ? 1 : -1;

    return (
      <group
        ref={(el) => {
          refs.current[i] = el;
        }}
        position={[0, i === 0 ? 0 : segHeight, 0]}
      >
        <mesh position={[0, segHeight / 2, 0]}>
          <boxGeometry args={[width, segHeight, 0.045]} />
          <meshStandardMaterial color={tint} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        {/* One blade per segment, alternating sides as you go up. */}
        <mesh
          position={[side * width * 1.9, segHeight * 0.58, 0]}
          rotation={[0, 0, side * -0.75]}
          scale={[0.32, 1.5, 0.07]}
        >
          <sphereGeometry args={[width * 2.2, 7, 5]} />
          <meshStandardMaterial color={tint} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
        {segment(i + 1)}
      </group>
    );
  };

  return <group position={position}>{segment(0)}</group>;
}

function KelpForest({ radius }: { radius: number }) {
  const stalks = useMemo(() => {
    const out: { position: [number, number, number]; height: number; phase: number; tint: string }[] =
      [];
    const tints = ["#2E7D4F", "#3F9A5C", "#246B45", "#57B36A"];
    // Angles are measured round from +z, which is where the camera sits. The
    // wedge in front of the board is left empty on purpose: a frond growing up
    // through the middle of the game is the fastest way to make a beautiful
    // scene unplayable.
    const CLEAR = 1.0; // radians either side of the camera to keep bare
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
          tint: tints[(i + b) % tints.length],
        });
      }
    });
    return out;
  }, [radius]);

  return (
    <>
      {stalks.map((stalk, i) => (
        <Kelp key={i} {...stalk} />
      ))}
    </>
  );
}

/** Bubbles, as one instanced mesh so seventy of them cost almost nothing. */
function Bubbles({ radius }: { radius: number }) {
  const COUNT = 70;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: (Math.sin(i * 12.9898) * 43758.5453) % 1,
        z: (Math.sin(i * 78.233) * 12345.6789) % 1,
        speed: 0.35 + ((i * 7) % 10) / 14,
        size: 0.022 + ((i * 3) % 7) / 160,
        offset: (i / COUNT) * 9,
        wobble: ((i * 5) % 10) / 10,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const instanced = mesh.current;
    if (!instanced) return;
    const t = clock.elapsedTime;

    seeds.forEach((seed, i) => {
      const y = ((t * seed.speed + seed.offset) % 9) - 1.2;
      const x = seed.x * radius * 2.4 + Math.sin(t * 0.8 + seed.wobble * 6) * 0.18;
      const z = seed.z * radius * 2.4 + Math.cos(t * 0.6 + seed.wobble * 6) * 0.18;
      dummy.position.set(x, y, z);
      // Bubbles swell very slightly as they rise.
      const grow = seed.size * (1 + y * 0.03);
      dummy.scale.setScalar(grow);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });

    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshStandardMaterial
        color="#DFF6FF"
        transparent
        opacity={0.38}
        roughness={0.05}
        metalness={0}
      />
    </instancedMesh>
  );
}

/** Little fish that loop round the board, well back in the fog. */
function Shoal({ radius }: { radius: number }) {
  const group = useRef<THREE.Group>(null);
  const fish = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        radius: radius + 2.2 + (i % 4) * 1.5,
        height: 0.9 + ((i * 3) % 5) * 0.75,
        speed: 0.12 + ((i * 7) % 6) / 26,
        phase: (i / 6) * Math.PI * 2,
        scale: 0.16 + ((i * 5) % 4) * 0.05,
        colour: ["#FFC84A", "#FF8E6E", "#7BE0D6", "#F0F4A0"][i % 4],
      })),
    [radius],
  );

  useFrame(({ clock }) => {
    const container = group.current;
    if (!container) return;
    const t = clock.elapsedTime;

    container.children.forEach((child, i) => {
      const f = fish[i];
      const angle = t * f.speed + f.phase;
      child.position.set(
        Math.cos(angle) * f.radius,
        f.height + Math.sin(t * 0.9 + f.phase) * 0.3,
        Math.sin(angle) * f.radius,
      );
      // Point along the direction of travel.
      child.rotation.y = -angle + Math.PI / 2;
    });
  });

  return (
    <group ref={group}>
      {fish.map((f, i) => (
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

/** Shafts of sunlight from a surface somewhere far above. */
function SunShafts({ radius }: { radius: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const container = group.current;
    if (!container) return;
    container.rotation.y = clock.elapsedTime * 0.035;
    container.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const material = mesh.material as THREE.MeshBasicMaterial;
      // Breathe, so the water looks like it's moving above you.
      material.opacity = 0.022 + Math.abs(Math.sin(clock.elapsedTime * 0.4 + i)) * 0.03;
    });
  });

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
              color="#BFF6E8"
              transparent
              opacity={0.07}
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

/** Boulders and fan coral clustered round the plinth. */
function Rockery({ radius }: { radius: number }) {
  const rocks = useMemo(() => {
    const out: {
      position: [number, number, number];
      scale: [number, number, number];
      colour: string;
      fan: boolean;
    }[] = [];
    const stone = ["#4C6B6E", "#3E5A61", "#5B7A72"];
    const coral = ["#FF7E6B", "#FFA45C", "#E2668E", "#FFD277"];

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2 + 0.5;
      const distance = radius * 0.82 + (i % 3) * 0.7;
      const fan = i % 3 === 0;
      out.push({
        position: [Math.sin(angle) * distance, -0.42, Math.cos(angle) * distance],
        scale: fan
          ? [0.5 + (i % 3) * 0.12, 0.55 + (i % 4) * 0.16, 0.09]
          : [0.5 + (i % 4) * 0.2, 0.32 + (i % 3) * 0.16, 0.55 + (i % 3) * 0.2],
        colour: fan ? coral[i % coral.length] : stone[i % stone.length],
        fan,
      });
    }
    return out;
  }, [radius]);

  return (
    <>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.position}
          scale={rock.scale}
          rotation={[0, i * 1.3, rock.fan ? 0.12 : 0]}
        >
          <sphereGeometry args={[1, rock.fan ? 10 : 7, rock.fan ? 8 : 5]} />
          <meshStandardMaterial
            color={rock.colour}
            roughness={0.95}
            flatShading={!rock.fan}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  );
}

export function Reef({ radius }: { radius: number }) {
  return (
    <>
            {/* The background has to be the fog colour exactly. Anything else and
          the seabed stops at a visible edge instead of fading into open
          water. */}
      <color attach="background" args={[WATER]} />
      <fogExp2 attach="fog" args={[WATER, 0.038]} />

      <ambientLight intensity={0.5} color="#B6EEF6" />
      {/* The sun, coming down through the water. */}
      <directionalLight position={[4, 12, 6]} intensity={1.8} color="#FFF6DC" />
      {/* A cool bounce from the seabed, so undersides aren't black. */}
      <pointLight position={[-5, -1.5, -4]} intensity={22} color="#2FA9C4" distance={26} decay={2} />

      {/* Seabed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
        <circleGeometry args={[radius * 3.2, 48]} />
        <meshStandardMaterial color="#89A290" roughness={1} />
      </mesh>

      <Rockery radius={radius} />
      <SunShafts radius={radius} />
      <KelpForest radius={radius} />
      <Shoal radius={radius} />
      <Bubbles radius={radius} />
    </>
  );
}
