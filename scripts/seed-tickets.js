import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();
const db = getFirestore();

// One realistic ticket per phase of the engineering cycle — every
// student gets their own copy of this set.
const SAMPLE_TICKETS = [
  {
    phase: "Planning",
    title: "Write user stories for the login flow",
    description:
      "Draft user stories and acceptance criteria for sign-in/sign-out. Include edge cases like wrong password and empty fields.",
  },
  {
    phase: "Design",
    title: "Wireframe the ticket board layout",
    description:
      "Sketch the three-column board (Ready to Start / Working on It / Completed) in a Google Drawing or Figma file. Share the link on this ticket when done.",
  },
  {
    phase: "Development",
    title: "Build the ticket card component",
    description:
      "Implement a reusable card showing title, phase, and status. Should visually distinguish the five ticket statuses.",
  },
  {
    phase: "Testing & QA",
    title: "Write test cases for the review workflow",
    description:
      "List manual test cases covering: student marks ready for review, lead approves, lead requests revisions, ticket returns to Working on It.",
  },
  {
    phase: "Code Review",
    title: "Review a teammate's pull request",
    description:
      "Read through an assigned PR, leave at least two substantive comments, and note anything unclear in the diff.",
  },
  {
    phase: "Deployment",
    title: "Write the release notes for v1.0",
    description:
      "Summarize what shipped in this milestone in plain language for a non-technical audience.",
  },
];

async function getOrCreateTestProject() {
  const existing = await db.collection("projects").where("name", "==", "Test Project").limit(1).get();
  if (!existing.empty) return existing.docs[0].id;
  const ref = await db.collection("projects").add({
    name: "Test Project",
    createdBy: null,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

async function main() {
  const roster = loadRoster();
  if (!roster.students?.length) {
    console.error("No students in scripts/roster.config.json yet — add some and re-run seed-students first.");
    process.exit(1);
  }

  const projectId = await getOrCreateTestProject();

  for (const s of roster.students) {
    const record = await auth.getUserByEmail(s.email).catch(() => null);
    if (!record) {
      console.warn(`Skipping ${s.email} — no auth account found. Run "npm run seed:students" first.`);
      continue;
    }

    const existing = await db
      .collection("tickets")
      .where("projectId", "==", projectId)
      .where("assignedTo", "==", record.uid)
      .get();
    const existingTitles = new Set(existing.docs.map((d) => d.data().title));

    const batch = db.batch();
    let created = 0;
    for (const ticket of SAMPLE_TICKETS) {
      if (existingTitles.has(ticket.title)) continue;
      const ref = db.collection("tickets").doc();
      batch.set(ref, {
        ...ticket,
        projectId,
        assignedTo: record.uid,
        assignedToName: s.displayName || s.email,
        links: [],
        status: "ready_to_start",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        reviewedBy: null,
        reviewedAt: null,
      });
      created++;
    }

    if (created > 0) await batch.commit();
    console.log(`${s.email}: created ${created} ticket(s), skipped ${SAMPLE_TICKETS.length - created} already present`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
