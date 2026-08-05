"use client";

import type {} from "@react-three/fiber";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import type { Board, GameState, Move } from "../../chess/types";
import type { Palette } from "../data/palettes";
import type { SceneConfig } from "../data/scenes";
import { cameraFor, creatureScaleFor, squareToWorld, type CameraAngle } from "../utils/board-space";
import { Creature } from "./creature";
import { WorldScene } from "./world-scene";
import { ReefBoard } from "./reef-board";
import { SquareProjector } from "./square-overlay";

/**
 * The scene.
 *
 * Everything here is presentation — the game state arrives as a prop and no
 * rules live below this line. Which means the 3D game and the 2D one are the
 * same game: same engine, same levels, same computer opponent, two windows onto
 * it.
 */

/**
 * Frames the board, and then holds absolutely still.
 *
 * A drifting camera is the first thing you reach for to stop a 3D scene
 * looking like a photograph, and here it is exactly wrong: the tap targets are
 * projected from world space, so a camera that never settles is a board whose
 * squares never settle, and a five year old is aiming at a moving target. The
 * life comes from the reef instead — kelp, fish, bubbles, shifting light — and
 * the camera only moves when the board changes shape, easing into the new
 * framing and then stopping dead.
 */
function Rig({ board, angle }: { board: Board; angle: CameraAngle }) {
  const wanted = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const settled = useRef(false);

  useFrame((state, delta) => {
    // Everything is read off the frame state rather than from useThree. The
    // camera is a mutable object owned by the renderer, and reaching for it
    // through a hook and then writing to it is exactly the pattern the React
    // compiler refuses — reasonably, since it cannot see the write.
    const camera = state.camera as THREE.PerspectiveCamera;
    const view = cameraFor(board, state.size.width, state.size.height, angle);

    // Re-frame whenever the board or the shape of the screen changes.
    if (
      Math.abs(wanted.current.z - view.position[2]) > 0.001 ||
      Math.abs(wanted.current.y - view.position[1]) > 0.001
    ) {
      wanted.current.set(...view.position);
      target.current.set(...view.target);
      settled.current = false;
      if (camera.isPerspectiveCamera && camera.fov !== view.fov) {
        camera.fov = view.fov;
        camera.updateProjectionMatrix();
      }
    }

    if (settled.current) return;

    camera.position.lerp(wanted.current, Math.min(1, delta * 6));
    camera.lookAt(target.current);

    if (camera.position.distanceTo(wanted.current) < 0.004) {
      camera.position.copy(wanted.current);
      camera.lookAt(target.current);
      settled.current = true;
    }
  });

  return null;
}

interface QuestSceneProps {
  state: GameState;
  selected: number | null;
  targets: Map<number, Move>;
  inDanger: Set<number>;
  checkSquare: number | null;
  /** The piece just eaten, so it can be shown spiralling away. */
  dying: { piece: NonNullable<Board["squares"][number]>; square: number; key: number } | null;
  scene: SceneConfig;
  /** One palette per side, chosen in Setup. */
  palettes: Record<"white" | "black", Palette>;
  angle: CameraAngle;
}

export function QuestScene({
  state,
  selected,
  targets,
  inDanger,
  checkSquare,
  dying,
  scene,
  palettes,
  angle,
}: QuestSceneProps) {
  const board = state.board;
  const radius = Math.max(board.width, board.height) * 0.62 + 1.6;
  const sizing = creatureScaleFor(board);

  // This component only ever renders in the browser (it is imported with
  // ssr:false), so it can ask the device what it can cope with. Modest phones
  // get a single pixel ratio and no antialiasing, which is the difference
  // between a smooth reef and a hot phone.
  const modest =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency ?? 8) <= 4;

  return (
    <Canvas
      // `flat` turns off filmic tone mapping. It is meant to make renders look
      // photographic and it does exactly that — which drained the life out of a
      // set of cartoon sea creatures. Without it the corals and purples read as
      // the colours they actually are.
      flat
      // Capped hard: a phone rendering a reef at 3x is a phone with a flat
      // battery. Two is already past the point anybody can see the difference.
      dpr={modest ? 1 : [1, 2]}
      gl={{ antialias: !modest, powerPreference: "high-performance" }}
      camera={{ position: [0, 8, 10], fov: 44, near: 0.1, far: 90 }}
      style={{ background: scene.air, touchAction: "manipulation" }}
    >
      <Rig board={board} angle={angle} />
      <WorldScene radius={radius} scene={scene} />

      <ReefBoard
        board={board}
        scene={scene}
        selected={selected}
        targets={targets}
        lastMove={state.lastMove}
        inDanger={inDanger}
        checkSquare={checkSquare}
      />

      {board.squares.map((piece, square) =>
        piece ? (
          <Creature
            key={piece.id}
            type={piece.type}
            team={piece.color}
            palette={palettes[piece.color]}
            target={squareToWorld(board, square)}
            square={square}
            seed={piece.id * 1.7}
            selected={selected === square}
            sizing={sizing}
          />
        ) : null,
      )}

      {dying && (
        <Creature
          key={`dying-${dying.key}`}
          type={dying.piece.type}
          team={dying.piece.color}
          palette={palettes[dying.piece.color]}
          target={squareToWorld(board, dying.square)}
          square={dying.square}
          seed={dying.piece.id * 1.7}
          selected={false}
          sizing={sizing}
          dying
        />
      )}

      <SquareProjector board={board} />
    </Canvas>
  );
}
