/**
 * The lead's board for one project (/lead/:projectId): all students' tickets in
 * the four status columns.
 *   - studentFilter: "all" or a student uid; narrows the board to one student.
 *   - openTicketId: which ticket's detail modal is open.
 *   - Navigation effect: when a notification is clicked, the router passes
 *     { openTicketId, studentId }; the effect opens that ticket and applies the
 *     student filter, then clears the router state. It runs on every navigation
 *     so it also works when already on this board.
 *   - "+ New ticket" opens CreateTicketModal (any project, one student or all).
 *
 * Where things are used:
 *   - LeadDashboard: App.jsx
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../auth/AuthContext";
import { useTickets } from "../tickets/hooks/useTickets";
import { useStudents } from "../students/useStudents";
import { useProjects } from "../projects/useProjects";
import { TicketBoard } from "../tickets/components/TicketBoard";
import { CreateTicketModal } from "../tickets/components/CreateTicketModal";

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
  const [studentFilter, setStudentFilter] = useState(location.state?.studentId || "all");

  // Clicking a notification navigates here (possibly while already on this
  // page, or on another project's board), so react to every new navigation
  // rather than only reading the state on first render.
  useEffect(() => {
    if (!location.state?.openTicketId) return;
    setOpenTicketId(location.state.openTicketId);
    if (location.state.studentId) setStudentFilter(location.state.studentId);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key]);

  useEffect(() => {
    return onSnapshot(doc(db, "projects", projectId), (snap) => {
      setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  }, [projectId]);

  const currentUser = { uid: user.uid, email: user.email, displayName: profile.displayName };

  const visibleTickets =
    studentFilter === "all" ? tickets : tickets.filter((t) => t.assignedTo === studentFilter);

  const selectedStudent = students.find((s) => s.id === studentFilter);
  const studentLabel = (s) => `${s.displayName}`;
  const boardScopeLabel = studentFilter === "all" ? "All students" : selectedStudent ? studentLabel(selectedStudent) : "Student";

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
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
        <p className="loading">Incoming tickets...</p>
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
