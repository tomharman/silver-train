"use client";

import {
  EYE_SCALE,
  GRID_HEIGHT,
  GRID_WIDTH,
  MOUTHS,
  PIECE_ART,
  type Face,
} from "../data/pixel-pieces";
import type { PieceType, TeamPalette } from "../types";

/**
 * One character, drawn.
 *
 * Split into two layers for a reason that only shows up on the full board:
 *
 *   The BODY never changes. Thirty-two pieces of seventy-odd cells each is two
 *   thousand rectangles, and React should not be asked to reconcile two
 *   thousand rectangles every time somebody blinks. So a body is baked once per
 *   (piece, palette) into an SVG data URI, cached in a module-level map, and
 *   shown as an image. Every pawn on a side is then literally the same picture.
 *
 *   The FACE changes constantly — eyes track the last move, expressions react
 *   to it, everyone blinks on their own clock — so it stays as live SVG. It is
 *   about eight rectangles.
 */

const bodies = new Map<string, string>();

/**
 * A cell's colour, picked off the ramp by where it sits.
 *
 * Reading straight down the ramp would give neat horizontal bands, which is not
 * what the reference art does — there the colours drift diagonally and wander a
 * little, as if each pixel were placed rather than filled. The wander is a hash
 * of the coordinates rather than a random number: same piece, same picture,
 * every render and on the server too.
 */
function cellColour(ramp: string[], x: number, y: number, seed: number): string {
  const jitter = ((Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1 + 1) % 1;
  const across = x / (GRID_WIDTH - 1);
  const down = 1 - y / (GRID_HEIGHT - 1);
  const t = Math.min(0.999, Math.max(0, across * 0.42 + down * 0.44 + jitter * 0.24 - 0.05));
  return ramp[Math.floor(t * ramp.length)];
}

function filled(rows: string[], x: number, y: number): boolean {
  return rows[y]?.[x] === "#";
}

function bodyUri(type: PieceType, palette: TeamPalette): string {
  const key = `${type}:${palette.ramp.join("")}:${palette.accent}`;
  const cached = bodies.get(key);
  if (cached) return cached;

  const art = PIECE_ART[type];
  const seed = type.charCodeAt(0) + type.length * 7;
  const outline: string[] = [];
  const cells: string[] = [];

  for (let y = -1; y <= GRID_HEIGHT; y += 1) {
    for (let x = -1; x <= GRID_WIDTH; x += 1) {
      if (filled(art.rows, x, y)) {
        // Cells are drawn a hair over a unit wide so neighbours meet without a
        // hairline of background showing through at fractional scales.
        cells.push(
          `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${cellColour(
            palette.ramp,
            x,
            y,
            seed,
          )}"/>`,
        );
        continue;
      }

      /*
        An empty cell touching the body becomes outline.

        This is the single change that made the board readable. Without it a
        pale warm character on a pale warm square is a smudge, and no amount of
        fiddling with the ramp fixes it, because the ramp also has to keep the
        two armies apart. A dark edge in the team's own colour does both jobs at
        once: it separates the shape from whatever is behind it, and it says
        which side the shape is on.
      */
      if (
        filled(art.rows, x - 1, y) ||
        filled(art.rows, x + 1, y) ||
        filled(art.rows, x, y - 1) ||
        filled(art.rows, x, y + 1)
      ) {
        outline.push(
          `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${palette.accent}"/>`,
        );
      }
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 ${GRID_WIDTH + 2} ${GRID_HEIGHT + 2}" ` +
    `shape-rendering="crispEdges">${outline.join("")}${cells.join("")}</svg>`;

  const uri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  bodies.set(key, uri);
  return uri;
}

const INK = "#1B1D26";
const SCLERA = "#FFFFFF";

interface PixelPieceProps {
  type: PieceType;
  palette: TeamPalette;
  face: Face;
  /**
   * Where the character is looking, each roughly -1 to 1. The pupils slide
   * inside their sockets; that is the whole trick, and it is the difference
   * between a board of ornaments and a board of things that are watching.
   */
  gaze: { x: number; y: number };
  /** Seeds the blink clock, so a rank of pawns doesn't blink in unison. */
  seed: number;
  /** Height in pixels. The width follows from the grid. */
  size: number;
}

export function PixelPiece({ type, palette, face, gaze, seed, size }: PixelPieceProps) {
  const art = PIECE_ART[type];
  const open = EYE_SCALE[face];

  // The socket is two cells wide and the pupil is one, so the pupil has exactly
  // one cell of travel and must not be allowed a millimetre more — a pupil that
  // slides out of its own eye is the stuff of nightmares.
  const px = 0.5 + Math.max(-0.5, Math.min(0.5, gaze.x));
  const py = Math.max(-0.26, Math.min(0.26, gaze.y));

  const eyes: number[] = [art.eye.x, GRID_WIDTH - art.eye.x - 2];
  // Between four and seven seconds, so no two pieces share a rhythm for long.
  const blink = 4 + (seed % 7) * 0.45;

  return (
    <span
      className="relative block"
      style={{ width: size * ((GRID_WIDTH + 2) / (GRID_HEIGHT + 2)), height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a baked data URI, not an asset */}
      <img
        src={bodyUri(type, palette)}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none"
      />

      <svg
        // Matches the body's box, which is inset by the outline ring.
        viewBox={`-1 -1 ${GRID_WIDTH + 2} ${GRID_HEIGHT + 2}`}
        className="absolute inset-0 h-full w-full"
        shapeRendering="crispEdges"
        aria-hidden="true"
        focusable="false"
      >
        {eyes.map((ex, index) => (
          <g key={index}>
            {/*
              Open and shut are two whole drawings cross-fading on one clock,
              rather than one drawing being squashed. Squashing a white block
              and a black block together gives you a grey smear; swapping to a
              drawn lid gives you a blink.
            */}
            <g
              className="chess-eye-open"
              style={{ animationDuration: `${blink}s`, animationDelay: `${-seed * 0.37}s` }}
            >
              <rect
                x={ex}
                y={art.eye.y + (1 - open) / 2}
                width={2}
                height={open}
                fill={SCLERA}
              />
              <rect
                x={ex + px}
                y={art.eye.y + py + (1 - open) / 2}
                width={1}
                height={open}
                fill={INK}
              />
            </g>
            <rect
              className="chess-eye-shut"
              style={{ animationDuration: `${blink}s`, animationDelay: `${-seed * 0.37}s` }}
              x={ex}
              y={art.eye.y + 0.42}
              width={2}
              height={0.34}
              fill={INK}
            />
          </g>
        ))}

        {MOUTHS[face].map(([dx, dy, width], index) => (
          <rect
            key={index}
            x={art.mouth.x + dx - (width - 1) / 2}
            y={art.mouth.y + dy}
            width={width}
            height={0.5}
            fill={INK}
            opacity={0.9}
          />
        ))}
      </svg>
    </span>
  );
}
