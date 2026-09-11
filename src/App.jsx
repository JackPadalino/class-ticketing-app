import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { AppLayout } from "./components/AppLayout";
import { ProjectsList } from "./pages/ProjectsList";
import { LeadDashboard } from "./pages/LeadDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";

export default function App() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
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
          path="/lead/:projectId"
          element={profile.role === "lead" ? <LeadDashboard /> : <Navigate to="/student" replace />}
        />
        <Route
          path="/student"
          element={profile.role === "student" ? <ProjectsList isLead={false} /> : <Navigate to="/lead" replace />}
        />
        <Route
          path="/student/:projectId"
          element={profile.role === "student" ? <StudentDashboard /> : <Navigate to="/lead" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
