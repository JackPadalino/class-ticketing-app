// The four phases of "The Engineering Cycle" - each project gives every
// student one separate Kanban board per phase. ticket.phase stores the
// key; number/color/label drive the phase-picker wheel and badges.
export const PHASES = [
  {
    key: "planning",
    number: 1,
    label: "Planning & Architecture",
    lines: ["Planning &", "Architecture"],
    color: "#ff4040",
    emoji: "🛰️",
  },
  {
    key: "design",
    number: 2,
    label: "UI/UX Design",
    lines: ["UI/UX", "Design"],
    color: "#00e5ff",
    emoji: "🪐",
  },
  {
    key: "development",
    number: 3,
    label: "Development",
    lines: ["Development"],
    color: "#39ff14",
    emoji: "🚀",
  },
  {
    key: "testing",
    number: 4,
    label: "Testing & Review",
    lines: ["Testing &", "Review"],
    color: "#ffe600",
    emoji: "🔭",
  },
];

export function getPhase(key) {
  return PHASES.find((p) => p.key === key);
}

export function getPhaseLabel(key) {
  return getPhase(key)?.label || key;
}
