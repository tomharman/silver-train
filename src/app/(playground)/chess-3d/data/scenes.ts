/**
 * The three places you can play.
 *
 * The creatures never change — a crab is a pawn wherever you are — but
 * everything around them does. Each scene is pure data: the colour of the air,
 * what grows out of the ground, what drifts through it and what wanders past.
 * The renderer reads this and builds the world; adding a fourth place means
 * adding an entry here and nothing else.
 */

export type FloraKind = "kelp" | "fern" | "cactus";

/** The big silhouettes on the skyline: rainforest trees, or desert rock. */
export type LandmarkKind = "tree" | "mesa";

export interface SceneConfig {
  id: string;
  name: string;
  /** Short label for the picker — two worlds both ending in "Jungle" is no use. */
  short: string;
  emoji: string;

  /** Fog and background share a colour, or the ground ends at a visible edge. */
  air: string;
  fogDensity: number;
  ground: string;

  ambient: string;
  ambientIntensity: number;
  key: string;
  keyIntensity: number;
  /** A bounce light from below, so undersides aren't black. */
  fill: string;
  fillIntensity: number;

  board: { light: string; dark: string; frame: string; base: string };

  flora: FloraKind;
  floraTints: string[];
  /** Kelp and ferns bend; cacti barely move. */
  sway: number;

  rockTints: string[];
  /** Coral fans, jungle flowers, desert blooms. */
  bloomTints: string[];

  /** Drifting specks: bubbles, fireflies, dust. `rise` is how fast they climb. */
  motes: { colour: string; count: number; size: number; rise: number; glow: boolean };

  /** Things that fly past in the distance. Null for nothing. */
  wanderers: { colours: string[]; count: number; height: number } | null;

  /** Shafts of light from above. Null for none. */
  shafts: { colour: string; opacity: number } | null;

  /**
   * Above ground or under water.
   *
   * Underwater there is no horizon — fog simply swallows everything, which is
   * exactly right for a reef. Above ground that same treatment just looks like
   * coloured soup, so the outdoor scenes get a real sky.
   *
   * Getting the sky *into frame* takes more than adding a dome. You are looking
   * down at the board at forty-odd degrees, so the top edge of the picture is
   * still aimed at the ground: a flat plain of any size fills the screen and the
   * sky never appears. So above ground the world stands on a plateau you can see
   * the edge of, with a cliff, a long drop and open sky beyond. Null means
   * underwater, where the fog does the job on its own.
   */
  sky: {
    top: string;
    horizon: string;
    cloud: string;
    clouds: number;
    sun: { colour: string; size: number; height: number } | null;
    /** The rock face under the plateau's rim. */
    cliff: string;
  } | null;

  /** Tall things on the skyline. Null for a scene with nothing on its horizon. */
  landmarks: {
    kind: LandmarkKind;
    count: number;
    /** Canopy or rock-top colours. */
    tints: string[];
    /** Trunk or lower-rock colour. */
    stem: string;
  } | null;

  /** Pip's colour here. */
  guide: string;

  /** One line, for when you arrive. */
  welcome: string;
}

