import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "./firebaseAdmin.js";

const auth = getAuth();
const db = getFirestore();

// Fully removes one student: their tickets (with comments/history), any
// notifications that reference them, their Firestore profile, and their
// Firebase Auth account. Usage: node scripts/delete-student.js <email>
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/delete-student.js <email>");
    process.exit(1);
  }

  const record = await auth.getUserByEmail(email).catch(() => null);
  if (!record) {
    console.error(`No auth account found for ${email}.`);
    process.exit(1);
  }
  const uid = record.uid;

  const [ticketsSnap, actorNotifsSnap, recipientNotifsSnap] = await Promise.all([
    db.collection("tickets").where("assignedTo", "==", uid).get(),
    db.collection("notifications").where("actorId", "==", uid).get(),
    db.collection("notifications").where("recipientId", "==", uid).get(),
  ]);

  const refsPerTicket = await Promise.all(
    ticketsSnap.docs.map(async (ticketDoc) => {
      const [commentsSnap, historySnap] = await Promise.all([
        ticketDoc.ref.collection("comments").get(),
        ticketDoc.ref.collection("history").get(),
      ]);
      return [...commentsSnap.docs.map((d) => d.ref), ...historySnap.docs.map((d) => d.ref), ticketDoc.ref];
    })
  );

  const notificationRefs = new Map();
  [...actorNotifsSnap.docs, ...recipientNotifsSnap.docs].forEach((d) => notificationRefs.set(d.id, d.ref));

  const refsToDelete = [...refsPerTicket.flat(), ...notificationRefs.values(), db.collection("users").doc(uid)];

  const CHUNK_SIZE = 450;
  for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
    const batch = db.batch();
    refsToDelete.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  await auth.deleteUser(uid);

  console.log(
    `Deleted ${email}: ${ticketsSnap.size} ticket(s), ${notificationRefs.size} notification(s), Firestore profile, and Auth account.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
