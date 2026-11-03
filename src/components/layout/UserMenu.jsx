/**
 * Avatar button in the top bar with a dropdown menu.
 *   - getInitials(name, email): the 1-2 letter avatar text.
 *   - UserMenu: shows the user's name; the lead also gets Projects and Settings
 *     links; everyone gets Sign out.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function getInitials(name, email) {
  const source = (name || email || "").trim();
  if (!source) return "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function UserMenu({ displayName, email, isLead, onSignOut }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="user-menu">
      <button type="button" className="user-menu-toggle" onClick={() => setOpen((o) => !o)}>
        {getInitials(displayName, email)}
      </button>
      {open && (
        <div className="user-menu-dropdown">
          <p className="user-menu-name">{displayName || email}</p>
          {isLead && (
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setOpen(false);
                navigate("/lead");
              }}
            >
              Projects
            </button>
          )}
          {isLead && (
            <button
              type="button"
              className="user-menu-item"
              onClick={() => {
                setOpen(false);
                navigate("/lead/settings");
              }}
            >
              Settings
            </button>
          )}
          <button
            type="button"
            className="user-menu-item"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
