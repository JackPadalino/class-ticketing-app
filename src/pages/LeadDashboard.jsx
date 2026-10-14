import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../hooks/useTickets";
import { useStudents } from "../hooks/useStudents";
import { useProjects } from "../hooks/useProjects";
import { TicketBoard } from "../components/TicketBoard";
import { CreateTicketModal } from "../components/CreateTicketModal";

export function LeadDashboard() {
  const { user, profile } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, loading } = useTickets({ projectId, uid: user.uid, isLead: true });
  const students = useStudents(true);
  const { projects } = useProjects();
  const [project, setProject] = useState(null);
  const [openTicketId, setOpenTicketId] = useState(location.state?.openTicketId || null);
  const [showCreate, setShowCreate] = useState(false);
  const [studentFilter, setStudentFilter] = useState("all");

  useEffect(() => {
    return onSnapshot(doc(db, "projects", projectId), (snap) => {
      setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  }, [projectId]);

  const currentUser = { uid: user.uid, email: user.email, displayName: profile.displayName };

  const visibleTickets =
    studentFilter === "all" ? tickets : tickets.filter((t) => t.assignedTo === studentFilter);

  const selectedStudent = students.find((s) => s.id === studentFilter);
  const studentLabel = (s) => `${s.displayName || s.email}${s.assignedApp ? ` — ${s.assignedApp}` : ""}`;
  const boardScopeLabel = studentFilter === "all" ? "All students" : selectedStudent ? studentLabel(selectedStudent) : "Student";

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/lead")}>
            ← All projects
          </button>
          <h1>{project?.name || "Tickets"}</h1>
          {project?.description && <p className="project-description">{project.description}</p>}
        </div>
        <div className="header-right">
          <select value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}>
            <option value="all">All students</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.displayName || s.email}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => setShowCreate(true)}>
            + New ticket
          </button>
        </div>
      </header>

      <h2 className="board-scope">{boardScopeLabel}</h2>

      {loading ? (
        <p className="loading">Loading tickets...</p>
      ) : (
        <TicketBoard
          tickets={visibleTickets}
          isLead={true}
          currentUser={currentUser}
          openTicketId={openTicketId}
          onOpenTicket={setOpenTicketId}
          onCloseTicket={() => setOpenTicketId(null)}
        />
      )}

      {showCreate && (
        <CreateTicketModal
          projects={projects}
          defaultProjectId={projectId}
          students={students}
          defaultTarget={studentFilter === "all" ? "all" : studentFilter}
          currentUser={currentUser}
          onClose={() => setShowCreate(false)}
          onCreated={(createdProjectId) => {
            if (createdProjectId !== projectId) navigate(`/lead/${createdProjectId}`);
          }}
        />
      )}
    </div>
  );
}
