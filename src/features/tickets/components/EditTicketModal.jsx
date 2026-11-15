/**
 * Modal for the lead to edit a ticket's title, description, phase, status and due
 * date. The "Apply changes to" choice is this one ticket, or every copy of it
 * across students (found by project + title + phase).
 *   - changes: only the fields actually edited, so applying to everyone doesn't
 *     overwrite per-student differences (e.g. a student's own description).
 *   - status: kept apart from `changes` because it goes through the lead's
 *     status flow (updateTicketStatusForCopies) so Approve and Needs revisions
 *     still log history and notify the student. It is applied before the other
 *     fields, while the copies can still be found by their old title/phase.
 *   - matchCount: how many copies exist, shown in the dropdown.
 *
 * Appears in the following files:
 *   - EditTicketModal: features/tickets/components/TicketDetailModal.jsx
 */

import { useEffect, useState } from "react";
import { PHASES } from "../constants/phases";
import { LEAD_STATUS_OPTIONS } from "../constants/status";
import { findMatchingTickets, updateTicketDetails, updateTicketStatusForCopies } from "../ticketActions";

export function EditTicketModal({ ticket, currentUser, onClose }) {
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description || "");
  const [phase, setPhase] = useState(ticket.phase);
  const [status, setStatus] = useState(ticket.status);
  const [dueDate, setDueDate] = useState(ticket.dueDate || "");
  const [scope, setScope] = useState("one");
  const [matchCount, setMatchCount] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    findMatchingTickets(ticket).then((m) => setMatchCount(m.length));
  }, [ticket.projectId, ticket.title, ticket.phase]);

  const changes = {};
  if (title.trim() !== ticket.title) changes.title = title.trim();
  if (description.trim() !== (ticket.description || "")) changes.description = description.trim();
  if (phase !== ticket.phase) changes.phase = phase;
  if (dueDate !== (ticket.dueDate || "")) changes.dueDate = dueDate;
  const statusChanged = status !== ticket.status;
  const hasChanges = Object.keys(changes).length > 0 || statusChanged;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !hasChanges) return;
    setSaving(true);
    try {
      const applyToAll = scope === "all";
      if (statusChanged) await updateTicketStatusForCopies(ticket, currentUser, status, applyToAll);
      if (Object.keys(changes).length > 0) await updateTicketDetails(ticket, changes, applyToAll);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const othersCount = matchCount === null ? null : matchCount - 1;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>Edit ticket</h2>

        <label>
          Apply changes to
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="one">Only this ticket ({ticket.assignedToName})</option>
            <option value="all" disabled={othersCount === 0}>
              {matchCount === null
                ? "All students' copies of this ticket"
                : `All ${matchCount} copies of this ticket (every student)`}
            </option>
          </select>
        </label>
        {scope === "all" && (
          <p className="hint">
            Only the fields you change are updated, so anything you leave alone (like a student's own
            description) stays as it is. Changing the status moves every copy to it, and each student
            is notified as usual.
          </p>
        )}

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
        </label>

        <label>
          Phase
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            {PHASES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {LEAD_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <div className="modal-actions">
          <button type="submit" disabled={saving || !hasChanges || !title.trim()}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
