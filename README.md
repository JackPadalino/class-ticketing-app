# Engineering Ticket Board

A Kanban-style ticket tracker for a lead engineer and a roster of students, built with React + Vite + Firebase (Firestore + Authentication).

## How it works

- **Projects** are class-wide: when the lead creates one, every student automatically gets their own blank board for it — no per-student setup needed. Both roles land on a Projects list after signing in and click into one to see its board.
- **Columns** (within a project, per student): Ready to Start → Working on It → Completed.
- **Students** see only their own tickets, only within a project they've opened. They can mark a ticket "Working on it" and later "Ready for review" (which notifies the lead). They can add/edit links (Google Docs, drawings, deployed app URLs, etc.) on their own tickets.
- **Lead** sees every student's tickets within a project, gets a notification when a ticket is marked ready for review (from the Projects screen), and can leave comments plus **Approve** (moves the ticket to Completed) or **Needs Revisions** (sends it back to Working on It).
- Tickets can only reach the **Completed** column through lead approval — students cannot mark their own ticket complete.

## Firestore data model

```
users/{uid}
  email: string
  displayName: string
  role: "lead" | "student"
  createdAt: timestamp

projects/{projectId}
  name: string
  createdBy: uid | null
  createdAt: timestamp

tickets/{ticketId}
  projectId: string
  title: string
  description: string
  phase: string                 // e.g. "Planning", "Design", "Development"...
  assignedTo: uid
  assignedToName: string        // denormalized for display
  status: "ready_to_start" | "in_progress" | "ready_for_review" | "needs_revision" | "completed"
  links: [{ label, url }]
  createdAt, updatedAt: timestamp
  reviewedBy: uid | null
  reviewedAt: timestamp | null

  tickets/{ticketId}/comments/{commentId}
    authorId: uid
    authorName: string
    authorRole: "lead"
    text: string
    decision: "approved" | "needs_revision" | null
    createdAt: timestamp

notifications/{notificationId}
  type: "ready_for_review"
  projectId: string
  ticketId, ticketTitle: string
  studentId, studentName: string
  read: boolean
  createdAt: timestamp
```

Security rules (`firestore.rules`) enforce all of this server-side: every signed-in user can read the `projects` list (it's class-wide), only the lead can create/edit projects, students can only read/update their own tickets (and only flip status/links, never approve their own work), only the lead can create tickets or post comments, and `users` documents are never writable from the client.

## Authentication

Uses Firebase Authentication's **Email/Password** provider (not Google sign-in). Student and lead accounts are pre-created by you via an admin script — there is no self-signup page. Passwords are managed securely by Firebase Auth itself (never stored as plain text in Firestore); the `users` collection only holds each person's profile (name, email, role).

## Setup

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Build > Firestore Database** → Create database (start in production mode — the provided rules lock it down).
3. **Build > Authentication** → Sign-in method → enable **Email/Password**. Do not enable Google.
4. **Project settings > General > Your apps** → add a Web app → copy the config values.

### 2. Configure the app

```bash
cd /Users/J.Pad/Desktop/projects/ticketapp
npm install
cp .env.example .env
```

Paste the config values from step 1.4 into `.env`.

### 3. Deploy security rules

Firebase Console → **Build → Firestore Database → Rules** tab → paste in the contents of `firestore.rules` from this repo → **Publish**.

(No composite indexes are needed — every Firestore query in this app filters on a single field and sorts client-side instead, specifically to avoid that extra setup step for a small class project.)

### 4. Create accounts (lead + students)

1. In Firebase Console → Project settings → **Service accounts** → "Generate new private key". Save the downloaded file as `scripts/serviceAccountKey.json` (already gitignored).
2. Copy the roster template and fill in real names/emails:
   ```bash
   cp scripts/roster.config.example.json scripts/roster.config.json
   ```
   Edit `scripts/roster.config.json` — it already has your email pre-filled as the lead. Set a real lead password, a shared `defaultStudentPassword` for the class, and list each student's email + display name.
3. Run the seed script:
   ```bash
   npm run seed:students
   ```
   This creates a Firebase Auth account + Firestore profile for you and every student. Safe to re-run if you add more students later — existing accounts are left alone.

### 5. (Optional) Seed sample tickets

```bash
npm run seed:tickets
```

Gives every student their own ticket for each phase of the engineering cycle (Planning, Design, Development, Testing & QA, Code Review, Deployment), so nobody's board is empty on day one. Safe to re-run after adding more students later — it skips anyone who already has these tickets.

### 6. Run it

```bash
npm run dev
```

Sign in with the lead email + password from `roster.config.json` to see the full board and create more tickets. Each student signs in with their own email + the shared default password.

## Deploying

The app is live on Firebase Hosting at **https://class-ticketing-app.web.app**.

To ship a new build after making changes:

```bash
firebase login          # one-time, opens a browser to sign in with your Google account
npm run deploy           # builds the app and pushes it to Hosting
```

`firebase login` only needs to happen once per machine — after that, `npm run deploy` (which runs `vite build` then `firebase deploy --only hosting`) is all you need. The `.firebaserc` file already points at the `class-ticketing-app` project.

## Next steps you may want later

- Change each student's password after their first login (currently everyone shares one default password; Firebase Auth has no built-in "force password change" — you'd add a one-time flag on their user doc and prompt them in the UI).
- Let students post their own comments/replies (currently only the lead can comment, per your spec).
