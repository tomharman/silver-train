import type { Mood } from "../../chess/components/pip";
import type { Level, PieceType } from "../../chess/types";
import { CREATURES } from "../data/creatures";

/**
 * Pip again — same friend, different ocean.
 *
 * Reusing the character across both games is deliberate: the 2D board and the
 * reef are the same game underneath, so they should have the same voice on top.
 * Only the cast changes, and Pip names whichever creature you just picked up.
 */

export interface Line {
  text: string;
  mood: Mood;
}

function choose(options: string[], seed: number): string {
  return options[Math.abs(seed) % options.length];
}

export function welcome(level: Level, player: string, place: string): Line {
  const goal: Record<string, string> = {
    raceToEnd: "Get one of your crabs all the way to the far side!",
    captureAll: "Munch every last one of theirs to win!",
    captureKing: "Catch the other pufferfish king and you win!",
    checkmate: "Trap their king so he can't get away. That's checkmate!",
  };
  return {
    text: `Welcome to ${place}, ${player}! ${goal[level.win]}`,
    mood: "cheer",
  };
}

export function pickedUp(type: PieceType, seen: boolean, seed: number): Line {
  if (!seen) return { text: CREATURES[type].blurb, mood: "think" };
  return {
    text: choose(
      [
        "Tap a glowing ring to swim there!",
        "Where shall we go?",
        "The rings show everywhere it can reach.",
        "Pick a spot!",
      ],
      seed,
    ),
    mood: "happy",
  };
}

export function munched(type: PieceType, yours: boolean, seed: number): Line {
  const name = CREATURES[type].name;
  if (yours) {
    return {
      text: choose(
        [`Oh no — they ate your ${name}!`, `Your ${name} is gone! Get them back.`],
        seed,
      ),
      mood: "worry",
    };
  }
  return {
    text: choose(
      [`Chomp! You got their ${name}!`, `Yes! Their ${name} is yours!`, `Gotcha — one ${name}!`],
      seed,
    ),
    mood: "cheer",
  };
}

export function promoted(into: PieceType): Line {
  return {
    text: `WOW! Your little ${CREATURES.pawn.name} grew into a ${CREATURES[into].name}!`,
    mood: "surprise",
  };
}

export function inCheck(): Line {
  return {
    text: `Careful! Your ${CREATURES.king.name} is in danger. You must save him!`,
    mood: "worry",
  };
}

export function nearlyThere(seed: number): Line {
  return {
    text: choose(["So close! One more square!", "Nearly across — keep going!"], seed),
    mood: "surprise",
  };
}

export function yourTurn(player: string, seed: number): Line {
  return {
    text: choose([`Your go, ${player}!`, `Off you go, ${player}.`, `${player}'s turn!`], seed),
    mood: "happy",
  };
}

export function thinking(seed: number): Line {
  return {
    text: choose(["Hmm, let me think…", "My turn! Now then…", "Thinking…"], seed),
    mood: "think",
  };
}

export function ending(won: boolean | null, player: string, seed: number): Line {
  if (won === null) return { text: "A draw! Nobody won that one. Good game!", mood: "happy" };
  if (won) {
    return {
      text: choose([`YOU DID IT, ${player}!!`, `${player} wins! Amazing!`], seed),
      mood: "cheer",
    };
  }
  return {
    text: choose(["Good game! Another go?", "So close! Let's try again."], seed),
    mood: "happy",
  };
}
