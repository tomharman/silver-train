"use client";

import type {} from "@react-three/fiber";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

import type { Board } from "../../chess/types";
import { everySquare, squareName, squareToWorld } from "../utils/board-space";

/**
 * Taps, done as a projected layer of real HTML buttons rather than by
 * raycasting into the scene.
 *
 * Raycasting is the obvious way to click a 3D board and it is the wrong one
 * here. A ray hits whatever is nearest, so a tall creature standing in front of
 * the square you meant swallows the tap; nothing is focusable; and a screen
 * reader sees an empty canvas. Projecting each square's centre to screen
 * coordinates and putting an ordinary button there fixes all three: the board
 * is keyboard navigable, every square announces its name, and a tap always
 * lands on the square you aimed at.
 *
 * The button elements are held in a module-level registry rather than passed
 * about as a ref. Writing to the DOM every frame is the whole job here, and
 * routing that through props means mutating something React believes it owns.
 * Only one board is ever on screen, so a single registry is honest about what
 * this is.
 */

const registry: (HTMLButtonElement | null)[] = [];

/** Lives inside the Canvas; writes screen positions straight onto the buttons. */
export function SquareProjector({ board }: { board: Board }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const point = useMemo(() => new THREE.Vector3(), []);
  const neighbour = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const toScreen = (v: THREE.Vector3) => {
      v.project(camera);
      return {
        x: (v.x * 0.5 + 0.5) * size.width,
        y: (-v.y * 0.5 + 0.5) * size.height,
      };
    };

    // One tile's width on screen, measured across the middle of the board so
    // the hit areas stay roughly the size the squares look.
    const total = board.width * board.height;
    const mid = Math.floor(board.width / 2) + Math.floor(board.height / 2) * board.width;
    const a = squareToWorld(board, mid);
    const b = squareToWorld(board, mid + 1 < total ? mid + 1 : mid - 1);
    const screenA = toScreen(point.set(a[0], a[1], a[2]));
    const screenB = toScreen(neighbour.set(b[0], b[1], b[2]));
    const pitch = Math.max(24, Math.hypot(screenA.x - screenB.x, screenA.y - screenB.y));

    for (let square = 0; square < total; square += 1) {
      const button = registry[square];
      if (!button) continue;
      const [x, y, z] = squareToWorld(board, square);
      const screen = toScreen(point.set(x, y, z));
      button.style.width = `${pitch}px`;
      button.style.height = `${pitch}px`;
      button.style.transform = `translate3d(${screen.x}px, ${screen.y}px, 0) translate(-50%, -50%)`;
    }
  });

  return null;
}

/** Lives over the Canvas. Invisible, but every bit a real set of buttons. */
export function SquareButtons({
  board,
  active,
  onSquare,
}: {
  board: Board;
  /** Squares that can be tapped right now. */
  active: Set<number>;
  onSquare: (square: number) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {everySquare(board).map((square) => (
        <button
          key={square}
          type="button"
          ref={(element) => {
            registry[square] = element;
          }}
          aria-label={squareName(board, square)}
          disabled={!active.has(square)}
          onClick={() => onSquare(square)}
          className="pointer-events-auto absolute left-0 top-0 rounded-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-white/90 disabled:pointer-events-none"
          style={{ touchAction: "manipulation" }}
        />
      ))}
    </div>
  );
}
