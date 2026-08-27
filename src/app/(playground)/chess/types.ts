export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type Color = "white" | "black";

export interface Piece {
  /**
   * Stable for the life of a game, and carried through moves and promotions.
   * This is what lets the board animate a piece from one square to the next
   * instead of unmounting it here and mounting a new one there.
   */
  id: number;
  type: PieceType;
  color: Color;
  /** Only matters for castling, but cheap to track everywhere. */
  moved: boolean;
}

/**
 * Squares are stored as a flat index: `rank * width + file`.
 * File 0 is the left-hand column, rank 0 is White's home row (the bottom).
 */
export interface Board {
  width: number;
  height: number;
  squares: (Piece | null)[];
}

export interface Move {
  from: number;
  to: number;
  piece: PieceType;
  /** Set for both ordinary captures and en passant (where `square !== to`). */
  capture?: { square: number; piece: Piece };
  promotion?: PieceType;
  castle?: { rookFrom: number; rookTo: number };
  doubleStep?: boolean;
}

/** How a level is won. Each one is a single sentence a five year old can hold in their head. */
export type WinCondition =
  /** March a pawn to the far end of the board. */
  | "raceToEnd"
  /** Take every last one of their pieces. */
  | "captureAll"
  /** Grab the king — no check, no checkmate, just take it. */
  | "captureKing"
  /** Proper chess. */
  | "checkmate";

export interface LevelRules {
  pawnDoubleStep: boolean;
  promotion: boolean;
  /** What a pawn becomes when it gets to the end. Levels promote to the piece they teach. */
  promoteTo?: PieceType;
  castling: boolean;
  enPassant: boolean;
  /**
   * Turns without a capture or a pawn move before the game is called a draw.
   * Real chess uses the fifty-move rule; the little games call it sooner,
   * because two locked bishops on opposite colours can never resolve and a
   * child will not sit through the discovery of that fact.
   */
  idleLimit: number;
  /**
   * When false, check and checkmate don't exist: you simply can't make an
   * illegal move, and kings can be captured like anything else. This is the
   * single biggest simplification for young beginners.
   */
  check: boolean;
}

export interface Level {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  width: number;
  height: number;
  /** Rows given top (Black's side) to bottom. Uppercase = White, lowercase = Black, `.` = empty. */
  setup: string[];
  win: WinCondition;
  /** Pieces this level introduces, for the little "new piece" flag on the level card. */
  teaches: PieceType[];
  /** Short lines written to be read aloud to a child. */
  howTo: string[];
  /** A note for the grown-up about why this level exists. */
  grownUpNote: string;
  rules: LevelRules;
}

export type Outcome =
  | { kind: "win"; winner: Color; reason: string }
  | { kind: "draw"; reason: string };

export interface GameState {
  board: Board;
  turn: Color;
  /** Square a pawn just skipped over, for en passant. Null almost always. */
  epTarget: number | null;
  /** Turns since the last capture or pawn move, counted against `rules.idleLimit`. */
  idleTurns: number;
  lastMove: Move | null;
  captured: Piece[];
  /** Half-moves played. Used as an animation key so effects replay each turn. */
  ply: number;
  outcome: Outcome | null;
}

/**
 * How a piece carries itself across the board. Purely decorative — the legal
 * moves are identical whatever this says — but picking one that suits the
 * character is the point of a theme: the popcorn pops, the planet rolls, the
 * comet floats.
 */
export type TravelStyle = "slide" | "hop" | "float" | "spin" | "roll" | "stomp";

/** What happens on the square where something just got taken. */
export type CaptureEffect = "poof" | "chomp" | "sparkle" | "yum" | "crumble";

export interface PieceSkin {
  /** What the game calls this piece out loud. */
  name: string;
  /** Overrides how it carries itself. Defaults to the piece's own style. */
  travel?: TravelStyle;
}

/**
 * A team's colours.
 *
 * `ramp` is blended across the cells of a piece rather than filling it flat, so
 * a rook is a wash of four or five related colours the way the reference art
 * is — the pixels look placed by hand rather than by a fill tool. The ramp is
 * also what tells the two armies apart, so the two ramps in a world have to
 * disagree about hue far more than about lightness: on a small screen, warm
 * versus cool survives and light versus dark does not.
 */
export interface TeamPalette {
  ramp: string[];
  /** Drawn over the body for the slit, the nostril, the doorway. */
  accent: string;
  /** The little shadow the character stands on. */
  shadow: string;
}

/**
 * The place a theme happens in. A theme that only swaps the pieces is a skin;
 * changing the board, the frame and the sky underneath it is what makes
 * choosing one feel like going somewhere.
 */
export interface World {
  /** One palette per army. */
  teams: Record<Color, TeamPalette>;
  /** Kid-facing name of the place — "The Jungle", "Deep Space". */
  name: string;
  lightSquare: string;
  darkSquare: string;
  /** The wooden surround the board sits in. */
  frame: string;
  /** CSS background for the map screen. */
  backdrop: string;
  backdropDark: string;
  /** Pip's colour here. */
  guide: string;
  /** Decoration scattered around the map. Purely atmosphere. */
  scenery: string[];
}

export interface PieceTheme {
  id: string;
  name: string;
  emoji: string;
  world: World;
  /** What a capture looks like in this theme. Defaults to a puff of smoke. */
  captureEffect?: CaptureEffect;
  pieces: Record<PieceType, PieceSkin>;
}

export type Difficulty = "sleepy" | "thinky" | "tricky";

export type Mode = "two" | "one";
