/**
 * Firestore writes for projects.
 *   - createProject({ name, description, createdBy }): returns the new project id.
 *   - updateProject(projectId, { name, description })
 *   - deleteProjectCascade(projectId): deletes the project and everything under
 *     it (tickets with their comments and history, and notifications). Firestore
 *     has no cascading delete, so it collects every reference first and deletes
 *     in batches of 450 (a batch write is capped at 500 operations).
 *
 * Appears in the following files:
 *   - createProject: features/projects/ProjectModal.jsx
 *   - updateProject: features/projects/ProjectModal.jsx
 *   - deleteProjectCascade: features/projects/ProjectsList.jsx
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

export async function createProject({ name, description, createdBy }) {
  const ref = await addDoc(collection(db, "projects"), {
    name,
    description: description || "",
    createdBy,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProject(projectId, { name, description }) {
  await updateDoc(doc(db, "projects", projectId), {
    name,
    description: description || "",
  });
}

// Deletes a project and everything that belongs to it: every ticket in
// it (plus each ticket's comments and history), and every notification
// that references it. Firestore doesn't cascade deletes on its own, so
// this has to walk the tree itself. Batched in chunks since a single
// batch write is capped at 500 operations.
export async function deleteProjectCascade(projectId) {
  const [ticketsSnap, notificationsSnap] = await Promise.all([
    getDocs(query(collection(db, "tickets"), where("projectId", "==", projectId))),
    getDocs(query(collection(db, "notifications"), where("projectId", "==", projectId))),
  ]);

  const refsPerTicket = await Promise.all(
    ticketsSnap.docs.map(async (ticketDoc) => {
      const [commentsSnap, historySnap] = await Promise.all([
        getDocs(collection(db, "tickets", ticketDoc.id, "comments")),
        getDocs(collection(db, "tickets", ticketDoc.id, "history")),
      ]);
      return [
        ...commentsSnap.docs.map((d) => d.ref),
        ...historySnap.docs.map((d) => d.ref),
        ticketDoc.ref,
      ];
    })
  );

  const refsToDelete = [
    ...refsPerTicket.flat(),
    ...notificationsSnap.docs.map((d) => d.ref),
    doc(db, "projects", projectId),
  ];

  const CHUNK_SIZE = 450;
  for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    refsToDelete.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
