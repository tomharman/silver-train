"use client";

import type {} from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

import type { Board, Move } from "../../chess/types";
import { everySquare, isLightSquare, squareToWorld, TILE } from "../utils/board-space";

/**
 * The board itself: a slab of pale reef stone with sand-coloured squares set
 * into it, plus every hint that needs to sit flat on the surface.
 *
 * The hints are the part that matters. In two dimensions a dot is enough; down
 * here a flat dot disappears the moment the camera tilts, so a legal move is a
 * ring that stands slightly proud of the board and pulses.
 */

const LIGHT = "#FBEFCF";
const DARK = "#3E9E9C";
const STONE = "#2A6470";

function Ring({
  position,
  color,
  radius,
  thickness = 0.06,
  pulse = true,
  height = 0.045,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  thickness?: number;
  pulse?: boolean;
  height?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!pulse || !mesh.current) return;
    const beat = 1 + Math.sin(clock.elapsedTime * 3.4) * 0.09;
    mesh.current.scale.set(beat, beat, 1);
  });

  return (
    <mesh
      ref={mesh}
      position={[position[0], height, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius - thickness, radius, 28]} />
      <meshBasicMaterial color={color} transparent opacity={0.92} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Disc({
  position,
  color,
  radius,
  opacity,
  height = 0.035,
}: {
  position: [number, number, number];
  color: string;
  radius: number;
  opacity: number;
  height?: number;
}) {
  return (
    <mesh position={[position[0], height, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[radius, 26]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** A bobbing bead of light, hovering where a move would land. */
function Bead({ position }: { position: [number, number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.position.y = 0.62 + Math.sin(clock.elapsedTime * 2.6) * 0.09;
  });

  return (
    <mesh ref={mesh} position={[position[0], 0.62, position[2]]}>
      <sphereGeometry args={[0.1, 12, 10]} />
      <meshBasicMaterial color="#B6FFEC" transparent opacity={0.95} />
    </mesh>
  );
}

interface ReefBoardProps {
  board: Board;
  selected: number | null;
  targets: Map<number, Move>;
  lastMove: Move | null;
  inDanger: Set<number>;
  checkSquare: number | null;
}

export function ReefBoard({
  board,
  selected,
  targets,
  lastMove,
  inDanger,
  checkSquare,
}: ReefBoardProps) {
  const width = board.width * TILE;
  const depth = board.height * TILE;

  return (
    <group>
      {/* The plinth the board is set into. */}
      <mesh position={[0, -0.16, 0]} receiveShadow>
        <boxGeometry args={[width + 0.9, 0.32, depth + 0.9]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.44, 0]}>
        <boxGeometry args={[width + 1.5, 0.3, depth + 1.5]} />
        <meshStandardMaterial color="#1D4C57" roughness={1} />
      </mesh>

      {/* Squares */}
      {everySquare(board).map((square) => {
        const [x, , z] = squareToWorld(board, square);
        return (
          <mesh key={square} position={[x, 0.005, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[TILE * 0.97, TILE * 0.97]} />
            <meshStandardMaterial
              color={isLightSquare(board, square) ? LIGHT : DARK}
              roughness={0.75}
            />
          </mesh>
        );
      })}

      {/* Where the last move came from and went to. */}
      {lastMove && (
        <>
          <Disc
            position={squareToWorld(board, lastMove.from)}
            color="#FFD873"
            radius={TILE * 0.46}
            opacity={0.3}
            height={0.02}
          />
          <Disc
            position={squareToWorld(board, lastMove.to)}
            color="#FFD873"
            radius={TILE * 0.46}
            opacity={0.42}
            height={0.02}
          />
        </>
      )}

      {/* Anything of yours the other side could eat next go. */}
      {[...inDanger].map((square) => (
        <Ring
          key={`danger-${square}`}
          position={squareToWorld(board, square)}
          color="#FF5A5A"
          radius={TILE * 0.46}
          thickness={0.05}
          pulse={false}
          height={0.03}
        />
      ))}

      {checkSquare !== null && (
        <Disc
          position={squareToWorld(board, checkSquare)}
          color="#FF4D4D"
          radius={TILE * 0.48}
          opacity={0.5}
          height={0.028}
        />
      )}

      {selected !== null && (
        <Ring
          position={squareToWorld(board, selected)}
          color="#FFE066"
          radius={TILE * 0.45}
          thickness={0.08}
        />
      )}

      {/* Legal moves: a fat ring for a capture, a glowing pad for an empty square. */}
      {[...targets.keys()].map((square) => {
        const position = squareToWorld(board, square);
        const occupied = board.squares[square] !== null;
        return occupied ? (
          <Ring
            key={`take-${square}`}
            position={position}
            color="#FF7B5A"
            radius={TILE * 0.47}
            thickness={0.1}
          />
        ) : (
          <group key={`go-${square}`}>
            <Disc position={position} color="#8CF5D9" radius={TILE * 0.26} opacity={0.8} />
            <Ring
              position={position}
              color="#8CF5D9"
              radius={TILE * 0.38}
              thickness={0.05}
              height={0.04}
            />
            {/* A bead of light floating over the square. On a flat board a dot
                is enough; here a creature standing in front hides anything
                painted on the floor, so the marker has to leave the floor. */}
            <Bead position={position} />
          </group>
        );
      })}
    </group>
  );
}
