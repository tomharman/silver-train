import type { Mood } from "../components/pip";
import type { Level, PieceTheme, PieceType } from "../types";

/**
 * What Pip says.
 *
 * This is the teaching layer, not decoration. A five year old will not read the
 * rules panel, but he will listen to a friend who says one short thing at the
 * moment it matters: how the piece he just picked up moves, what he just took,
 * that his king is in trouble. Every line is written to be read aloud, uses the
 * character's name in the current world, and says exactly one thing.
 */

export interface Line {
  text: string;
  mood: Mood;
}

/** Deterministic pick, so the same moment doesn't reshuffle on a re-render. */
function choose(options: string[], seed: number): string {
  return options[Math.abs(seed) % options.length];
}

function line(options: string[], mood: Mood, seed: number): Line {
  return { text: choose(options, seed), mood };
}

/** How each piece moves, in the words of the world you're standing in. */
export function howItMoves(theme: PieceTheme, type: PieceType): string {
  const name = theme.pieces[type].name;

  switch (type) {
    case "pawn":
      return `${name} walks forward one square — but munches diagonally!`;
    case "knight":
      return `${name} goes two squares, then one to the side. Jumps over everyone!`;
    case "bishop":
      return `${name} slides along the slants. Look — always the same colour!`;
    case "rook":
      return `${name} rolls in straight lines, as far as you like.`;
    case "queen":
      return `${name} can go ANY direction. She's the strongest of all!`;
    case "king":
      return `${name} takes one little step at a time. Keep him safe!`;
  }
}

export function levelWelcome(level: Level, theme: PieceTheme, player: string): Line {
  const goal: Record<string, string> = {
    raceToEnd: "First one to the far end wins. Ready?",
    captureAll: "Gobble up all of theirs to win!",
    captureKing: "Catch the other king and you win!",
    checkmate: "Trap the king so he can't escape. That's checkmate!",
  };

  return {
    text: `${player}, welcome to ${theme.world.name}! ${goal[level.win]}`,
    mood: "cheer",
  };
}

export function pickedUp(theme: PieceTheme, type: PieceType, seen: boolean, seed: number): Line {
  if (!seen) {
    // First time this piece has been touched on this level — teach it.
    return { text: howItMoves(theme, type), mood: "think" };
  }
  return line(
    [
      "Tap a yellow block to go there!",
      "Where shall we go?",
      "Pick a spot!",
      "The yellow blocks show everywhere it can go.",
    ],
    "happy",
    seed,
  );
}

export function tookSomething(theme: PieceTheme, type: PieceType, yours: boolean, seed: number): Line {
  const name = theme.pieces[type].name;

  if (yours) {
    return line(
      [
        `Oh no — they got your ${name}!`,
        `They munched your ${name}. Get them back!`,
        `Your ${name} is gone. Watch out for that one.`,
      ],
      "worry",
      seed,
    );
  }

  return line(
    [`Munch! You got their ${name}!`, `Yes! Their ${name} is yours!`, `Gotcha — one ${name}!`],
    "cheer",
    seed,
  );
}

export function promoted(theme: PieceTheme, into: PieceType): Line {
  return {
    text: `WOW! Your little ${theme.pieces.pawn.name} turned into a ${theme.pieces[into].name}!`,
    mood: "surprise",
  };
}

export function inCheck(theme: PieceTheme): Line {
  return {
    text: `Careful! Your ${theme.pieces.king.name} is in danger. You MUST save him!`,
    mood: "worry",
  };
}

export function nearlyHome(seed: number): Line {
  return line(
    ["So close! One more square!", "Nearly there — keep going!", "Almost at the end!"],
    "surprise",
    seed,
  );
}

export function yourTurn(player: string, seed: number): Line {
  return line(
    [`Your go, ${player}!`, `Off you go, ${player}.`, `${player}'s turn — pick a piece!`],
    "happy",
    seed,
  );
}

export function thinking(seed: number): Line {
  return line(
    ["Hmm, let me think…", "My turn! What shall I do…", "Thinking…"],
    "think",
    seed,
  );
}

export function ending(won: boolean | null, player: string, seed: number): Line {
  if (won === null) {
    return { text: "It's a draw — nobody won that one. Good game!", mood: "happy" };
  }
  if (won) {
    return line(
      [`YOU DID IT, ${player}!!`, `${player} wins! Brilliant!`, `Hooray! ${player} is the champion!`],
      "cheer",
      seed,
    );
  }
  return line(
    [
      "Good game! Shall we try again?",
      "So close! Let's have another go.",
      "Nearly! Press Oops! next time to take a move back.",
    ],
    "happy",
    seed,
  );
}
