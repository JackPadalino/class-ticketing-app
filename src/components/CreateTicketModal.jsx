import { useState } from "react";
import { PHASES } from "../constants";
import { createTicket } from "../ticketActions";

const ALL_STUDENTS = "all";

export function CreateTicketModal({ projects, defaultProjectId, students, defaultTarget, currentUser, onClose, onCreated }) {
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || "");
  const [target, setTarget] = useState(defaultTarget || ALL_STUDENTS);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState(PHASES[0].key);
  const [saving, setSaving] = useState(false);

  const targetStudents =
    target === ALL_STUDENTS ? students : students.filter((s) => s.id === target);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId || targetStudents.length === 0) return;
    setSaving(true);
    try {
      await Promise.all(
        targetStudents.map((student) =>
          createTicket({
            projectId,
            title: title.trim(),
            description: description.trim(),
            phase,
            assignedTo: student.id,
            assignedToName: student.displayName || student.email || "",
            links: [],
            createdBy: currentUser,
          })
        )
      );
      onCreated?.(projectId);
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
        <h2>New ticket</h2>

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

        <label>
          Assign to
          <select value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value={ALL_STUDENTS}>All students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName || s.email}
              </option>
            ))}
          </select>
        </label>
        {target === ALL_STUDENTS && (
          <p className="hint">This creates a separate copy of this ticket on every student's board.</p>
        )}

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
          <button type="submit" disabled={saving || !projectId || targetStudents.length === 0}>
            {saving ? "Creating..." : "Create ticket"}
          </button>
        </div>
      </form>
    </div>
  );
}
