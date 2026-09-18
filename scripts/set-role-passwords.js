import { getAuth } from "firebase-admin/auth";
import { loadRoster } from "./firebaseAdmin.js";

const auth = getAuth();

// Resets every existing account's password to match roster.config.json:
// the lead gets roster.lead.password, each student gets their own
// override or roster.defaultStudentPassword. Re-run this any time the
// class-wide password scheme changes - seed-students.js only sets a
// password when it *creates* an account, never on an existing one.
async function main() {
  const roster = loadRoster();
  const accounts = [
    { email: roster.lead.email, password: roster.lead.password },
    ...roster.students.map((s) => ({ email: s.email, password: s.password || roster.defaultStudentPassword })),
  ];

  for (const { email, password } of accounts) {
    if (!password) {
      console.warn(`Skipping ${email} — no password configured in roster.config.json.`);
      continue;
    }

    const record = await auth.getUserByEmail(email).catch(() => null);
    if (!record) {
      console.warn(`Skipping ${email} — no auth account found.`);
      continue;
    }

    await auth.updateUser(record.uid, { password });
    console.log(`${email}: password updated.`);
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
