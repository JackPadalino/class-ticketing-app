import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();
const db = getFirestore();

const PROJECT_NAME = "Unit 1 Project 1 - Google Suite App";
const TICKET_TITLE = "Share app";
const DESCRIPTION =
  "Share app with lead engineer. Please copy/paste a link to your app below. Please also make sure you have shared the app with the email address JPadalino@amsbronx.org";

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

    const existing = await db
      .collection("tickets")
      .where("projectId", "==", projectId)
      .where("assignedTo", "==", record.uid)
      .where("title", "==", TICKET_TITLE)
      .limit(1)
      .get();

    if (!existing.empty) {
      console.log(`${student.email}: ticket already exists, skipped`);
      continue;
    }

    await db.collection("tickets").add({
      projectId,
      title: TICKET_TITLE,
      description: DESCRIPTION,
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

    console.log(`${student.email}: ticket created`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
