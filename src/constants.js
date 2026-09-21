export const STATUS = {
  READY_TO_START: "ready_to_start",
  IN_PROGRESS: "in_progress",
  READY_FOR_REVIEW: "ready_for_review",
  NEEDS_REVISION: "needs_revision",
  NEED_SUPPORT: "need_support",
  COMPLETED: "completed",
};

export const COLUMNS = [
  { key: "ready_to_start", title: "Ready to Start", statuses: [STATUS.READY_TO_START] },
  {
    key: "in_progress",
    title: "In Progress",
    statuses: [STATUS.IN_PROGRESS, STATUS.NEEDS_REVISION, STATUS.NEED_SUPPORT],
  },
  { key: "in_review", title: "In Review", statuses: [STATUS.READY_FOR_REVIEW] },
  { key: "completed", title: "Completed", statuses: [STATUS.COMPLETED] },
];

// Statuses students can pick from the status dropdown. Ready for review
// lands in its own "In Review" column, ready to start / in progress /
// completed are each their own column too, so none of those need a
// badge on top - "Needs revision" and "Need support" are the only
// badges, since they're sub-states hiding inside the shared "In
// Progress" column. "Needs revision" sticks around through the whole
// revise-and-resubmit cycle (ticket.needsRevision stays true even
// after the student moves it back to ready_for_review) so it doesn't
// quietly look like a first-time review request - it only clears once
// the lead approves. "Need support" requires a comment to switch into
// (see markNeedSupport in ticketActions.js) so the lead always has
// context for why a student is stuck.
export const STUDENT_STATUS_OPTIONS = [
  { value: STATUS.READY_TO_START, label: "Ready to start" },
  { value: STATUS.IN_PROGRESS, label: "In progress" },
  { value: STATUS.READY_FOR_REVIEW, label: "Ready for review" },
  { value: STATUS.NEED_SUPPORT, label: "Need support" },
];

// The lead's own status dropdown - everything a student can pick, plus
// Completed. Selecting Completed still routes through the same
// approveTicket() the Approve button uses (reviewedBy/reviewedAt,
// history, and the student notification all stay consistent regardless
// of which control triggered it).
export const LEAD_STATUS_OPTIONS = [
  ...STUDENT_STATUS_OPTIONS,
  { value: STATUS.COMPLETED, label: "Completed" },
];

export function getStatusLabel(ticket) {
  if (ticket.status === STATUS.NEED_SUPPORT) return "Need support";
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
    color: "#ff0000",
  },
  {
    key: "design",
    number: 2,
    label: "UI/UX Design",
    lines: ["UI/UX", "Design"],
    color: "#ffb8ff",
  },
  {
    key: "development",
    number: 3,
    label: "Development",
    lines: ["Development"],
    color: "#00ffff",
  },
  {
    key: "testing",
    number: 4,
    label: "Testing & Review",
    lines: ["Testing &", "Review"],
    color: "#ffb852",
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
  {
    key: "need_support",
    label: "Need support",
    description: "A student marks one of their tickets \"Need support.\"",
  },
];

export function isAlertEnabled(alertPrefs, key) {
  return alertPrefs?.[key] !== false;
}

export function getEnabledAlertTypes(alertPrefs) {
  return ALERT_TYPES.filter((t) => isAlertEnabled(alertPrefs, t.key)).map((t) => t.key);
}

// dueDate is stored as a plain "YYYY-MM-DD" string. Parsing it with an
// explicit local midnight (rather than `new Date(dueDate)`, which Date
// treats as UTC midnight) avoids it displaying as the day before in
// negative-UTC-offset timezones like the US.
export function formatDueDate(dueDate) {
  if (!dueDate) return "";
  return new Date(`${dueDate}T00:00:00`).toLocaleDateString();
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === STATUS.COMPLETED) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${dueDate}T00:00:00`) < today;
}

// Class-wide admin setting (settings/global.allowStudentStatusUpdates) -
// missing/undefined counts as enabled, same opt-out pattern as alertPrefs.
export function isStudentStatusUpdateAllowed(settings) {
  return settings?.allowStudentStatusUpdates !== false;
}
