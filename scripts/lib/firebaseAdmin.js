/**
 * Shared setup for the admin scripts. Importing this file initializes the Firebase
 * Admin SDK using scripts/serviceAccountKey.json (gitignored) and exits with a
 * helpful message if the key is missing.
 *   - loadRoster(): reads scripts/roster.config.json (gitignored) - the lead and
 *     student accounts, passwords and assigned apps - and exits if it's missing.
 *
 * Where things are used:
 *   - loadRoster: scripts/accounts/set-email-prefix-passwords.js,
 *       scripts/accounts/set-role-passwords.js,
 *       scripts/maintenance/fix-app-backlog-assignments.js,
 *       scripts/seed/seed-app-backlog-tickets.js, scripts/seed/seed-drive-folder-ticket.js,
 *       scripts/seed/seed-share-app-ticket.js, scripts/seed/seed-students.js,
 *       scripts/seed/seed-tech-stack-ticket.js, scripts/seed/seed-tickets.js
 *   - imported for setup only (no names used):
 *       scripts/maintenance/delete-all-tickets-and-alerts.js,
 *       scripts/maintenance/delete-student.js,
 *       scripts/maintenance/fix-tech-stack-ticket-link.js,
 *       scripts/maintenance/reset-tickets-to-ready.js,
 *       scripts/migrations/migrate-add-test-project.js,
 *       scripts/migrations/migrate-needs-revision-flag.js
 *   - Local helpers (only used in this file): __dirname, keyPath, serviceAccount
 */

import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "..", "serviceAccountKey.json");

if (!existsSync(keyPath)) {
  console.error(
    "\nMissing scripts/serviceAccountKey.json.\n" +
      "Download it from Firebase Console > Project Settings > Service Accounts > Generate new private key,\n" +
      "and save it at that path (it's gitignored).\n"
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

export function loadRoster() {
  const rosterPath = path.join(__dirname, "..", "roster.config.json");
  if (!existsSync(rosterPath)) {
    console.error(
      "\nMissing scripts/roster.config.json.\n" +
        "Copy scripts/roster.config.example.json to scripts/roster.config.json and fill in real names/emails.\n"
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(rosterPath, "utf8"));
}
