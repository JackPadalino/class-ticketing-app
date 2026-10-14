import { PHASES } from "../constants";

const BOX_W = 240;
const BOX_H = 150;
const GAP_X = 130;
const GAP_Y = 110;
const MARGIN = 30;

const COL1_X = MARGIN;
const COL2_X = MARGIN + BOX_W + GAP_X;
const ROW1_Y = MARGIN;
const ROW2_Y = MARGIN + BOX_H + GAP_Y;

const WIDTH = COL2_X + BOX_W + MARGIN;
const HEIGHT = ROW2_Y + BOX_H + MARGIN;

// Positioned clockwise: planning (top-left) -> design (top-right) ->
// development (bottom-right) -> testing (bottom-left) -> back to planning.
const BOX_POS = [
  { x: COL1_X, y: ROW1_Y },
  { x: COL2_X, y: ROW1_Y },
  { x: COL2_X, y: ROW2_Y },
  { x: COL1_X, y: ROW2_Y },
];

// Straight connector between each pair of boxes, in cycle order.
const ARROWS = [
  `M ${COL1_X + BOX_W} ${ROW1_Y + BOX_H / 2} L ${COL2_X} ${ROW1_Y + BOX_H / 2}`,
  `M ${COL2_X + BOX_W / 2} ${ROW1_Y + BOX_H} L ${COL2_X + BOX_W / 2} ${ROW2_Y}`,
  `M ${COL2_X} ${ROW2_Y + BOX_H / 2} L ${COL1_X + BOX_W} ${ROW2_Y + BOX_H / 2}`,
  `M ${COL1_X + BOX_W / 2} ${ROW2_Y} L ${COL1_X + BOX_W / 2} ${ROW1_Y + BOX_H}`,
];

export function EngineeringCycleDiagram({ onSelectPhase }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="phase-diagram"
      role="group"
      aria-label="Engineering cycle phases"
    >
      <defs>
        <marker id="cycle-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#8b93a1" />
        </marker>
      </defs>

      {ARROWS.map((d, i) => (
        <path key={i} d={d} className="phase-arrow" markerEnd="url(#cycle-arrowhead)" />
      ))}

      {PHASES.map((phase, i) => {
        const { x, y } = BOX_POS[i];
        const cx = x + BOX_W / 2;
        return (
          <g
            key={phase.key}
            className="phase-box"
            tabIndex={0}
            role="button"
            aria-label={phase.label}
            onClick={() => onSelectPhase(phase.key)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelectPhase(phase.key)}
          >
            <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={18} fill={phase.color} />
            <text x={x + 20} y={y + 42} className="phase-box-number">
              {phase.number}
            </text>
            <text x={cx} y={y + BOX_H / 2 + 8} textAnchor="middle" className="phase-box-label">
              {phase.lines.map((line, li) => (
                <tspan key={li} x={cx} dy={li === 0 ? (phase.lines.length > 1 ? -10 : 0) : 22}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
