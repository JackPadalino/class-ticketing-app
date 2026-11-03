/**
 * Resets EVERY ticket back to "ready_to_start" and clears its review fields.
 * Run: npm run reset:tickets   (affects all students' tickets)
 *
 * Appears in the following files:
 *   - Local helpers (only used in this file): db, main
 *   - Run with: npm run reset:tickets
 */

import { getFirestore, FieldValue } from "firebase-admin/firestore";
import "../lib/firebaseAdmin.js";

const db = getFirestore();

async function main() {
  const snap = await db.collection("tickets").get();
  if (snap.empty) {
    console.log("No tickets found.");
    process.exit(0);
  }

  const docs = snap.docs;
  const CHUNK_SIZE = 450;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const batch = db.batch();
    docs.slice(i, i + CHUNK_SIZE).forEach((docSnap) => {
      batch.update(docSnap.ref, {
        status: "ready_to_start",
        needsRevision: false,
        reviewedBy: null,
        reviewedAt: null,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  console.log(`Reset ${docs.length} ticket(s) to "Ready to start".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
