import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { EngineeringCycleDiagram } from "../components/EngineeringCycleDiagram";

export function PhaseMenu() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);

  useEffect(() => {
    return onSnapshot(doc(db, "projects", projectId), (snap) => {
      setProject(snap.exists() ? { id: snap.id, ...snap.data() } : null);
    });
  }, [projectId]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <button type="button" className="back-link" onClick={() => navigate("/student")}>
            ← All projects
          </button>
          <h1>{project?.name || "Project"}</h1>
          {project?.description && <p className="project-description">{project.description}</p>}
        </div>
      </header>

      <div className="phase-menu-page">
        <EngineeringCycleDiagram onSelectPhase={(phaseKey) => navigate(`/student/${projectId}/${phaseKey}`)} />
      </div>
    </div>
  );
}
