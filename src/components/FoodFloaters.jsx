const FOODS = ["🍕", "🍿", "🍬", "🍔", "🍟", "🍩", "🌭", "🌮", "🍭", "🧁", "🍫", "🍦", "🥨", "🍪"];

const FLOATERS = FOODS.flatMap((emoji, i) => [
  {
    emoji,
    left: (i * 7.3 + 3) % 96,
    size: 22 + ((i * 5) % 18),
    duration: 18 + ((i * 3) % 14),
    delay: -((i * 4.1) % 20),
  },
]);

export function FoodFloaters() {
  return (
    <div className="food-floaters" aria-hidden="true">
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
