import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();
const db = getFirestore();

// Every account's password is the part of its email before the @ -
// simple enough for students to remember/type, at the cost of being
// guessable by anyone who knows a classmate's school email. Explicit
// per-account `password` overrides in roster.config.json still win.
function emailPrefixPassword(email) {
  return email.split("@")[0];
}

async function upsertAccount({ email, displayName, password, role, assignedApp }) {
  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Found existing account for ${email} (${role})`);
  } catch (err) {
    if (err.code !== "auth/user-not-found") throw err;
    userRecord = await auth.createUser({ email, password, displayName });
    console.log(`Created account for ${email} (${role})`);
  }

  await db
    .collection("users")
    .doc(userRecord.uid)
    .set(
      {
        email,
        displayName,
        role,
        assignedApp: assignedApp || FieldValue.delete(),
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
}

async function main() {
  const roster = loadRoster();

  await upsertAccount({
    email: roster.lead.email,
    displayName: roster.lead.displayName,
    password: roster.lead.password || emailPrefixPassword(roster.lead.email),
    role: "lead",
  });

  for (const student of roster.students) {
    await upsertAccount({
      email: student.email,
      displayName: student.displayName,
      password: student.password || emailPrefixPassword(student.email),
      role: "student",
      assignedApp: student.assignedApp,
    });
  }

  console.log("\nDone. Students can sign in with their email and the password set above.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
