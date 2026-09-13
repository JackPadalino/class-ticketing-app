export const STATUS = {
  READY_TO_START: "ready_to_start",
  IN_PROGRESS: "in_progress",
  READY_FOR_REVIEW: "ready_for_review",
  NEEDS_REVISION: "needs_revision",
  COMPLETED: "completed",
};

export const COLUMNS = [
  { key: "ready_to_start", title: "Ready to Start", statuses: [STATUS.READY_TO_START] },
  {
    key: "in_progress",
    title: "In Progress",
    statuses: [STATUS.IN_PROGRESS, STATUS.NEEDS_REVISION],
  },
  { key: "in_review", title: "In Review", statuses: [STATUS.READY_FOR_REVIEW] },
  { key: "completed", title: "Completed", statuses: [STATUS.COMPLETED] },
];

// Statuses students can pick from the status dropdown. Ready for review
// lands in its own "In Review" column, ready to start / in progress /
// completed are each their own column too, so none of those need a
// badge on top - "Needs revision" is the only badge, since it's a
// sub-state hiding inside the shared "In Progress" column. It sticks
// around through the whole revise-and-resubmit cycle (ticket.needsRevision
// stays true even after the student moves it back to ready_for_review)
// so it doesn't quietly look like a first-time review request - it only
// clears once the lead approves.
export const STUDENT_STATUS_OPTIONS = [
  { value: STATUS.READY_TO_START, label: "Ready to start" },
  { value: STATUS.IN_PROGRESS, label: "In progress" },
  { value: STATUS.READY_FOR_REVIEW, label: "Ready for review" },
];

export function getStatusLabel(ticket) {
  if (ticket.needsRevision && ticket.status !== STATUS.COMPLETED) return "Needs revision";
  return null;
}

// The four phases of "The Engineering Cycle" - each project gives every
// student one separate Kanban board per phase. ticket.phase stores the
// key; number/color/label drive the phase-picker wheel and badges.
export const PHASES = [
  {
    key: "planning",
    number: 1,
    label: "Planning & Architecture",
    lines: ["Planning &", "Architecture"],
    color: "#a11d33",
  },
  {
    key: "design",
    number: 2,
    label: "UI/UX Design",
    lines: ["UI/UX", "Design"],
    color: "#1d3f72",
  },
  {
    key: "development",
    number: 3,
    label: "Development",
    lines: ["Development"],
    color: "#1a8a7a",
  },
  {
    key: "testing",
    number: 4,
    label: "Testing & Review",
    lines: ["Testing &", "Review"],
    color: "#d4a017",
  },
];

export function getPhase(key) {
  return PHASES.find((p) => p.key === key);
}

export function getPhaseLabel(key) {
  return getPhase(key)?.label || key;
}

// Alert types the lead can toggle on/off from their Dashboard. Missing
// from a lead's `alertPrefs` (or set to anything but `false`) counts as
// enabled, so nothing needs a migration when a new type is added here.
export const ALERT_TYPES = [
  {
    key: "ready_for_review",
    label: "Ready for review",
    description: "A student marks one of their tickets ready for your review.",
  },
  {
    key: "student_comment",
    label: "Student comments",
    description: "A student leaves a comment on one of their tickets.",
  },
];

export function isAlertEnabled(alertPrefs, key) {
  return alertPrefs?.[key] !== false;
}

export function getEnabledAlertTypes(alertPrefs) {
  return ALERT_TYPES.filter((t) => isAlertEnabled(alertPrefs, t.key)).map((t) => t.key);
}
