"use client";

export type Mood = "happy" | "cheer" | "worry" | "surprise" | "think";

/**
 * Pip.
 *
 * A five year old will not read a rules panel, but he will listen to a friend.
 * Pip sits beside the board and says one short thing at a time about whatever
 * just happened — which piece he picked up and how it moves, what he just took,
 * when his king is in trouble. Pip is the same character in every world (worth
 * getting attached to) and only changes colour, so the world stays coherent.
 */

interface PipProps {
  mood: Mood;
  /** Body colour, from the current world. */
  colour: string;
  size?: number;
}

export function Pip({ mood, colour, size = 56 }: PipProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ display: "block", overflow: "visible" }}
    >
      {/* A little tuft, so Pip has a top and a bottom. */}
      <path
        d="M50 12c0-6 4-10 8-12-1 5 1 9 4 11"
        fill="none"
        stroke={colour}
        strokeWidth={6}
        strokeLinecap="round"
      />

      <circle cx="50" cy="56" r="38" fill={colour} />
      {/* A soft highlight keeps the body from reading as a flat blob. */}
      <ellipse cx="38" cy="40" rx="16" ry="12" fill="rgba(255,255,255,0.22)" />

      <Face mood={mood} />
    </svg>
  );
}

function Face({ mood }: { mood: Mood }) {
  const white = "#FFFFFF";
  const dark = "#23262F";

  if (mood === "cheer") {
    // Eyes squeezed shut with delight, big open grin.
    return (
      <>
        <path
          d="M30 50c4-6 12-6 16 0M54 50c4-6 12-6 16 0"
          fill="none"
          stroke={dark}
          strokeWidth={5}
          strokeLinecap="round"
        />
        <path d="M36 64c4 10 24 10 28 0z" fill={dark} />
        <path d="M42 71c3 4 13 4 16 0z" fill="#FF8FA3" />
      </>
    );
  }

  if (mood === "worry") {
    return (
      <>
        <circle cx="38" cy="52" r="10" fill={white} />
        <circle cx="62" cy="52" r="10" fill={white} />
        <circle cx="38" cy="55" r="5" fill={dark} />
        <circle cx="62" cy="55" r="5" fill={dark} />
        <path
          d="M28 38l14 5M72 38l-14 5"
          fill="none"
          stroke={dark}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <path
          d="M40 73c4-5 16-5 20 0"
          fill="none"
          stroke={dark}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </>
    );
  }

  if (mood === "surprise") {
    return (
      <>
        <circle cx="38" cy="51" r="12" fill={white} />
        <circle cx="62" cy="51" r="12" fill={white} />
        <circle cx="38" cy="51" r="6" fill={dark} />
        <circle cx="62" cy="51" r="6" fill={dark} />
        <ellipse cx="50" cy="72" rx="7" ry="9" fill={dark} />
      </>
    );
  }

  if (mood === "think") {
    return (
      <>
        <circle cx="38" cy="52" r="10" fill={white} />
        <circle cx="62" cy="52" r="10" fill={white} />
        <circle cx="41" cy="50" r="5" fill={dark} />
        <circle cx="65" cy="50" r="5" fill={dark} />
        <path
          d="M40 72h16"
          fill="none"
          stroke={dark}
          strokeWidth={5}
          strokeLinecap="round"
        />
      </>
    );
  }

  return (
    <>
      <circle cx="38" cy="52" r="10" fill={white} />
      <circle cx="62" cy="52" r="10" fill={white} />
      <circle cx="38" cy="54" r="5" fill={dark} />
      <circle cx="62" cy="54" r="5" fill={dark} />
      <path
        d="M40 68c4 7 16 7 20 0"
        fill="none"
        stroke={dark}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </>
  );
}

/** Pip plus a speech bubble. The bubble re-keys on `speechKey` so it pops. */
export function PipSays({
  text,
  mood,
  colour,
  speechKey,
  compact = false,
}: {
  text: string;
  mood: Mood;
  colour: string;
  speechKey: string | number;
  compact?: boolean;
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <span className="chess-pip-bob shrink-0">
        <Pip mood={mood} colour={colour} size={compact ? 44 : 54} />
      </span>
      <div
        key={speechKey}
        className="chess-speech relative min-w-0 flex-1 rounded-2xl border-2 bg-card px-3 py-2"
        style={{ borderColor: colour }}
      >
        {/* The bubble's little tail. */}
        <span
          className="absolute -left-[9px] top-1/2 size-3 -translate-y-1/2 rotate-45 border-b-2 border-l-2 bg-card"
          style={{ borderColor: colour }}
        />
        <p className="text-sm font-medium leading-snug">{text}</p>
      </div>
    </div>
  );
}
