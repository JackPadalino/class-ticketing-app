import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";
import { BACKLOGS, ticketTitle, ONBOARDING_TITLES } from "./appBacklogs.js";

const auth = getAuth();
const db = getFirestore();

const PROJECT_NAME = "Unit 1 Project 1 - Google Suite App";

// Reconciles every real student's board with roster.config.json's current
// assignedApp: deletes any ticket that isn't one of the onboarding tickets
// or part of the student's current backlog, then creates whatever backlog
// tickets are missing. Safe to re-run — it's idempotent either way.
async function main() {
  const roster = loadRoster();
  const realStudents = roster.students.filter((s) => s.email.endsWith("@amsbronx.org"));
  if (realStudents.length === 0) {
    console.error("No @amsbronx.org students found in roster.config.json.");
    process.exit(1);
  }

  const projectSnap = await db.collection("projects").where("name", "==", PROJECT_NAME).limit(1).get();
  if (projectSnap.empty) {
    console.error(`Could not find a project named "${PROJECT_NAME}".`);
    process.exit(1);
  }
  const projectId = projectSnap.docs[0].id;

  console.log(`Using project "${PROJECT_NAME}" (${projectId})\n`);

  for (const student of realStudents) {
    const record = await auth.getUserByEmail(student.email).catch(() => null);
    if (!record) {
      console.warn(`Skipping ${student.email} — no auth account found.`);
      continue;
    }

    const backlog = student.assignedApp ? BACKLOGS[student.assignedApp] : null;
    if (student.assignedApp && !backlog) {
      console.warn(`${student.email}: no backlog found for assignedApp "${student.assignedApp}" — skipping entirely.`);
      continue;
    }
    const wantedTitles = new Set([...ONBOARDING_TITLES, ...(backlog ? backlog.map(ticketTitle) : [])]);

    const existing = await db
      .collection("tickets")
      .where("projectId", "==", projectId)
      .where("assignedTo", "==", record.uid)
      .get();

    const toDelete = existing.docs.filter((d) => !wantedTitles.has(d.data().title));
    for (const ticketDoc of toDelete) {
      const [commentsSnap, historySnap] = await Promise.all([
        db.collection(`tickets/${ticketDoc.id}/comments`).get(),
        db.collection(`tickets/${ticketDoc.id}/history`).get(),
      ]);
      const batch = db.batch();
      commentsSnap.docs.forEach((d) => batch.delete(d.ref));
      historySnap.docs.forEach((d) => batch.delete(d.ref));
      batch.delete(ticketDoc.ref);
      await batch.commit();
    }

    const existingTitles = new Set(existing.docs.filter((d) => !toDelete.includes(d)).map((d) => d.data().title));
    let created = 0;
    if (backlog) {
      for (const item of backlog) {
        const title = ticketTitle(item);
        if (existingTitles.has(title)) continue;
        await db.collection("tickets").add({
          projectId,
          title,
          description: "",
          phase: "development",
          assignedTo: record.uid,
          assignedToName: student.displayName || student.email,
          links: [],
          status: "ready_to_start",
          needsRevision: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          reviewedBy: null,
          reviewedAt: null,
        });
        created++;
      }
    }

    console.log(
      `${student.email} (${student.assignedApp || "no app"}): deleted ${toDelete.length}, created ${created}, kept ${existingTitles.size}`
    );
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
