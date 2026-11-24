/**
 * The one ticket form, used by both roles to create a ticket and by a student to
 * edit a ticket they created (pass `ticket`). Every field is required.
 *   Lead:    also picks the project and can assign to one student or "All students"
 *            (a separate copy on every student's board).
 *   Student: creates in the project they have open and assigns to themselves or a
 *            classmate.
 * Both can choose which other students can see the ticket (hidden for "All
 * students", where each copy already goes to its own student). The assignee and,
 * for a student, the creator can always see it, and the lead sees every ticket.
 *   - ALL_STUDENTS: sentinel value for the lead's "all" option.
 *   - target: uid of the assignee, or ALL_STUDENTS.
 *   - sharedWith: uids of the extra students who can see it.
 *   - submit(): creates one ticket per target student, or saves only the fields
 *     that changed when editing, then closes.
 *
 * Appears in the following files:
 *   - TicketFormModal: features/boards/LeadDashboard.jsx (create),
 *       features/boards/StudentDashboard.jsx (create),
 *       features/tickets/components/TicketDetailModal.jsx (student edit)
 *   - Local helpers (only used in this file): ALL_STUDENTS
 */

import { useState } from "react";
import { PHASES } from "../constants/phases";
import { useStudents } from "../../students/useStudents";
import { createTicket, updateStudentTicket } from "../ticketActions";

const ALL_STUDENTS = "all";

export function TicketFormModal({
  isLead,
  ticket,
  projects = [],
  defaultProjectId,
  defaultPhase,
  defaultTarget,
  currentUser,
  onClose,
  onCreated,
}) {
  const students = useStudents(true);
  const editing = Boolean(ticket);
  const [projectId, setProjectId] = useState(ticket?.projectId || defaultProjectId || projects[0]?.id || "");
  const [target, setTarget] = useState(
    ticket?.assignedTo || defaultTarget || (isLead ? ALL_STUDENTS : currentUser.uid)
  );
  const [title, setTitle] = useState(ticket?.title || "");
  const [description, setDescription] = useState(ticket?.description || "");
  const [phase, setPhase] = useState(ticket?.phase || defaultPhase || PHASES[0].key);
  const [dueDate, setDueDate] = useState(ticket?.dueDate || "");
  const [sharedWith, setSharedWith] = useState(
    (ticket?.visibleTo || []).filter((id) => id !== ticket.createdBy && id !== ticket.assignedTo)
  );
  const [saving, setSaving] = useState(false);

  const nameOf = (s) => s.displayName || s.email || "";
  const forEveryone = isLead && target === ALL_STUDENTS;
  const targetStudents = forEveryone ? students : students.filter((s) => s.id === target);
  const assignee = forEveryone ? null : targetStudents[0];
  // Students who can be ticked under "who can see this": everyone but the
  // creator and the assignee, who already have access.
  const others = students.filter((s) => s.id !== currentUser.uid && s.id !== target);
  const allOthersChosen = others.length > 0 && others.every((s) => sharedWith.includes(s.id));
  const someOthersChosen = others.some((s) => sharedWith.includes(s.id));
  const canSubmit =
    title.trim() && description.trim() && dueDate && projectId && targetStudents.length > 0;

  const toggleShared = (uid) =>
    setSharedWith((list) => (list.includes(uid) ? list.filter((id) => id !== uid) : [...list, uid]));

  const toggleAll = () =>
    setSharedWith((list) =>
      allOthersChosen
        ? list.filter((id) => !others.some((s) => s.id === id))
        : [...new Set([...list, ...others.map((s) => s.id)])]
    );

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    const visibleTo = forEveryone ? [] : sharedWith.filter((id) => id !== target);
    try {
      if (editing) {
        const changes = {};
        if (title.trim() !== ticket.title) changes.title = title.trim();
        if (description.trim() !== (ticket.description || "")) changes.description = description.trim();
        if (phase !== ticket.phase) changes.phase = phase;
        if (dueDate !== (ticket.dueDate || "")) changes.dueDate = dueDate;
        if (target !== ticket.assignedTo) {
          changes.assignedTo = target;
          changes.assignedToName = nameOf(assignee);
        }
        changes.visibleTo = visibleTo;
        await updateStudentTicket(ticket, changes);
      } else {
        await Promise.all(
          targetStudents.map((student) =>
            createTicket({
              projectId,
              title: title.trim(),
              description: description.trim(),
              phase,
              dueDate,
              assignedTo: student.id,
              assignedToName: nameOf(student),
              links: [],
              createdBy: currentUser,
              createdByRole: isLead ? "lead" : "student",
              visibleTo,
            })
          )
        );
        onCreated?.(projectId);
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

        {isLead && !editing && (
          <label>
            Project
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>

        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
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

        {!forEveryone && (
          <fieldset className="visibility-picker">
            <legend>Who can see this ticket</legend>
            <p className="hint">
              {isLead
                ? `${assignee ? `${nameOf(assignee)} can` : "The assignee can"} always see it, and you see every ticket.`
                : `You, ${assignee && assignee.id !== currentUser.uid ? `${nameOf(assignee)}, ` : ""}and your lead can always see it.`}{" "}
              Pick anyone else who should be able to see it too.
            </p>
            {others.length === 0 ? (
              <p className="hint">No other students to share with.</p>
            ) : (
              <ul>
                <li>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={allOthersChosen}
                      ref={(el) => {
                        if (el) el.indeterminate = someOthersChosen && !allOthersChosen;
                      }}
                      onChange={toggleAll}
                    />
                    <strong>Select all</strong>
                  </label>
                </li>
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
        )}

        <label>
          Assign to
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            {isLead && <option value={ALL_STUDENTS}>All students</option>}
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id === currentUser.uid ? `${nameOf(s)} (me)` : nameOf(s)}
              </option>
            ))}
          </select>
        </label>
        {forEveryone && (
          <p className="hint">This creates a separate copy of this ticket on every student's board.</p>
        )}

        <label>
          Due date
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </label>

        <div className="modal-actions">
          <button type="submit" disabled={saving || !canSubmit}>
            {saving ? (editing ? "Saving..." : "Creating...") : editing ? "Save changes" : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
