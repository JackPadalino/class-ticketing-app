/**
 * Pixel-art tabletop-RPG decoration. Sprites are drawn from character grids as
 * crisp SVG rects (no image files), then used both as the drifting background
 * layer and as small icons in the marquee and on the login card.
 *   - PixelD20:         a twenty-sided die in one of four gem tones
 *   - PixelSword:       a steel longsword with a gold crossguard
 *   - PixelShield:      a quartered heraldic shield
 *   - PixelDragon:      a front-facing dragon with spread wings in three colors
 *   - DungeonFloaters:  background layer of tumbling d20s, swords, shields, flapping
 *     dragons and rising torch flames (movement is a CSS animation per kind, see
 *     .dungeon-floaters in styles/base.css)
 *   - Local helpers (only used in this file): TONES, DRAGON_TONES, buildD20,
 *     buildDragon, FLAME_GRID, SWORD_GRID, SHIELD_GRID, PixelSprite, DIE_TONES,
 *     KINDS, ITEMS
 *
 * Appears in the following files:
 *   - DungeonFloaters: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelD20: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelSword: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelShield: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelDragon: only used inside this file (by DungeonFloaters)
 */

// k = outline, f = face, l = lit face, d = shadowed face
const TONES = {
  ruby: { k: "#2a0a0a", f: "#b3261e", l: "#e8604f", d: "#74140f" },
  amethyst: { k: "#1c0f33", f: "#7a4bc2", l: "#b08be8", d: "#4a2a80" },
  emerald: { k: "#0a2410", f: "#2f9a4a", l: "#6fd48a", d: "#1b5e2c" },
  gold: { k: "#3a2410", f: "#d9a526", l: "#f6d874", d: "#9a6c12" },
};

const D20_SIZE = 17;

// Draws a line into a character grid by sampling along it.
function drawLine(grid, [x0, y0], [x1, y1], ch) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 3);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = Math.round(x0 + (x1 - x0) * t);
    const y = Math.round(y0 + (y1 - y0) * t);
    if (grid[y] && grid[y][x] !== ".") grid[y][x] = ch;
  }
}

// Builds a 17x17 d20 seen face-on: a pointy-top hexagon, the central triangle
// and the edges that join the triangle to the hexagon's corners.
function buildD20() {
  const c = (D20_SIZE - 1) / 2;
  const R = 8;
  const grid = [];
  for (let y = 0; y < D20_SIZE; y++) {
    grid.push([]);
    for (let x = 0; x < D20_SIZE; x++) {
      const dx = Math.abs(x - c);
      const dy = Math.abs(y - c);
      const inside = dx <= R * 0.866 && dy <= R - dx / Math.sqrt(3);
      grid[y].push(inside ? "f" : ".");
    }
  }
  const a = [8, 4.5];
  const b = [4.2, 11];
  const t = [11.8, 11];
  // light from the top-left: lit upper-left faces, shadowed lower-right ones
  for (let y = 0; y < D20_SIZE; y++) {
    for (let x = 0; x < D20_SIZE; x++) {
      if (grid[y][x] === ".") continue;
      const shade = (x - c) + (y - c);
      grid[y][x] = shade < -4 ? "l" : shade > 4 ? "d" : "f";
    }
  }
  const hex = { top: [8, 0], ur: [14.9, 4], lr: [14.9, 12], bottom: [8, 16], ll: [1.1, 12], ul: [1.1, 4] };
  const edges = [
    [a, b], [b, t], [t, a],
    [a, hex.top], [a, hex.ul], [a, hex.ur],
    [b, hex.ul], [b, hex.ll], [b, hex.bottom],
    [t, hex.ur], [t, hex.lr], [t, hex.bottom],
  ];
  edges.forEach(([p, q]) => drawLine(grid, p, q, "k"));
  // outline: any pixel touching empty space
  const filled = (x, y) => grid[y] && grid[y][x] && grid[y][x] !== ".";
  const outline = [];
  for (let y = 0; y < D20_SIZE; y++) {
    for (let x = 0; x < D20_SIZE; x++) {
      if (grid[y][x] === ".") continue;
      if (!filled(x - 1, y) || !filled(x + 1, y) || !filled(x, y - 1) || !filled(x, y + 1)) outline.push([x, y]);
    }
  }
  outline.forEach(([x, y]) => (grid[y][x] = "k"));
  return grid.map((row) => row.join(""));
}

// o = outer flame, y = hot core
const FLAME_GRID = [
  "...o...",
  "...o...",
  "..ooo..",
  "..oyo..",
  ".ooyoo.",
  ".oyyyo.",
  ".oyyyo.",
  "..ooo..",
];

// s = steel edge, w = blade shine, g = gold, b = leather grip
const SWORD_GRID = [
  ".....k.....",
  "....ksk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "....kwk....",
  "..kkkgkkk..",
  "kgggggggggk",
  "..kkkgkkk..",
  "....kbk....",
  "....kbk....",
  "....kbk....",
  "...kgggk...",
  "....kkk....",
];

