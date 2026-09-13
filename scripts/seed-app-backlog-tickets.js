import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";
import { BACKLOGS, ticketTitle } from "./appBacklogs.js";

const auth = getAuth();
const db = getFirestore();

const PROJECT_NAME = "Unit 1 Project 1 - Google Suite App";

async function main() {
  const roster = loadRoster();
  const realStudents = roster.students.filter(
    (s) => s.email.endsWith("@amsbronx.org") && s.assignedApp
  );
  if (realStudents.length === 0) {
    console.error("No students with an assignedApp found in roster.config.json.");
    process.exit(1);
  }

  const projectSnap = await db.collection("projects").where("name", "==", PROJECT_NAME).limit(1).get();
  if (projectSnap.empty) {
    console.error(`Could not find a project named "${PROJECT_NAME}". Create it first, then re-run this script.`);
    process.exit(1);
  }
  const projectId = projectSnap.docs[0].id;

  console.log(`Using project "${PROJECT_NAME}" (${projectId})\n`);

  for (const student of realStudents) {
    const backlog = BACKLOGS[student.assignedApp];
    if (!backlog) {
      console.warn(`Skipping ${student.email} — no backlog found for assignedApp "${student.assignedApp}".`);
      continue;
    }

    const record = await auth.getUserByEmail(student.email).catch(() => null);
    if (!record) {
      console.warn(`Skipping ${student.email} — no auth account found.`);
      continue;
    }

    const existing = await db
      .collection("tickets")
      .where("projectId", "==", projectId)
      .where("assignedTo", "==", record.uid)
      .get();
    const existingTitles = new Set(existing.docs.map((d) => d.data().title));

    let created = 0;
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

    console.log(`${student.email} (${student.assignedApp}): created ${created} ticket(s), skipped ${backlog.length - created} already present`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
