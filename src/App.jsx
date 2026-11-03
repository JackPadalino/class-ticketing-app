/**
 * Top-level routes and role-based access control.
 *   - While auth is loading: shows a loading screen.
 *   - Signed out (or no profile document): every path renders <Login />.
 *   - Signed in: everything renders inside <AppLayout /> (top bar, ticker, footer).
 *       Lead:    /lead (projects), /lead/settings, /lead/:projectId (board)
 *       Student: /student (projects), /student/:projectId (phase menu),
 *                /student/:projectId/:phase (phase board)
 *     A lead hitting a student URL (or vice versa) is redirected to their own home.
 * This is only UI routing - Firestore security rules (firestore.rules) are what
 * actually enforce who can read/write what.
 *
 * Where things are used:
 *   - App: main.jsx
 */

import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./features/auth/AuthContext";
import { Login } from "./features/auth/Login";
import { AppLayout } from "./components/layout/AppLayout";
import { ProjectsList } from "./features/projects/ProjectsList";
import { Settings } from "./features/settings/Settings";
import { LeadDashboard } from "./features/boards/LeadDashboard";
import { PhaseMenu } from "./features/boards/PhaseMenu";
import { StudentDashboard } from "./features/boards/StudentDashboard";

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Scanning the galaxy...</div>;
  }

  if (!user || !profile) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={profile.role === "lead" ? "/lead" : "/student"} replace />} />
        <Route
          path="/lead"
          element={profile.role === "lead" ? <ProjectsList isLead /> : <Navigate to="/student" replace />}
        />
        <Route
          path="/lead/settings"
          element={profile.role === "lead" ? <Settings /> : <Navigate to="/student" replace />}
        />
        <Route
          path="/lead/:projectId"
          element={profile.role === "lead" ? <LeadDashboard /> : <Navigate to="/student" replace />}
        />
        <Route
          path="/student"
          element={profile.role === "student" ? <ProjectsList isLead={false} /> : <Navigate to="/lead" replace />}
        />
        <Route
          path="/student/:projectId"
          element={profile.role === "student" ? <PhaseMenu /> : <Navigate to="/lead" replace />}
        />
        <Route
          path="/student/:projectId/:phase"
          element={profile.role === "student" ? <StudentDashboard /> : <Navigate to="/lead" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
