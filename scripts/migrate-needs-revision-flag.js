import { getFirestore } from "firebase-admin/firestore";
import "./firebaseAdmin.js";

const db = getFirestore();

async function main() {
  const snap = await db.collection("tickets").where("status", "==", "needs_revision").get();
  if (snap.empty) {
    console.log('No tickets currently in "needs_revision" status. Nothing to backfill.');
    process.exit(0);
  }

  const batch = db.batch();
  snap.docs.forEach((doc) => batch.update(doc.ref, { needsRevision: true }));
  await batch.commit();

  console.log(`Backfilled needsRevision: true on ${snap.size} ticket(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
