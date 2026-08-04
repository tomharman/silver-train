"use client";

import type { PieceType } from "../types";

/**
 * The Classic piece set, drawn rather than typed.
 *
 * The obvious implementation is the Unicode chess characters (♔♕♖ …), and that
 * is what this used to be. It breaks on iOS: those code points have an emoji
 * presentation, so Safari renders them with the colour emoji font, which
 * ignores CSS `color` — leaving both armies looking black. Drawing the pieces
 * means the two sides are always the two colours we ask for, on every device,
 * and they stay crisp at any size.
 *
 * `body` is filled in the piece's own colour and outlined in the other one.
 * `accent` is drawn in the outline colour on top — the bishop's slit, the
 * knight's eye and mane — which is what stops the silhouettes blurring into
 * each other at the size a phone renders them.
 */

const LIGHT_FILL = "#FFFFFF";
const DARK_FILL = "#23262F";

interface Shape {
  body: React.ReactNode;
  accent?: React.ReactNode;
}

const SHAPES: Record<PieceType, Shape> = {
  pawn: {
    body: (
      <>
        <circle cx="50" cy="27" r="13" />
        <path d="M50 38c-9 0-15 6-15 13 0 5 3 9 6 11-4 5-9 12-10 18h38c-1-6-6-13-10-18 3-2 6-6 6-11 0-7-6-13-15-13z" />
        <rect x="24" y="79" width="52" height="12" rx="6" />
      </>
    ),
  },
  rook: {
    body: (
      <>
        <path d="M25 16h12v10h8V16h10v10h8V16h12v24H25z" />
        <path d="M34 40h32l-3 30H37z" />
        <path d="M29 70h42l5 11H24z" />
        <rect x="19" y="80" width="62" height="11" rx="5" />
      </>
    ),
  },
  bishop: {
    body: (
      <>
        <path d="M50 8c4 0 7 3 7 7 0 3-2 5-3 6 11 8 16 19 16 28 0 8-9 13-20 13s-20-5-20-13c0-9 5-20 16-28-1-1-3-3-3-6 0-4 3-7 7-7z" />
        <rect x="34" y="60" width="32" height="9" rx="4" />
        <path d="M29 69h42l6 13H23z" />
        <rect x="18" y="81" width="64" height="11" rx="5" />
      </>
    ),
    // The mitre's slit: the one detail that separates a bishop from a pawn.
    accent: <path d="M42 33 L58 49" strokeWidth={6} strokeLinecap="round" fill="none" />,
  },
  knight: {
    body: (
      <>
        <path d="M21 87c0-13 6-21 13-27 5-4 6-8 3-11l-14 4-5-8 18-17c6-6 11-9 15-11l2-11 6 13 6-6 6 11c6 10 9 20 9 32l2 31z" />
        <rect x="17" y="84" width="66" height="11" rx="5" />
      </>
    ),
    accent: (
      <>
        <circle cx="47" cy="33" r="4" strokeWidth={0} />
        <path d="M60 22c6 8 8 18 8 30" strokeWidth={5} strokeLinecap="round" fill="none" />
      </>
    ),
  },
  queen: {
    body: (
      <>
        <circle cx="20" cy="24" r="6" />
        <circle cx="35" cy="16" r="6" />
        <circle cx="50" cy="12" r="7" />
        <circle cx="65" cy="16" r="6" />
        <circle cx="80" cy="24" r="6" />
        <path d="M20 28l9 33h42l9-33-15 16-7-22-8 22-8-22-7 22z" />
        <path d="M29 61h42l5 12H24z" />
        <rect x="19" y="72" width="62" height="11" rx="5" />
        <rect x="24" y="83" width="52" height="8" rx="4" />
      </>
    ),
  },
  king: {
    body: (
      <>
        {/* One path, not two rects: overlapping shapes would each draw their
            own outline and the cross would read as a blob. */}
        <path d="M43 1h14v10h12v13H57v10H43V24H31V11h12z" />
        <path d="M50 30c-15 0-24 9-24 20 0 9 6 15 11 19h26c5-4 11-10 11-19 0-11-9-20-24-20z" />
        <path d="M29 68h42l5 12H24z" />
        <rect x="19" y="79" width="62" height="11" rx="5" />
      </>
    ),
  },
};

interface PieceArtProps {
  type: PieceType;
  light: boolean;
  size: number;
}

export function PieceArt({ type, light, size }: PieceArtProps) {
  const shape = SHAPES[type];
  const fill = light ? LIGHT_FILL : DARK_FILL;
  const outline = light ? DARK_FILL : LIGHT_FILL;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.35))" }}
    >
      <g
        fill={fill}
        stroke={outline}
        strokeWidth={5}
        strokeLinejoin="round"
        strokeLinecap="round"
        paintOrder="stroke fill"
      >
        {shape.body}
      </g>
      {shape.accent && (
        <g fill={outline} stroke={outline}>
          {shape.accent}
        </g>
      )}
    </svg>
  );
}
