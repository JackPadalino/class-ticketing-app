import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../hooks/useTickets";
import { TicketBoard } from "../components/TicketBoard";

export function StudentDashboard() {
  const { user, profile } = useAuth();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, loading } = useTickets({ projectId, uid: user.uid, isLead: false });
  const [project, setProject] = useState(null);
  const [openTicketId, setOpenTicketId] = useState(location.state?.openTicketId || null);

  useEffect(() => {
    return onSnapshot(doc(db, "projects", projectId), (snap) => {
      setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  }, [projectId]);

  const currentUser = { uid: user.uid, email: user.email, displayName: profile.displayName };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/student")}>
            ← All projects
          </button>
          <h1>{project?.name || "My Tickets"}</h1>
          {project?.description && <p className="project-description">{project.description}</p>}
        </div>
      </header>

      {loading ? (
        <p className="loading">Loading tickets...</p>
      ) : (
        <TicketBoard
          tickets={tickets}
          isLead={false}
          currentUser={currentUser}
          openTicketId={openTicketId}
          onOpenTicket={setOpenTicketId}
          onCloseTicket={() => setOpenTicketId(null)}
        />
      )}
    </div>
  );
}
