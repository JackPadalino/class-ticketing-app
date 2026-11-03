/**
 *   - isStudentStatusUpdateAllowed(settings): whether students may change ticket
 *     status. Missing/undefined counts as allowed (opt-out setting).
 *
 * Appears in the following files:
 *   - isStudentStatusUpdateAllowed: features/settings/Settings.jsx,
 *       features/tickets/components/TicketDetailModal.jsx
 */

// Class-wide admin setting (settings/global.allowStudentStatusUpdates) -
// missing/undefined counts as enabled, same opt-out pattern as alertPrefs.
export function isStudentStatusUpdateAllowed(settings) {
  return settings?.allowStudentStatusUpdates !== false;
}
