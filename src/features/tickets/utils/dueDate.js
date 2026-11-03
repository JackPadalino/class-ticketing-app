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
