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

export const ENGINEERING_PHASES = [
  "Planning",
  "Design",
  "Development",
  "Testing & QA",
  "Code Review",
  "Deployment",
];
