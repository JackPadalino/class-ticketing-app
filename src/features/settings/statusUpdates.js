/**
 *   - isStudentStatusUpdateAllowed(settings): whether students may change ticket
 *     status. Missing/undefined counts as allowed (opt-out setting).
 */

// Class-wide admin setting (settings/global.allowStudentStatusUpdates) -
// missing/undefined counts as enabled, same opt-out pattern as alertPrefs.
export function isStudentStatusUpdateAllowed(settings) {
  return settings?.allowStudentStatusUpdates !== false;
}
