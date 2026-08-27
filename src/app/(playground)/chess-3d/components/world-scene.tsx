"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import type { FloraKind, SceneConfig } from "../data/scenes";

/**
 * How far the ground reaches above ground, as a multiple of the board's radius.
 *
 * This number is the whole reason the sky is visible. The camera looks down at
 * the board hard enough that the top edge of the picture is still a ray aimed
 * nineteen degrees BELOW the horizon — so a plain that runs to the fog fills
 * every pixel and no amount of sky dome helps. Ending the land at a bit over
 * one and a half board-radii puts its rim a few degrees inside the frame, and
 * everything above that line is sky. It scales with the board because a bigger
 * board pushes the camera back, which moves the rim out with it.
 *
 * The same fact decides where everything else goes. Only things that are far
 * away AND well below the plateau fall inside that band, which is why the
 * cloud bank sits under the island rather than over it: from up here you look
 * down on the weather.
 */
const ISLAND = 1.6;

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
  size,
}: {
  position: [number, number, number];
  height: number;
  phase: number;
  tint: string;
  kind: FloraKind;
  sway: number;
  size: number;
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

  return (
    <group position={position} scale={size}>
      {segment(0)}
    </group>
  );
}

function Undergrowth({
  radius,
  scene,
  limit,
}: {
  radius: number;
  scene: SceneConfig;
  /** Nothing may grow past the edge of the land. */
  limit: number;
}) {
  const stalks = useMemo(() => {
    const out: {
      position: [number, number, number];
      height: number;
      phase: number;
      tint: string;
      size: number;
    }[] = [];

    // Angles are measured round from +z, which is where the camera sits. The
    // wedge in front of the board is left empty on purpose: something growing
    // up through the middle of the game is the fastest way to make a beautiful
    // scene unplayable.
    const CLEAR = 1.0;
    // Under water the second band can wander off into the fog. On the plateau
    // there is no off: the far band ends up jammed against the rim, close to
    // the camera, where a kelp-sized plant reads as a redwood and blocks the
    // sky. So above ground it is the same planting at a bit over half size.
    const outdoors = Number.isFinite(limit);
    const room = outdoors ? limit - radius : 0;
    const bands = outdoors
      ? [
          { count: 10, gap: room * 0.42, height: 1.6, spread: 0.22, step: 0.4, size: 0.62 },
          { count: 9, gap: room * 0.85, height: 2.4, spread: 0.16, step: 0.5, size: 0.58 },
        ]
      : [
          { count: 10, gap: 1.0, height: 1.5, spread: 0.55, step: 0.55, size: 1 },
          { count: 9, gap: 5.5, height: 3.0, spread: 1.5, step: 0.55, size: 1 },
        ];

    bands.forEach((band, b) => {
      const step = (Math.PI * 2 - CLEAR * 2) / band.count;
      for (let i = 0; i < band.count; i += 1) {
        const angle = CLEAR + step * (i + 0.5) + b * 0.4;
        const distance = Math.min(radius + band.gap + (i % 4) * band.spread, limit);
        out.push({
          position: [Math.sin(angle) * distance, -0.4, Math.cos(angle) * distance],
          height: band.height + (i % 5) * band.step,
          phase: i * 1.7 + b * 2.1,
          tint: scene.floraTints[(i + b) % scene.floraTints.length],
          size: band.size,
        });
      }
    });
    return out;
  }, [radius, scene, limit]);

  return (
    <>
      {stalks.map((stalk, i) => (
        <Growth key={i} {...stalk} kind={scene.flora} sway={scene.sway} />
      ))}
    </>
  );
}

/**
 * The skyline.
 *
 * Undergrowth sits at ankle height and reads as decoration. What makes a jungle
 * a jungle is the thing you have to look *up* at — so the outdoor scenes get a
 * ring of tall silhouettes standing on the rim of the plateau, breaking the
 * horizon line and giving the sky something to be behind.
 */
