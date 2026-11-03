/**
 * The four phases of the Engineering Cycle. Each project gives every student a
 * separate board per phase.
 *   - PHASES: [{ key, number, label, lines, color, emoji }] - ticket.phase stores
 *     the key; the rest drive the phase diagram and badges.
 *   - getPhase(key) / getPhaseLabel(key): look up a phase / its display name.
 *
 * Where things are used:
 *   - PHASES: features/boards/EngineeringCycleDiagram.jsx,
 *       features/tickets/components/CreateTicketModal.jsx,
 *       features/tickets/components/EditTicketModal.jsx; also inside this file by getPhase
 *   - getPhase: features/boards/StudentDashboard.jsx; also inside this file by getPhaseLabel
 *   - getPhaseLabel: features/tickets/components/TicketCard.jsx,
 *       features/tickets/components/TicketDetailModal.jsx
 */

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
