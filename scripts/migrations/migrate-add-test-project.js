/**
 * One-time migration: tickets created before projects existed have no projectId.
 * Moves them into a "Test Project" (created if needed). Safe to re-run.
 * Run: npm run migrate:test-project
 *
 * Appears in the following files:
 *   - Local helpers (only used in this file): db, main
 *   - Run with: npm run migrate:test-project
 */

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "../lib/firebaseAdmin.js";

const db = getFirestore();

async function main() {
  const ticketsSnap = await db.collection("tickets").get();
  const withoutProject = ticketsSnap.docs.filter((d) => !d.data().projectId);

  if (withoutProject.length === 0) {
    console.log("Every ticket already belongs to a project. Nothing to do.");
    process.exit(0);
  }

  const existing = await db.collection("projects").where("name", "==", "Test Project").limit(1).get();
  let projectId;
  if (!existing.empty) {
    projectId = existing.docs[0].id;
    console.log(`Using existing "Test Project" (${projectId})`);
  } else {
    const ref = await db.collection("projects").add({
      name: "Test Project",
      createdBy: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    projectId = ref.id;
    console.log(`Created "Test Project" (${projectId})`);
  }

  const batch = db.batch();
  for (const docSnap of withoutProject) {
    batch.update(docSnap.ref, { projectId });
  }
  await batch.commit();

  console.log(`Assigned ${withoutProject.length} existing ticket(s) to "Test Project".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
