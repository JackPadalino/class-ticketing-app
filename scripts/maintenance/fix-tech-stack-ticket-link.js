/**
 * One-off patch: moves the reference doc link out of the "Choose Tech Stack"
 * tickets' links array into the description. No-op once fixed.
 * Run: npm run fix:tech-stack-ticket-link
 *
 * Where things are used:
 *   - Local helpers (only used in this file): db, TICKET_TITLE, TECH_STACK_DOC_URL, main
 *   - Run with: npm run fix:tech-stack-ticket-link
 */

import { getFirestore } from "firebase-admin/firestore";
import "../lib/firebaseAdmin.js";

const db = getFirestore();

const TICKET_TITLE = "Choose Tech Stack";
const TECH_STACK_DOC_URL =
  "https://docs.google.com/document/d/1Tt7ntlKiAMmJ6g4-KRu6Ybqc1KIYG1MvS2MhWcrLA4k/edit?usp=sharing";

// One-off patch for tickets already created before the link was moved
// out of the (student-removable) links array and into the description
// text. Only touches tickets that still have the doc link sitting in
// `links` - safe to re-run, it's a no-op once fixed.
async function main() {
  const snap = await db.collection("tickets").where("title", "==", TICKET_TITLE).get();
  if (snap.empty) {
    console.log(`No tickets titled "${TICKET_TITLE}" found.`);
    process.exit(0);
  }

  let fixed = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const hasOldLink = (data.links || []).some((l) => l.url === TECH_STACK_DOC_URL);
    if (!hasOldLink) continue;

    const newLinks = (data.links || []).filter((l) => l.url !== TECH_STACK_DOC_URL);
    const newDescription = data.description.includes(TECH_STACK_DOC_URL)
      ? data.description
      : `${data.description}\n\nQuestions doc: ${TECH_STACK_DOC_URL}`;

    await doc.ref.update({ links: newLinks, description: newDescription });
    fixed++;
    console.log(`Fixed ticket ${doc.id} (assignedTo ${data.assignedTo})`);
  }

  console.log(`\nDone. Fixed ${fixed} ticket(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
