/**
 * Page chrome shared by every signed-in screen: scanlines overlay, pixel
 * dice and torch flames, scrolling ticker, top bar (brand, notification bell, user menu),
 * the routed page content (<Outlet />), and the footer.
 *   - AppLayout: also subscribes to the user's notifications (useNotifications).
 *   - openNotification(n): what happens when a notification is clicked. Navigates
 *     to the ticket's board with { openTicketId, studentId } in router state so
 *     the board can open the ticket modal (and, for the lead, filter to that
 *     student). Students go to the right phase board; the lead to the project.
 *
 * Appears in the following files:
 *   - AppLayout: App.jsx
 */

import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { useNotifications } from "../../features/notifications/useNotifications";
import { NotificationBell } from "../../features/notifications/NotificationBell";
import { UserMenu } from "./UserMenu";
import { DungeonFloaters, PixelD20, PixelSword, PixelShield } from "../effects/DungeonFloaters";

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
    // For the lead, actorId is the student who triggered the alert - used to
    // filter the board down to that student's tickets.
    navigate(path, { state: { openTicketId: n.ticketId, studentId: isLead ? n.actorId : null } });
  };

  return (
    <div className="app-shell">
      <div className="scanlines" aria-hidden="true" />
      <DungeonFloaters />
      <div className="marquee-bar" aria-hidden="true">
        <span className="marquee-sprite"><PixelD20 tone="ruby" size={26} /></span>
        <div className="marquee-viewport">
          <div className="marquee-track">
            🎲 ROLL FOR INITIATIVE 🎲 THE QUEST BOARD AWAITS 🎲 WELCOME TO THE AMS SWE GUILD 🎲 ACCEPT A QUEST TO CONTINUE 🎲 NATURAL 20
            🎲 ROLL FOR INITIATIVE 🎲 THE QUEST BOARD AWAITS 🎲 WELCOME TO THE AMS SWE GUILD 🎲 ACCEPT A QUEST TO CONTINUE 🎲 NATURAL 20
          </div>
        </div>
        <span className="marquee-sprite"><PixelShield size={26} /></span>
        <span className="marquee-sprite"><PixelSword size={18} /></span>
      </div>
      <nav className="topbar">
        <button type="button" className="brand" onClick={() => navigate(base)}>
          🐉 AMS SWE GUILD 🎲
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
        <span className="footer-sprite">⚔️⚔️⚔️⚔️⚔️</span>
        <span className="blink">ROLL D20</span>
        <span className="retro-footer-sep">•</span>
        <span className="hit-counter" title="totally real experience points">
          XP {"0" + "0" + "0" + "1" + "3" + "3" + "7" + "0"}
        </span>
      </footer>
    </div>
  );
}
