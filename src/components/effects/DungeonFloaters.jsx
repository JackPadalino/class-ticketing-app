/**
 * Pixel-art tabletop-RPG decoration. Sprites are drawn from character grids as
 * crisp SVG rects (no image files), then used both as the drifting background
 * layer and as small icons in the marquee and on the login card.
 *   - PixelD20:         a twenty-sided die in one of four gem tones
 *   - PixelSword:       a steel longsword with a gold crossguard
 *   - PixelShield:      a quartered heraldic shield
 *   - DungeonFloaters:  background layer of tumbling d20s and rising torch flames
 *     (movement and spin are CSS animations, see .dungeon-floaters in styles/base.css)
 *   - Local helpers (only used in this file): TONES, buildD20, FLAME_GRID,
 *     SWORD_GRID, SHIELD_GRID, PixelSprite, DIE_TONES, ITEMS
 *
 * Appears in the following files:
 *   - DungeonFloaters: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelD20: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelSword: components/layout/AppLayout.jsx, features/auth/Login.jsx
 *   - PixelShield: components/layout/AppLayout.jsx, features/auth/Login.jsx
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

const D20_GRID = buildD20();
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

const DIE_TONES = ["ruby", "amethyst", "emerald", "gold"];

const ITEMS = Array.from({ length: 14 }, (_, i) => ({
  flame: i % 3 === 2,
  tone: DIE_TONES[i % DIE_TONES.length],
  left: (i * 7.3 + 3) % 94,
  size: 30 + ((i * 7) % 30),
  duration: 24 + ((i * 3) % 16),
  delay: -((i * 4.7) % 24),
  reverse: i % 2 === 1,
}));

export function DungeonFloaters() {
  return (
    <div className="dungeon-floaters" aria-hidden="true">
      {ITEMS.map((f, i) => (
        <span
          key={i}
          className={f.flame ? "flame" : f.reverse ? "die reverse" : "die"}
          style={{
            left: `${f.left}%`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.flame ? (
            <PixelSprite grid={FLAME_GRID} colors={FLAME_COLORS} size={f.size * 0.6} />
          ) : (
            <PixelD20 tone={f.tone} size={f.size} />
          )}
        </span>
      ))}
    </div>
  );
}
