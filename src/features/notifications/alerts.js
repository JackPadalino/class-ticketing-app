/**
 * Alert types the lead can switch on/off on the Settings page.
 *   - ALERT_TYPES: [{ key, label, description }].
 *   - isAlertEnabled(alertPrefs, key): missing or anything but false counts as
 *     enabled, so new types need no migration.
 *   - getEnabledAlertTypes(alertPrefs): the enabled keys (used to filter the bell).
 */

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
