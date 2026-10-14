import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { FoodFloaters } from "./FoodFloaters";

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
      <div className="scanlines" aria-hidden="true" />
      <FoodFloaters />
      <div className="marquee-bar" aria-hidden="true">
        <span className="marquee-sprite">🍕</span>
        <div className="marquee-viewport">
          <div className="marquee-track">
            🍿 ORDER UP 🍔 WELCOME TO THE AMS SWE SNACK BAR 🍟 TAKE A TICKET 🍩 FRESH BATCH READY 🌭 EXTRA CHEESE
            🍿 ORDER UP 🍔 WELCOME TO THE AMS SWE SNACK BAR 🍟 TAKE A TICKET 🍩 FRESH BATCH READY 🌭 EXTRA CHEESE
          </div>
        </div>
        <span className="marquee-sprite">🍔</span>
        <span className="marquee-sprite">🍩</span>
      </div>
      <nav className="topbar">
        <button type="button" className="brand" onClick={() => navigate(base)}>
          🍕 AMS SWE SNACK BAR 🍿
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
        <span className="footer-sprite">🍬🍬🍬🍬🍬</span>
        <span className="blink">ORDER UP</span>
        <span className="retro-footer-sep">•</span>
        <span className="hit-counter" title="totally real order count">
          ORDERS SERVED {"0" + "0" + "1" + "3" + "3" + "7" + "0" + "0"}
        </span>
      </footer>
    </div>
  );
}
