import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { loadRoster } from "./firebaseAdmin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const auth = getAuth();
const db = getFirestore();

const APPS = [
  "Budget Calculator",
  '"Is It Worth Streaming?" Decider',
  "Outfit Selector",
  "Flashcard Study Tool",
  "Robot Vacuum Troubleshooter",
];

const PROJECT_NAME = "Unit 1 Project 1 - Google Suite App";
const LEAD_EMAIL_FOR_SHARING = "JPadalino@amsbronx.org";

const TICKET_TITLE = "Create Google Drive folder";

function buildDescription() {
  return [
    "• Create a SWE 2026-2027 folder on Google Drive",
    `• Share this folder with email ${LEAD_EMAIL_FOR_SHARING}`,
    "• Create a sub folder for Unit 1 Projects",
    `• Create another sub folder inside Unit 1 Projects titled "${PROJECT_NAME}"`,
    "",
    "Folder structure:",
    "📁 SWE 2026-2027",
    "   └── 📁 Unit 1 Projects",
    `         └── 📁 ${PROJECT_NAME}`,
  ].join("\n");
}

// Fisher-Yates shuffle, then deal apps round-robin so all 5 get an
// even-ish spread across however many students there are.
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function main() {
  const roster = loadRoster();
  const realStudents = roster.students.filter((s) => s.email.endsWith("@amsbronx.org"));
  if (realStudents.length === 0) {
    console.error("No @amsbronx.org students found in roster.config.json.");
    process.exit(1);
  }

  const shuffled = shuffle(realStudents);
  const assignments = shuffled.map((s, i) => ({ ...s, assignedApp: APPS[i % APPS.length] }));

  const projectSnap = await db.collection("projects").where("name", "==", PROJECT_NAME).limit(1).get();
  if (projectSnap.empty) {
    console.error(`Could not find a project named "${PROJECT_NAME}". Create it first, then re-run this script.`);
    process.exit(1);
  }
  const projectId = projectSnap.docs[0].id;

  const description = buildDescription();

  console.log(`Using project "${PROJECT_NAME}" (${projectId})\n`);

  for (const student of assignments) {
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
      console.log(`${student.email} (${student.assignedApp}): ticket already exists, skipped`);
      continue;
    }

    await db.collection("tickets").add({
      projectId,
      title: TICKET_TITLE,
      description,
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

    console.log(`${student.email} (${student.assignedApp}): ticket created`);
  }

  // Persist the assignment back into roster.config.json so it's a durable
  // record for later tickets that reference each student's specific app.
  const rosterPath = path.join(__dirname, "roster.config.json");
  const rosterOnDisk = JSON.parse(readFileSync(rosterPath, "utf8"));
  rosterOnDisk.students = rosterOnDisk.students.map((s) => {
    const match = assignments.find((a) => a.email === s.email);
    return match ? { ...s, assignedApp: match.assignedApp } : s;
  });
  writeFileSync(rosterPath, JSON.stringify(rosterOnDisk, null, 2) + "\n");

  console.log("\nAssignment summary:");
  assignments.forEach((s) => console.log(`  ${s.displayName || s.email}: ${s.assignedApp}`));
  console.log("\nSaved assignments to scripts/roster.config.json.");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
