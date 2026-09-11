import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();
const db = getFirestore();

const PROJECT_NAME = "Unit 1 Project 1 - Google Suite App";
const TICKET_TITLE = "Choose Tech Stack";
const TECH_STACK_DOC_URL =
  "https://docs.google.com/document/d/1Tt7ntlKiAMmJ6g4-KRu6Ybqc1KIYG1MvS2MhWcrLA4k/edit?usp=sharing";

// The doc link lives in the description text itself, not the ticket's
// links array - links there are meant to be student-added and
// student-removable, so a lead-provided reference doesn't belong there
// (a student could otherwise delete it).
const DESCRIPTION = [
  'Inside your SWE 2026-2027 Google Drive folder create a new Google Doc titled "Unit 1 Project 1 - Choosing The Tech Stack", then answer the following questions. It may be easier to copy/paste this entire document then begin working.',
  "",
  `Questions doc: ${TECH_STACK_DOC_URL}`,
].join("\n");

async function main() {
  const roster = loadRoster();
  const realStudents = roster.students.filter((s) => s.email.endsWith("@amsbronx.org"));
  if (realStudents.length === 0) {
    console.error("No @amsbronx.org students found in roster.config.json.");
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
      phase: "planning",
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