export const SCENES: SceneConfig[] = [
  {
    id: "reef",
    name: "Sunken Jungle",
    short: "Reef",
    emoji: "🐠",
    air: "#0E5A70",
    fogDensity: 0.038,
    ground: "#89A290",
    ambient: "#B6EEF6",
    ambientIntensity: 0.5,
    key: "#FFF6DC",
    keyIntensity: 1.8,
    fill: "#2FA9C4",
    fillIntensity: 22,
    board: { light: "#FBEFCF", dark: "#3E9E9C", frame: "#2A6470", base: "#1D4C57" },
    flora: "kelp",
    floraTints: ["#2E7D4F", "#3F9A5C", "#246B45", "#57B36A"],
    sway: 1,
    rockTints: ["#4C6B6E", "#3E5A61", "#5B7A72"],
    bloomTints: ["#FF7E6B", "#FFA45C", "#E2668E", "#FFD277"],
    motes: { colour: "#DFF6FF", count: 70, size: 0.022, rise: 1, glow: false },
    wanderers: { colours: ["#FFC84A", "#FF8E6E", "#7BE0D6", "#F0F4A0"], count: 6, height: 0.9 },
    shafts: { colour: "#BFF6E8", opacity: 0.03 },
    sky: null,
    landmarks: null,
    guide: "#3FC7B4",
    welcome: "the Sunken Jungle",
  },
  {
    id: "jungle",
    name: "Deep Jungle",
    short: "Jungle",
    emoji: "🌴",
    air: "#B9DE9A",
    fogDensity: 0.014,
    ground: "#6B7A3E",
    ambient: "#CDEFB0",
    ambientIntensity: 0.55,
    key: "#FFF4C4",
    keyIntensity: 2.0,
    fill: "#4CAF50",
    fillIntensity: 16,
    board: { light: "#F3E4B8", dark: "#5C8F4A", frame: "#4A3520", base: "#33240F" },
    flora: "fern",
    floraTints: ["#2F7A32", "#3E9B3C", "#256A2C", "#65B84E"],
    sway: 0.55,
    rockTints: ["#5E6B4A", "#4A5540", "#6E7A55"],
    bloomTints: ["#FF5C8A", "#FFB03A", "#C86BE0", "#FF7A5C"],
    // Fireflies: slow, glowing, barely rising.
    motes: { colour: "#FFE97A", count: 55, size: 0.03, rise: 0.18, glow: true },
    wanderers: { colours: ["#FF7AB8", "#8ED2FF", "#FFD84A", "#B98CFF"], count: 6, height: 1.6 },
    // No god rays above ground. An additive cone reads as a beam against dark
    // water and as a smear of milk against a sunlit clearing, and the hard
    // edge where the cone ends gives it away every time.
    shafts: null,
    sky: {
      top: "#3E86C4",
      horizon: "#BFE0F0",
      cloud: "#F4FFE8",
      clouds: 7,
      sun: null,
      cliff: "#6B5233",
    },
    landmarks: {
      kind: "tree",
      count: 9,
      tints: ["#2F7A32", "#3E9B3C", "#256A2C", "#4FAA45"],
      stem: "#6B4A2A",
    },
    guide: "#7BC950",
    welcome: "the Deep Jungle",
  },
  {
    id: "desert",
    name: "Golden Desert",
    short: "Desert",
    emoji: "🏜️",
    air: "#F7E0B8",
    fogDensity: 0.011,
    ground: "#E8C489",
    ambient: "#FFE6BE",
    ambientIntensity: 0.7,
    key: "#FFF1CE",
    keyIntensity: 2.1,
    fill: "#FF9E5C",
    fillIntensity: 12,
    board: { light: "#FBEDD2", dark: "#8C7A5E", frame: "#8A5A34", base: "#6B4326" },
    flora: "cactus",
    floraTints: ["#4E8C5A", "#3F7A4C", "#5FA268"],
    sway: 0.12,
    rockTints: ["#B98A5C", "#A2764B", "#C99B6B"],
    bloomTints: ["#FF6B6B", "#FFCF5C", "#FF8FB1", "#E86BC8"],
    // Dust, hanging in hot air rather than rising.
    motes: { colour: "#FFF0CE", count: 60, size: 0.024, rise: 0.06, glow: false },
    wanderers: { colours: ["#7A5B3A", "#8E6A45"], count: 4, height: 2.6 },
    shafts: null,
    sky: {
      top: "#2F7FC9",
      horizon: "#D9EBF4",
      cloud: "#FFFFFF",
      clouds: 4,
      sun: { colour: "#FFF6D2", size: 2.4, height: 7.5 },
      cliff: "#B5794A",
    },
    landmarks: {
      kind: "mesa",
      count: 7,
      tints: ["#D09A62", "#C08A55", "#E0AC74"],
      stem: "#A2703F",
    },
    guide: "#E2843C",
    welcome: "the Golden Desert",
  },
];

export function getScene(id: string): SceneConfig {
  return SCENES.find((scene) => scene.id === id) ?? SCENES[0];
}
