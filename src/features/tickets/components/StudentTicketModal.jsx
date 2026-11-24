/**
 * Modal for a student to create a ticket in the project they have open, or (when
 * given `ticket`) to edit one they created. They pick the phase, who the ticket
 * is assigned to (themselves or a classmate) and which other students can see it.
 * The assignee and the creator can always see it, and the lead sees every ticket.
 *   - assignedTo: uid of the assignee (defaults to the student creating it).
 *   - sharedWith: uids of the extra students who can see it.
 *   - submit(): creates the ticket, or saves only the fields that changed.
 *
 * Appears in the following files:
 *   - StudentTicketModal: features/boards/StudentDashboard.jsx (create),
 *       features/tickets/components/TicketDetailModal.jsx (edit)
 */

import { useState } from "react";
import { PHASES } from "../constants/phases";
import { useStudents } from "../../students/useStudents";
import { createTicket, updateStudentTicket } from "../ticketActions";

export function StudentTicketModal({ ticket, projectId, defaultPhase, currentUser, onClose }) {
  const students = useStudents(true);
  const editing = Boolean(ticket);
  const [title, setTitle] = useState(ticket?.title || "");
  const [description, setDescription] = useState(ticket?.description || "");
  const [phase, setPhase] = useState(ticket?.phase || defaultPhase || PHASES[0].key);
  const [dueDate, setDueDate] = useState(ticket?.dueDate || "");
  const [assignedTo, setAssignedTo] = useState(ticket?.assignedTo || currentUser.uid);
  const [sharedWith, setSharedWith] = useState(
    (ticket?.visibleTo || []).filter((id) => id !== ticket.createdBy && id !== ticket.assignedTo)
  );
  const [saving, setSaving] = useState(false);

  const nameOf = (s) => s.displayName || s.email || "";
  const assignee = students.find((s) => s.id === assignedTo);
  // Everyone who can pick "visible to": classmates other than you and the assignee,
  // who already have access.
  const others = students.filter((s) => s.id !== currentUser.uid && s.id !== assignedTo);

  const toggleShared = (uid) =>
    setSharedWith((list) => (list.includes(uid) ? list.filter((id) => id !== uid) : [...list, uid]));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !assignee) return;
    setSaving(true);
    const visibleTo = sharedWith.filter((id) => id !== assignedTo);
    try {
      if (editing) {
        const changes = {};
        if (title.trim() !== ticket.title) changes.title = title.trim();
        if (description.trim() !== (ticket.description || "")) changes.description = description.trim();
        if (phase !== ticket.phase) changes.phase = phase;
        if (dueDate !== (ticket.dueDate || "")) changes.dueDate = dueDate;
        if (assignedTo !== ticket.assignedTo) {
          changes.assignedTo = assignedTo;
          changes.assignedToName = nameOf(assignee);
        }
        changes.visibleTo = visibleTo;
        await updateStudentTicket(ticket, changes);
      } else {
        await createTicket({
          projectId,
          title: title.trim(),
          description: description.trim(),
          phase,
          dueDate,
          assignedTo,
          assignedToName: nameOf(assignee),
          links: [],
          createdBy: currentUser,
          createdByRole: "student",
          visibleTo,
        });
      }
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{editing ? "Edit ticket" : "New ticket"}</h2>

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
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

        <fieldset className="visibility-picker">
          <legend>Who can see this ticket</legend>
          <p className="hint">
            You, {assignee && assignee.id !== currentUser.uid ? `${nameOf(assignee)}, ` : ""}and your lead
            can always see it. Pick anyone else who should be able to see it too.
          </p>
          {others.length === 0 ? (
            <p className="hint">No other students to share with.</p>
          ) : (
            <ul>
              {others.map((s) => (
                <li key={s.id}>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={sharedWith.includes(s.id)}
                      onChange={() => toggleShared(s.id)}
                    />
                    {nameOf(s)}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <label>
          Assign to
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id === currentUser.uid ? `${nameOf(s)} (me)` : nameOf(s)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Due date (optional)
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>

        <div className="modal-actions">
          <button type="submit" disabled={saving || !title.trim() || !assignee}>
            {saving ? (editing ? "Saving..." : "Creating...") : editing ? "Save changes" : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
