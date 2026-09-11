import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { initializeApp, cert, getApps } from "firebase-admin/app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(__dirname, "serviceAccountKey.json");

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
  const rosterPath = path.join(__dirname, "roster.config.json");
  if (!existsSync(rosterPath)) {
    console.error(
      "\nMissing scripts/roster.config.json.\n" +
        "Copy scripts/roster.config.example.json to scripts/roster.config.json and fill in real names/emails.\n"
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(rosterPath, "utf8"));
}
