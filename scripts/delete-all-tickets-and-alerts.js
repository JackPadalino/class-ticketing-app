import { getFirestore } from "firebase-admin/firestore";
import "./firebaseAdmin.js";

const db = getFirestore();

async function collectRefs() {
  const [ticketsSnap, notificationsSnap] = await Promise.all([
    db.collection("tickets").get(),
    db.collection("notifications").get(),
  ]);

  const refsPerTicket = await Promise.all(
    ticketsSnap.docs.map(async (ticketDoc) => {
      const [commentsSnap, historySnap] = await Promise.all([
        ticketDoc.ref.collection("comments").get(),
        ticketDoc.ref.collection("history").get(),
      ]);
      return [
        ...commentsSnap.docs.map((d) => d.ref),
        ...historySnap.docs.map((d) => d.ref),
        ticketDoc.ref,
      ];
    })
  );

  return {
    refs: [...refsPerTicket.flat(), ...notificationsSnap.docs.map((d) => d.ref)],
    ticketCount: ticketsSnap.size,
    notificationCount: notificationsSnap.size,
  };
}

async function main() {
  const { refs, ticketCount, notificationCount } = await collectRefs();

  if (refs.length === 0) {
    console.log("Nothing to delete - no tickets or notifications found.");
    process.exit(0);
  }

  const CHUNK_SIZE = 450;
  for (let i = 0; i < refs.length; i += CHUNK_SIZE) {
    const batch = db.batch();
    refs.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  console.log(`Deleted ${ticketCount} ticket(s) (with their comments/history) and ${notificationCount} notification(s).`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
