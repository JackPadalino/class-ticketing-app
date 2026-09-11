import { useState } from "react";
import { createProject, updateProject } from "../ticketActions";

export function ProjectModal({ leadUid, project, onClose, onSaved }) {
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateProject(project.id, { name: trimmedName, description: description.trim() });
        onSaved(project.id);
      } else {
        const projectId = await createProject({
          name: trimmedName,
          description: description.trim(),
          createdBy: leadUid,
        });
        onSaved(projectId);
      }
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
        <h2>{isEdit ? "Edit project" : "New project"}</h2>
        {!isEdit && (
          <p className="hint" style={{ marginBottom: 12 }}>
            Every student automatically gets their own blank board for this project.
          </p>
        )}
        <label>
          Project name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprint 2: Weather App"
            autoFocus
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about? (optional)"
            rows={3}
          />
        </label>
        <div className="modal-actions">
          <button type="submit" disabled={saving}>
            {isEdit ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </div>
  );
}
