export type PieceType = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type Color = "white" | "black";

export interface Piece {
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
  outcome: Outcome | null;
}

export interface PieceSkin {
  /** Emoji or Unicode chess glyph. */
  glyph: string;
  /**
   * Optional character artwork, e.g. `/chess/bluey/king.png`. When set this
   * wins over `glyph`. This is the hook for show-themed piece sets.
   */
  imageSrc?: string;
  /** What this piece is called in this theme — "Knight", "Sonic", "Bluey". */
  name: string;
}

export interface PieceTheme {
  id: string;
  name: string;
  emoji: string;
  /**
   * `glyph` renders the character bare (right for Unicode chess pieces, which
   * carry their own colour). `token` sits it on a light or dark disc, which is
   * how you tell the two sides apart when both are emoji or artwork.
   */
  style: "glyph" | "token";
  whiteLabel: string;
  blackLabel: string;
  pieces: Record<PieceType, PieceSkin>;
}

export type Difficulty = "sleepy" | "thinky" | "tricky";

export type Mode = "two" | "one";
