import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { useSettings } from "../hooks/useSettings";
import { markNotificationRead } from "../ticketActions";
import { ALERT_TYPES, isAlertEnabled, isStudentStatusUpdateAllowed } from "../constants";

function notificationText(n) {
  if (n.type === "ready_for_review") {
    return (
      <>
        <strong>{n.actorName}</strong> marked <em>{n.ticketTitle}</em> ready for review
      </>
    );
  }
  if (n.type === "need_support") {
    return (
      <>
        <strong>{n.actorName}</strong> needs support on <em>{n.ticketTitle}</em>
      </>
    );
  }
  return (
    <>
      <strong>{n.actorName}</strong> commented on <em>{n.ticketTitle}</em>
    </>
  );
}

export function Settings() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const settings = useSettings();
  const notifications = useNotifications({ role: "lead", uid: user.uid, alertPrefs: profile.alertPrefs });

  const toggleAlert = (key, enabled) => {
    updateDoc(doc(db, "users", user.uid), {
      alertPrefs: { ...profile.alertPrefs, [key]: enabled },
    });
  };

  const toggleStudentStatusUpdates = (enabled) => {
    setDoc(doc(db, "settings", "global"), { allowStudentStatusUpdates: enabled }, { merge: true });
  };

  const openNotification = async (n) => {
    if (n.projectId) navigate(`/lead/${n.projectId}`, { state: { openTicketId: n.ticketId } });
    await markNotificationRead(n.id);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Settings</h1>
      </header>

      <section className="dashboard-section">
        <h2>Administrative</h2>
        <ul className="alert-pref-list">
          <li className="alert-pref-row">
            <div>
              <p className="alert-pref-label">Allow students to update ticket status</p>
              <p className="alert-pref-description">
                When off, only you can change a ticket's status - students can still edit links
                and leave comments. You can always update any ticket's status yourself, either way.
              </p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={isStudentStatusUpdateAllowed(settings)}
                onChange={(e) => toggleStudentStatusUpdates(e.target.checked)}
              />
              <span className="switch-track" />
            </label>
          </li>
        </ul>
      </section>

      <section className="dashboard-section">
        <h2>Alerts</h2>
        <p className="hint">Choose which alerts show up in your notification bell.</p>
        <ul className="alert-pref-list">
          {ALERT_TYPES.map((t) => {
            const enabled = isAlertEnabled(profile.alertPrefs, t.key);
            return (
              <li key={t.key} className="alert-pref-row">
                <div>
                  <p className="alert-pref-label">{t.label}</p>
                  <p className="alert-pref-description">{t.description}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => toggleAlert(t.key, e.target.checked)}
                  />
                  <span className="switch-track" />
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="dashboard-section">
        <h2>Needs your attention</h2>
        {notifications.length === 0 ? (
          <p className="hint">No unread alerts right now.</p>
        ) : (
          <ul className="alert-feed">
            {notifications.map((n) => (
              <li key={n.id}>
                <button type="button" className="alert-feed-item" onClick={() => openNotification(n)}>
                  {notificationText(n)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