// b = blue field, r = red field, g = gold cross
const SHIELD_GRID = [
  ".kkkkkkkkkkk.",
  "kbbbbbgrrrrrk",
  "kbbbbbgrrrrrk",
  "kbbbbbgrrrrrk",
  "kbbbbbgrrrrrk",
  "kbbbbbgrrrrrk",
  "kgggggggggggk",
  "krrrrrgbbbbbk",
  "krrrrrgbbbbbk",
  ".krrrrgbbbbk.",
  "..krrrgbbbk..",
  "...krrgbbk...",
  "....krgbk....",
  ".....kgk.....",
  "......k......",
];

// k = outline, g = scales, d = wing membrane, y = belly, r = eyes
const DRAGON_TONES = {
  red: { k: "#1c0a08", g: "#b3261e", d: "#962c22", y: "#e8c56a", r: "#ffe14a" },
  green: { k: "#0a1c0c", g: "#3f9a4a", d: "#31803f", y: "#e8d98a", r: "#ff5a3a" },
  violet: { k: "#140a22", g: "#7a4bc2", d: "#6c46b4", y: "#e8c0e8", r: "#7fe8ff" },
};

// Left half of a front-facing dragon (the last column is the centre line);
// buildDragon mirrors it so both wings match.
const DRAGON_HALF = [
  ".kk.......k..",
  ".kdk......kgg",
  ".kddk....kgrg",
  ".kdddk....kgg",
  ".kddddk....kg",
  ".kdddddk..kgg",
  "kddddddddkgyy",
  ".kdddkdddkgyy",
  "..k...k..kgyy",
  "..........kgy",
  "..........kgy",
  "...........kg",
  "...........kg",
  "............k",
];

function buildDragon() {
  return DRAGON_HALF.map((row) => row + [...row.slice(0, -1)].reverse().join(""));
}

const D20_GRID = buildD20();
const DRAGON_GRID = buildDragon();
const FLAME_COLORS = { o: "#e8641c", y: "#ffd44a" };
const SWORD_COLORS = { k: "#1a1620", s: "#9aa3b2", w: "#dfe4ec", g: "#d9a82e", b: "#6b3f14" };
const SHIELD_COLORS = { k: "#1a1620", b: "#2f5f9e", r: "#a82a1c", g: "#e0b030" };

// Renders a character grid as crisp SVG rects, merging runs along each row.
function PixelSprite({ grid, colors, size, className }) {
  const rects = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x;
      while (end + 1 < row.length && row[end + 1] === ch) end++;
      if (ch !== ".") {
        rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={end - x + 1} height={1} fill={colors[ch]} />);
      }
      x = end + 1;
    }
  });
  const width = grid[0].length;
  const height = grid.length;
  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  );
}

export function PixelD20({ tone = "ruby", size = 32 }) {
  return <PixelSprite grid={D20_GRID} colors={TONES[tone]} size={size} />;
}

export function PixelSword({ size = 26 }) {
  return <PixelSprite grid={SWORD_GRID} colors={SWORD_COLORS} size={size} />;
}

export function PixelShield({ size = 32 }) {
  return <PixelSprite grid={SHIELD_GRID} colors={SHIELD_COLORS} size={size} />;
}

function PixelDragon({ tone = "red", size = 64 }) {
  return <PixelSprite grid={DRAGON_GRID} colors={DRAGON_TONES[tone]} size={size} />;
}

const DIE_TONES = ["ruby", "amethyst", "emerald", "gold"];
const DRAGON_COLOR_NAMES = Object.keys(DRAGON_TONES);

// What the background layer cycles through, so every kind keeps turning up.
const KINDS = ["die", "dragon", "flame", "sword", "shield", "die", "flame", "dragon", "shield", "sword", "die", "flame"];

const ITEMS = Array.from({ length: 24 }, (_, i) => ({
  kind: KINDS[i % KINDS.length],
  tone: DIE_TONES[i % DIE_TONES.length],
  dragonTone: DRAGON_COLOR_NAMES[i % DRAGON_COLOR_NAMES.length],
  left: (i * 37.7 + 5) % 92,
  size: 30 + ((i * 7) % 30),
  duration: 24 + ((i * 3) % 16),
  delay: -((i * 4.7) % 24),
  reverse: i % 2 === 1,
}));

function Sprite({ item }) {
  switch (item.kind) {
    case "flame":
      return <PixelSprite grid={FLAME_GRID} colors={FLAME_COLORS} size={item.size * 0.6} />;
    case "sword":
      return <PixelSword size={item.size * 0.55} />;
    case "shield":
      return <PixelShield size={item.size} />;
    case "dragon":
      return <PixelDragon tone={item.dragonTone} size={item.size * 1.7} />;
    default:
      return <PixelD20 tone={item.tone} size={item.size} />;
  }
}

export function DungeonFloaters() {
  return (
    <div className="dungeon-floaters" aria-hidden="true">
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className={`${item.kind}${item.reverse ? " reverse" : ""}`}
          style={{
            left: `${item.left}%`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          <Sprite item={item} />
        </span>
      ))}
    </div>
  );
}
