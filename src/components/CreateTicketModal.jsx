import { useState } from "react";
import { PHASES } from "../constants";
import { createTicket } from "../ticketActions";

export function CreateTicketModal({ projectId, student, currentUser, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState(PHASES[0].key);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await createTicket({
        projectId,
        title: title.trim(),
        description: description.trim(),
        phase,
        assignedTo: student.id,
        assignedToName: student.displayName || student.email || "",
        links: [],
        createdBy: currentUser,
      });
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
        <h2>New ticket for {student.displayName || student.email}</h2>

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

        <div className="modal-actions">
          <button type="submit" disabled={saving}>
            Create ticket
          </button>
        </div>
      </form>
    </div>
  );
}
