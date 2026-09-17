import { getAuth } from "firebase-admin/auth";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();

// Resets every existing account's password to the part of its email
// before the @ - the new standing password scheme (see seed-students.js).
// Only needed for accounts that already existed before the scheme
// changed; seed-students.js handles it automatically for new accounts.
function emailPrefixPassword(email) {
  return email.split("@")[0];
}

async function main() {
  const roster = loadRoster();
  const accounts = [roster.lead, ...roster.students];

  for (const account of accounts) {
    const record = await auth.getUserByEmail(account.email).catch(() => null);
    if (!record) {
      console.warn(`Skipping ${account.email} — no auth account found.`);
      continue;
    }

    const newPassword = emailPrefixPassword(account.email);
    await auth.updateUser(record.uid, { password: newPassword });
    console.log(`${account.email}: password set to "${newPassword}"`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
