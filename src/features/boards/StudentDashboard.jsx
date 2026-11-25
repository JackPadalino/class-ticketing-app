/**
 * A student's board for one phase of one project (/student/:projectId/:phase):
 * the tickets assigned to or shared with that student in that phase, in the
 * status columns, plus a "+ New ticket" button so students can create their own.
 *   - openTicketId + navigation effect: opens the ticket modal when arriving from
 *     a notification (router state { openTicketId }).
 *
 * Appears in the following files:
 *   - StudentDashboard: App.jsx
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../auth/AuthContext";
import { useTickets } from "../tickets/hooks/useTickets";
import { TicketBoard } from "../tickets/components/TicketBoard";
import { TicketFormModal } from "../tickets/components/TicketFormModal";
import { getPhase } from "../tickets/constants/phases";

export function StudentDashboard() {
  const { user, profile } = useAuth();
  const { projectId, phase } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tickets, loading } = useTickets({ projectId, uid: user.uid, isLead: false });
  const [project, setProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(location.state?.openTicketId || null);

  useEffect(() => {
    if (!location.state?.openTicketId) return;
    setOpenTicketId(location.state.openTicketId);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.key]);

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
        <div className="header-right">
          <button type="button" onClick={() => setShowCreate(true)}>
            + New ticket
          </button>
        </div>
      </header>

      {loading ? (
        <p className="loading">Incoming tickets...</p>
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

      {showCreate && (
        <TicketFormModal
          isLead={false}
          defaultProjectId={projectId}
          defaultPhase={phase}
          currentUser={currentUser}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}
