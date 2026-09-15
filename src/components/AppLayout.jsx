import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";

export function AppLayout() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isLead = profile.role === "lead";
  const notifications = useNotifications({ role: profile.role, uid: user.uid, alertPrefs: profile.alertPrefs });

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
      <div className="marquee-bar" aria-hidden="true">
        <div className="marquee-track">
          ✨🚧 WELCOME TO THE AMS SWE TICKET BOARD 🚧✨ &nbsp; BEST VIEWED AT 800x600 &nbsp; ⭐ SIGN OUR GUESTBOOK ⭐
          &nbsp; 🔥 NOW WITH 100% MORE TICKETS 🔥 &nbsp; ✨🚧 WELCOME TO THE AMS SWE TICKET BOARD 🚧✨ &nbsp; BEST
          VIEWED AT 800x600 &nbsp; ⭐ SIGN OUR GUESTBOOK ⭐ &nbsp; 🔥 NOW WITH 100% MORE TICKETS 🔥
        </div>
      </div>
      <nav className="topbar">
        <button type="button" className="brand" onClick={() => navigate(base)}>
          AMS SWE 2026-2027 Ticket Board
        </button>
        <div className="topbar-right">
          <NotificationBell notifications={notifications} onSelectNotification={openNotification} />
          <UserMenu displayName={profile.displayName} email={user.email} isLead={isLead} onSignOut={logout} />
        </div>
      </nav>
      <div className="app-content">
        <Outlet />
      </div>
      <footer className="retro-footer">
        <span className="blink">UNDER CONSTRUCTION</span>
        <span className="retro-footer-sep">•</span>
        <span>Best viewed in Netscape Navigator 4.0</span>
        <span className="retro-footer-sep">•</span>
        <span className="hit-counter" title="totally real visitor count">
          YOU ARE VISITOR #{"0" + "0" + "0" + "1" + "3" + "3" + "7"}
        </span>
      </footer>
    </div>
  );
}
