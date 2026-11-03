/**
 * Sign-in screen.
 *   - EMAIL_DOMAIN / resolveEmail(raw): lets users type just their username
 *     ("jpadalino") - it is turned into "jpadalino@amsbronx.org". A full email
 *     with an "@" is used as typed.
 *   - Login: username + password form. Shows a generic error on failure.
 *
 * Appears in the following files:
 *   - Login: App.jsx
 *   - Local helpers (only used in this file): EMAIL_DOMAIN, resolveEmail
 */

import { useState } from "react";
import { useAuth } from "./AuthContext";
import { SpaceFloaters } from "../../components/effects/SpaceFloaters";

const EMAIL_DOMAIN = "amsbronx.org";

// Accepts either a bare username ("jpadalino") or a full email
// ("jpadalino@amsbronx.org") and always resolves to the full email
// Firebase Auth needs to sign in.
function resolveEmail(raw) {
  const trimmed = raw.trim();
  return trimmed.includes("@") ? trimmed : `${trimmed}@${EMAIL_DOMAIN}`;
}

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(resolveEmail(username), password);
    } catch (err) {
      setError("Couldn't sign in. Check your username and password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="scanlines" aria-hidden="true" />
      <SpaceFloaters />

      <form className="login-card" onSubmit={submit}>
        <div className="login-sprites" aria-hidden="true">
          <span>👾</span>
          <span>🚀</span>
          <span>🛸</span>
          <span>👽</span>
        </div>
        <h1>AMS SWE INVADERS</h1>
        <p className="insert-coin blink">INSERT COIN TO CONTINUE</p>
        <label>
          Username
          <input
            type="text"
            autoComplete="username"
            placeholder="yourname"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "LOADING..." : "PRESS START"}
        </button>
      </form>
    </div>
  );
}