function Landmarks({ scene, edge }: { scene: SceneConfig; edge: number }) {
  const config = scene.landmarks;

  const items = useMemo(() => {
    if (!config) return [];
    // The same clear wedge the undergrowth respects: nothing directly between
    // the player and their own back rank.
    const CLEAR = 0.85;
    const step = (Math.PI * 2 - CLEAR * 2) / config.count;

    return Array.from({ length: config.count }, (_, i) => {
      const angle = CLEAR + step * (i + 0.5);
      const distance = edge * (0.84 + ((i * 3) % 4) * 0.04);
      return {
        position: [Math.sin(angle) * distance, -0.42, Math.cos(angle) * distance] as [
          number,
          number,
          number,
        ],
        // Kept short on purpose. A tree tall enough to feel like a tree from
        // here would run straight off the top of the frame and take the sky
        // with it; at this range a two-metre silhouette reads as a big one on
        // a distant ridge, which is what a skyline is.
        height: 1 + ((i * 5) % 5) * 0.14,
        spin: i * 1.9,
        tint: config.tints[i % config.tints.length],
      };
    });
  }, [config, edge]);

  const canopies = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const container = canopies.current;
    if (!container || config?.kind !== "tree") return;
    const t = clock.elapsedTime;
    // Only the tops move. A whole tree swaying at the trunk looks like it is
    // about to come down.
    container.children.forEach((child, i) => {
      child.rotation.z = Math.sin(t * 0.45 + i * 1.3) * 0.035;
    });
  });

  if (!config) return null;

  return (
    <group ref={canopies}>
      {items.map((item, i) =>
        config.kind === "tree" ? (
          <group key={i} position={item.position} rotation={[0, item.spin, 0]}>
            <mesh position={[0, 0.75 * item.height, 0]}>
              <cylinderGeometry args={[0.1, 0.19, 1.5 * item.height, 6]} />
              <meshStandardMaterial color={config.stem} roughness={1} flatShading />
            </mesh>
            {/* Three overlapping lumps make a canopy that reads from any angle. */}
            {[
              [0, 1.85, 0, 0.78],
              [0.5, 1.55, 0.22, 0.54],
              [-0.42, 1.62, -0.3, 0.48],
            ].map(([x, y, z, r], puff) => (
              <mesh key={puff} position={[x, y * item.height, z]} scale={[1, 0.78, 1]}>
                <icosahedronGeometry args={[r, 0]} />
                <meshStandardMaterial
                  color={config.tints[(i + puff) % config.tints.length]}
                  roughness={0.95}
                  flatShading
                />
              </mesh>
            ))}
          </group>
        ) : (
          <group key={i} position={item.position} rotation={[0, item.spin, 0]}>
            {/* A stepped butte: a wide skirt with a narrower block on top. */}
            <mesh position={[0, 0.42 * item.height, 0]}>
              <cylinderGeometry args={[0.78, 1.05, 0.85 * item.height, 7]} />
              <meshStandardMaterial color={config.stem} roughness={1} flatShading />
            </mesh>
            <mesh position={[0, 1.3 * item.height, 0]}>
              <cylinderGeometry args={[0.5, 0.66, 0.95 * item.height, 7]} />
              <meshStandardMaterial color={item.tint} roughness={1} flatShading />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}

/**
 * The plateau you play on top of.
 *
 * A cylinder rather than a plane, so its edge is a cliff with a face rather
 * than a paper cut-out — and so the ground stops somewhere the camera can see,
 * which is the only way any sky gets into the picture at all.
 */
function Plateau({ scene, edge }: { scene: SceneConfig; edge: number }) {
  const config = scene.sky;
  if (!config) return null;

  return (
    <mesh position={[0, -0.42 - 5, 0]}>
      <cylinderGeometry args={[edge, edge * 0.84, 10, 48, 1]} />
      {/* Groups are side, top, bottom. The top is the ground you play on. */}
      <meshStandardMaterial attach="material-0" color={config.cliff} roughness={1} flatShading />
      <meshStandardMaterial attach="material-1" color={scene.ground} roughness={1} />
      <meshStandardMaterial attach="material-2" color={config.cliff} roughness={1} />
    </mesh>
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
            position={[Math.cos(angle) * distance, scene.sky ? 4.4 : 8, Math.sin(angle) * distance]}
            rotation={[0.1 * Math.sin(angle), 0, 0.1 * Math.cos(angle)]}
          >
            {/* Under water a shaft can run the full height of the scene. Above
                ground it has to stop below the treeline, or an additive cone
                crossing the sky just washes the blue out in a hard-edged
                wedge. */}
            <coneGeometry args={[0.9 + (i % 3) * 0.35, scene.sky ? 9 : 16, 5, 1, true]} />
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

/**
 * The sky, for the scenes that are above ground.
 *
 * A dome turned inside out with a two-stop gradient baked into a tiny texture,
 * plus a sun and some clouds. It ignores fog on purpose — fog is what gives the
 * ground its distance, and applying it to the sky would flatten the gradient
 * back into the single soupy colour the reef uses.
 */
function Sky({ scene }: { scene: SceneConfig }) {
  const config = scene.sky;

  const gradient = useMemo(() => {
    if (!config) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) return null;
    const fill = context.createLinearGradient(0, 0, 0, 128);
    // The stops sit low because the slice of dome you actually see is low: the
    // frame stops well short of the horizon, so a gradient centred on the
    // equator would be entirely above the picture.
    fill.addColorStop(0, config.top);
    fill.addColorStop(0.45, config.top);
    fill.addColorStop(0.72, config.horizon);
    fill.addColorStop(1, config.horizon);
    context.fillStyle = fill;
    context.fillRect(0, 0, 4, 128);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [config]);

  const clouds = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (clouds.current) clouds.current.rotation.y = clock.elapsedTime * 0.006;
  });

  if (!config || !gradient) return null;

  return (
    <>
      {/*
        Drawn from the inside with BackSide rather than by mirroring the mesh —
        a negative scale flips the winding, which is a second thing that has to
        be right for no benefit. It goes first and writes no depth, so it is
        simply the colour everything else is painted on top of.
      */}
      <mesh renderOrder={-1000} frustumCulled={false}>
        <sphereGeometry args={[60, 24, 16]} />
        <meshBasicMaterial
          map={gradient}
          fog={false}
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {config.sun && (
        <mesh position={[9, config.sun.height, -30]}>
          <circleGeometry args={[config.sun.size, 24]} />
          <meshBasicMaterial color={config.sun.colour} fog={false} transparent opacity={0.95} />
        </mesh>
      )}

      {/*
        Clouds BELOW you, not above. The frame's top edge is a ray aimed well
        under the horizon, so anything at cloud height is off the top of the
        picture; the only far-away things that land in shot are far-away things
        that are also a long way down. Which is exactly what you see from the
        top of a very tall rock, so it works out.
      */}
      <group ref={clouds}>
        {Array.from({ length: config.clouds }, (_, i) => {
          const angle = (i / config.clouds) * Math.PI * 2 + 0.7;
          const distance = 40 + (i % 3) * 10;
          const height = -10 - (i % 4) * 2;
          return (
            <group key={i} position={[Math.cos(angle) * distance, height, Math.sin(angle) * distance]}>
              {[0, 1, 2].map((puff) => (
                <mesh
                  key={puff}
                  position={[(puff - 1) * 4.4, (puff === 1 ? 1.2 : 0), 0]}
                  scale={[1, 0.5, 1]}
                >
                  <sphereGeometry args={[3.1 + (puff === 1 ? 1.2 : 0), 8, 6]} />
                  <meshBasicMaterial
                    color={config.cloud}
                    fog={false}
                    transparent
                    opacity={0.85}
                  />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </>
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
  const edge = radius * ISLAND;

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

      {/* Underwater the seabed simply fades out inside the fog, which is what
          being under water looks like. Above ground the land is a plateau
          instead — see Plateau, and the note on ISLAND. */}
      {scene.sky ? (
        <Plateau scene={scene} edge={edge} />
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]} receiveShadow>
          <circleGeometry args={[radius * 3.2, 56]} />
          <meshStandardMaterial color={scene.ground} roughness={1} />
        </mesh>
      )}

      <Sky scene={scene} />
      <Landmarks scene={scene} edge={edge} />
      <Rockery radius={radius} scene={scene} />
      <Shafts radius={radius} scene={scene} />
      <Undergrowth radius={radius} scene={scene} limit={scene.sky ? edge - 1.2 : Infinity} />
      <Wanderers radius={radius} scene={scene} />
      <Motes radius={radius} scene={scene} />
    </>
  );
}
