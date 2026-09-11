import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationBell } from "./NotificationBell";

export function AppLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isLead = profile.role === "lead";
  const notifications = useNotifications({ role: profile.role, uid: user.uid });

  const base = isLead ? "/lead" : "/student";

  const openNotification = (n) => {
    if (!n.projectId) return;
    // The lead's board isn't split by phase, but a student's is - route
    // straight to the right phase board so the ticket can actually be found.
    const path = isLead || !n.phase ? `${base}/${n.projectId}` : `${base}/${n.projectId}/${n.phase}`;
    navigate(path, { state: { openTicketId: n.ticketId } });
  };

  return (
    <div className="app-shell">
      <nav className="topbar">
        <button type="button" className="brand" onClick={() => navigate(base)}>
          Engineering Ticket Board
        </button>
        <div className="topbar-right">
          <NotificationBell notifications={notifications} onSelectNotification={openNotification} />
          <span className="whoami">{profile.displayName || user.email}</span>
          <button type="button" className="secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </nav>
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}
