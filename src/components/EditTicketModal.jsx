import { useEffect, useState } from "react";
import { PHASES } from "../constants";
import { findMatchingTickets, updateTicketDetails } from "../ticketActions";

export function EditTicketModal({ ticket, onClose }) {
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description || "");
  const [phase, setPhase] = useState(ticket.phase);
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
  const hasChanges = Object.keys(changes).length > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !hasChanges) return;
    setSaving(true);
    try {
      await updateTicketDetails(ticket, changes, scope === "all");
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
            description) stays as it is.
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
