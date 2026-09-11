import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";
import { ProjectModal } from "../components/ProjectModal";
import { deleteProjectCascade } from "../ticketActions";

function formatDate(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleDateString();
}

export function ProjectsList({ isLead }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const base = isLead ? "/lead" : "/student";

  const handleDelete = async (e, project) => {
    e.stopPropagation();
    setOpenMenuId(null);
    const confirmed = window.confirm(
      `Delete "${project.name}"? This permanently deletes every ticket, comment, and history entry in it, for every student. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(project.id);
    try {
      await deleteProjectCascade(project.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Projects</h1>
        {isLead && (
          <div className="header-right">
            <button type="button" onClick={() => setShowCreate(true)}>
              + New project
            </button>
          </div>
        )}
      </header>

      {loading ? (
        <p className="loading">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="loading">
          {isLead ? "No projects yet — create one to get started." : "No projects yet. Check back soon."}
        </p>
      ) : (
        <div className="project-list">
          {projects.map((p) => (
            <div key={p.id} className="project-card">
              <button type="button" className="project-card-main" onClick={() => navigate(`${base}/${p.id}`)}>
                <h3>{p.name}</h3>
                {p.description && <p className="project-card-description">{p.description}</p>}
                <p className="project-card-meta">Created {formatDate(p.createdAt)}</p>
              </button>
              {isLead && (
                <div className="project-menu">
                  <button
                    type="button"
                    className="project-menu-toggle"
                    disabled={deletingId === p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((id) => (id === p.id ? null : p.id));
                    }}
                  >
                    {deletingId === p.id ? "…" : "⋯"}
                  </button>
                  {openMenuId === p.id && (
                    <div className="project-menu-dropdown">
                      <button
                        type="button"
                        className="project-menu-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          setEditingProject(p);
                        }}
                      >
                        Edit
                      </button>
                      <button type="button" className="project-menu-item" disabled title="Coming soon">
                        Archive
                      </button>
                      <button
                        type="button"
                        className="project-menu-item danger"
                        onClick={(e) => handleDelete(e, p)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <ProjectModal
          leadUid={user.uid}
          onClose={() => setShowCreate(false)}
          onSaved={(projectId) => {
            setShowCreate(false);
            navigate(`${base}/${projectId}`);
          }}
        />
      )}

      {editingProject && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSaved={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}
