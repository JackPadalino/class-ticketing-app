import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import muncherGif from "../assets/arcade/muncher.gif";
import birdGif from "../assets/arcade/bird-rider.gif";

export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError("Couldn't sign in. Check your email and password and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="scanlines" aria-hidden="true" />
      <form className="login-card" onSubmit={submit}>
        <div className="login-sprites" aria-hidden="true">
          <img src={muncherGif} alt="" />
          <img src={birdGif} alt="" />
        </div>
        <h1>AMS SWE ARCADE</h1>
        <p className="insert-coin blink">INSERT COIN TO CONTINUE</p>
        <label>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
