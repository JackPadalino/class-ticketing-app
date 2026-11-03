const SHIPS = ["👾", "👽", "🛸", "🚀", "☄️", "👾", "🛰️", "👾", "🌟", "🛸", "👽", "🪐", "👾", "🚀"];

const FLOATERS = SHIPS.map((emoji, i) => ({
  emoji,
  left: (i * 7.3 + 3) % 94,
  size: 22 + ((i * 5) % 16),
  duration: 22 + ((i * 3) % 16),
  delay: -((i * 4.7) % 24),
}));

export function SpaceFloaters() {
  return (
    <div className="space-floaters" aria-hidden="true">
      {FLOATERS.map((f, i) => (
        <span
          key={i}
          style={{
            left: `${f.left}%`,
            fontSize: `${f.size}px`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
          }}
        >
          {f.emoji}
        </span>
      ))}
    </div>
  );
}
