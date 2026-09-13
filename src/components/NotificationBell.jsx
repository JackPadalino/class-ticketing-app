import { useState } from "react";
import { markNotificationRead } from "../ticketActions";

function notificationText(n) {
  if (n.type === "ready_for_review") {
    return (
      <>
        <strong>{n.actorName}</strong> marked <em>{n.ticketTitle}</em> ready for review
      </>
    );
  }
  if (n.type === "student_comment" || n.type === "lead_comment") {
    return (
      <>
        <strong>{n.actorName}</strong> commented on <em>{n.ticketTitle}</em>
      </>
    );
  }
  if (n.decision === "approved") {
    return (
      <>
        <strong>{n.actorName}</strong> approved <em>{n.ticketTitle}</em>
      </>
    );
  }
  return (
    <>
      <strong>{n.actorName}</strong> requested revisions on <em>{n.ticketTitle}</em>
    </>
  );
}

export function NotificationBell({ notifications, onSelectNotification }) {
  const [open, setOpen] = useState(false);

  const handleClick = async (n) => {
    setOpen(false);
    onSelectNotification(n);
    await markNotificationRead(n.id);
  };

  return (
    <div className="notification-bell">
      <button type="button" className="bell-toggle" onClick={() => setOpen((o) => !o)}>
        🔔
        {notifications.length > 0 && <span className="bell-count">{notifications.length}</span>}
      </button>
      {open && (
        <div className="bell-dropdown">
          {notifications.length === 0 && <p className="bell-empty">No new alerts.</p>}
          {notifications.map((n) => (
            <button key={n.id} type="button" className="bell-item" onClick={() => handleClick(n)}>
              {notificationText(n)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
