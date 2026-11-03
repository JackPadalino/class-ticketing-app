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
