import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import muncherGif from "../assets/arcade/muncher.gif";
import birdGif from "../assets/arcade/bird-rider.gif";

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
  const [showPasswordInfo, setShowPasswordInfo] = useState(true);

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

      {showPasswordInfo && (
        <div className="modal-backdrop" onClick={() => setShowPasswordInfo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setShowPasswordInfo(false)}
            >
              ✕
            </button>
            <h2>New sign-in instructions</h2>
            <p className="ticket-description">
              Your username is the part of your email before the "@" symbol. Your full email
              works too, if you'd rather type that instead.
            </p>
            <p className="ticket-description">
              <strong>Example:</strong> jpadalino@email.com <strong>--&gt;</strong> jpadalino
            </p>
            <p className="ticket-description">
              Ask your teacher if you don't already have your password.
            </p>
            <button type="button" onClick={() => setShowPasswordInfo(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      <form className="login-card" onSubmit={submit}>
        <div className="login-sprites" aria-hidden="true">
          <img src={muncherGif} alt="" />
          <img src={birdGif} alt="" />
        </div>
        <h1>AMS SWE ARCADE</h1>
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
