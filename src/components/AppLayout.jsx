import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import muncherGif from "../assets/arcade/muncher.gif";
import ghostRedGif from "../assets/arcade/ghost-red.gif";
import ghostPinkGif from "../assets/arcade/ghost-pink.gif";
import dotsGif from "../assets/arcade/dots.gif";

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
      <div className="marquee-bar" aria-hidden="true">
        <img src={muncherGif} alt="" className="marquee-sprite" />
        <div className="marquee-viewport">
          <div className="marquee-track">
            ★ HIGH SCORE ★ WELCOME TO THE AMS SWE ARCADE ★ INSERT TICKET TO CONTINUE ★ 1UP READY ★ HIGH SCORE ★
            WELCOME TO THE AMS SWE ARCADE ★ INSERT TICKET TO CONTINUE ★ 1UP READY ★
          </div>
        </div>
        <img src={ghostRedGif} alt="" className="marquee-sprite" />
        <img src={ghostPinkGif} alt="" className="marquee-sprite" />
      </div>
      <nav className="topbar">
        <button type="button" className="brand" onClick={() => navigate(base)}>
          AMS SWE ARCADE
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
        <img src={dotsGif} alt="" className="footer-sprite" />
        <span className="blink">INSERT COIN</span>
        <span className="retro-footer-sep">•</span>
        <span className="hit-counter" title="totally real high score">
          HIGH SCORE {"0" + "0" + "1" + "3" + "3" + "7" + "0" + "0"}
        </span>
      </footer>
    </div>
  );
}
