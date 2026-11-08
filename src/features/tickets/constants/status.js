/**
 * Ticket status vocabulary and the board's column layout.
 *   - STATUS: every status value stored on a ticket (ready_to_start, in_progress,
 *     ready_for_review, needs_revision, need_support, completed, closed).
 *   - COLUMNS: the five board columns and which statuses land in each.
 *     needs_revision and need_support show in the In Progress column.
 *   - STUDENT_STATUS_OPTIONS: what a student can choose in their status dropdown.
 *   - LEAD_STATUS_OPTIONS: the student options plus Needs revisions, Approve and Close.
 *   - isLockedForStudent(ticket): true once a ticket is completed or closed -
 *     the student can no longer change its status, links or (if closed) comments.
 *   - getStatusLabel(ticket): the badge text ("Need support" / "Needs revision")
 *     or null when no badge applies.
 *
 * Appears in the following files:
 *   - STATUS: features/tickets/components/TicketCard.jsx,
 *       features/tickets/components/TicketDetailModal.jsx, features/tickets/ticketActions.js,
 *       features/tickets/utils/dueDate.js; also inside this file by COLUMNS,
 *       STUDENT_STATUS_OPTIONS, LEAD_STATUS_OPTIONS, getStatusLabel
 *   - COLUMNS: features/tickets/components/TicketBoard.jsx
 *   - STUDENT_STATUS_OPTIONS: features/tickets/components/TicketDetailModal.jsx; also inside
 *       this file by LEAD_STATUS_OPTIONS
 *   - LEAD_STATUS_OPTIONS: features/tickets/components/TicketDetailModal.jsx
 *   - getStatusLabel: features/tickets/components/TicketCard.jsx,
 *       features/tickets/components/TicketDetailModal.jsx
 *   - isLockedForStudent: features/tickets/components/TicketDetailModal.jsx
 */

export const STATUS = {
  READY_TO_START: "ready_to_start",
  IN_PROGRESS: "in_progress",
  READY_FOR_REVIEW: "ready_for_review",
  NEEDS_REVISION: "needs_revision",
  NEED_SUPPORT: "need_support",
  COMPLETED: "completed",
  CLOSED: "closed",
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
  { key: "closed", title: "Closed", statuses: [STATUS.CLOSED] },
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
// Needs revisions, Approve and Close. Close is the lead's way of locking
// a ticket for good: the student can't change anything on it anymore
// (status, links, or comments - enforced in firestore.rules too). Selecting either still routes through
// the same requestRevision()/approveTicket() the old review buttons
// used (reviewedBy/reviewedAt, history, and the student notification
// all stay consistent regardless of which control triggered it).
export const LEAD_STATUS_OPTIONS = [
  ...STUDENT_STATUS_OPTIONS,
  { value: STATUS.NEEDS_REVISION, label: "Needs revisions" },
  { value: STATUS.COMPLETED, label: "Approve" },
  { value: STATUS.CLOSED, label: "Close" },
];

export function isLockedForStudent(ticket) {
  return ticket.status === STATUS.COMPLETED || ticket.status === STATUS.CLOSED;
}

export function getStatusLabel(ticket) {
  if (ticket.status === STATUS.NEED_SUPPORT) return "Need support";
  if (ticket.needsRevision && !isLockedForStudent(ticket)) return "Needs revision";
  return null;
}
