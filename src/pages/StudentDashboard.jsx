import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useTickets } from "../hooks/useTickets";
import { TicketBoard } from "../components/TicketBoard";
import { getPhase } from "../constants";

export function StudentDashboard() {
  const { user, profile } = useAuth();
  const { projectId, phase } = useParams();
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
  const phaseInfo = getPhase(phase);
  const phaseTickets = tickets.filter((t) => t.phase === phase);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate(`/student/${projectId}`)}>
            ← {project?.name || "Project"}
          </button>
          <h1>{phaseInfo?.label || "Tickets"}</h1>
        </div>
      </header>

      {loading ? (
        <p className="loading">Loading tickets...</p>
      ) : (
        <TicketBoard
          tickets={phaseTickets}
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
