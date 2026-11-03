/**
 * Due date helpers. dueDate is stored as a plain "YYYY-MM-DD" string.
 *   - formatDueDate(dueDate): local-date display string (avoids the off-by-one-day
 *     bug you get from parsing the string as UTC).
 *   - isOverdue(dueDate, status): true if the date has passed and the ticket
 *     isn't completed.
 *
 * Where things are used:
 *   - formatDueDate: features/tickets/components/TicketCard.jsx,
 *       features/tickets/components/TicketDetailModal.jsx
 *   - isOverdue: features/tickets/components/TicketCard.jsx,
 *       features/tickets/components/TicketDetailModal.jsx
 */

import { STATUS } from "../constants/status";

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
