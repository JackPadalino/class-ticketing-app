// Straight from unit1_project_ticket_backlogs.docx — one backlog per app on
// the Unit 1 Project Menu, keyed by the exact `assignedApp` string used in
// roster.config.json. All tickets file under the "development" phase for
// now (see PHASES in src/constants.js).
export const BACKLOGS = {
  "Budget Calculator": [
    { type: "Core", title: "Set up a way to organize records separately for each of the 12 months, so income and expenses don't get mixed together across different months." },
    { type: "Core", title: "Every income or expense record should capture a date, a category, a label, and an amount." },
    { type: "Core", title: "Build a way to automatically total all income recorded for a given month." },
    { type: "Core", title: "Build a way to automatically total all expenses/bills recorded for a given month." },
    { type: "Core", title: "Build a way to automatically compare a month's total income to its total expenses, clearly showing \"Surplus\" or \"Deficit\" along with the amount." },
    { type: "Core", title: "Build a single combined view showing every month's total income, total expenses, and surplus/deficit at once." },
    { type: "Core", title: "Make sure a month with no records yet shows $0 or \"No data yet,\" not an error." },
    { type: "Core", title: "Add expense categories (e.g., rent, food, entertainment) so users can see which categories they're spending the most in." },
    { type: "Stretch", title: "Add a way to flag a bill as recurring so it carries into future months automatically, without manual re-entry." },
    { type: "Stretch", title: "Add a simple visual chart comparing income and expenses across all 12 months." },
  ],
  "\"Is It Worth Streaming?\" Decider": [
    { type: "Core", title: "Set up a way for a user to enter a movie's runtime (in minutes) and its rating. State clearly whether the rating is out of 10 or out of 100." },
    { type: "Core", title: "Build a check for whether the runtime is under a chosen cutoff (e.g., 120 minutes), returning a simple yes/no result." },
    { type: "Core", title: "Build a check for whether the rating is above a chosen cutoff, returning a simple yes/no result." },
    { type: "Core", title: "Combine both checks into one decision that outputs \"Watch tonight\" or \"Save it for later,\" only when both conditions are true together." },
    { type: "Core", title: "Write a note documenting why the specific runtime and rating cutoffs were chosen." },
    { type: "Core", title: "Test the decision with a rating exactly at the cutoff. Document which way it should break the tie, and confirm it actually does." },
    { type: "Stretch", title: "Extend the tool to hold at least 3 movies at once, each with its own recommendation shown side by side." },
    { type: "Stretch", title: "Add a third input — genre or streaming service — and a rule that uses it alongside runtime and rating." },
  ],
  "Outfit Selector": [
    { type: "Core", title: "Build a starting point where a user can choose today's weather from at least 4 options (sunny, rainy, cold, hot)." },
    { type: "Core", title: "Make sure each weather choice leads somewhere distinct." },
    { type: "Core", title: "After weather is chosen, add a second choice for activity/occasion (e.g., school, gym, formal event)." },
    { type: "Core", title: "Make sure every weather + activity combination leads to its own distinct outfit recommendation, not a shared one." },
    { type: "Core", title: "Design each outfit recommendation with an actual described or illustrated outfit matching that specific weather + activity pair." },
    { type: "Core", title: "Go through every single weather × activity combination and confirm none of them dead-end." },
    { type: "Core", title: "Add a way to start over from every outfit recommendation, returning to the weather choice." },
    { type: "Stretch", title: "Add a way to change just the activity choice without re-picking the weather." },
    { type: "Stretch", title: "Add a third factor (e.g., a color preference) that further narrows the recommendation." },
  ],
  "Flashcard Study Tool": [
    { type: "Core", title: "Write at least 8 flashcards, each with a term and a matching definition, before building anything." },
    { type: "Core", title: "Set up a way to see one flashcard's term at a time, without its definition showing." },
    { type: "Core", title: "Add a way to reveal that card's definition on demand." },
    { type: "Core", title: "After the definition is revealed, add a way for the user to mark the card \"right\" or \"wrong.\"" },
    { type: "Core", title: "Marking a card \"right\" should move the user on to the next new card." },
    { type: "Core", title: "Marking a card \"wrong\" should move the user on to the next new card and record that this specific card was missed." },
    { type: "Core", title: "Build a running score display showing right vs. wrong counts, updating as the user goes." },
    { type: "Core", title: "Go through the entire deck once and confirm the final score matches a hand-count of your own choices." },
    { type: "Stretch", title: "Build a recap at the end containing only the cards marked wrong that session." },
    { type: "Stretch", title: "Research a way to change the order the cards appear in each time you play." },
  ],
  "Robot Vacuum Troubleshooter": [
    { type: "Core", title: "Research 3–4 real, common robot vacuum problems using an actual manual, support page, or forum thread. Write down the specific part and fix for each one before building anything." },
    { type: "Core", title: "Build a starting point where a user can choose their symptom from at least 4 options (not picking up dirt, won't dock, stuck/tangled, strange noise)." },
    { type: "Core", title: "Make sure each symptom choice leads to its own follow-up." },
    { type: "Core", title: "For each symptom, add at least one follow-up yes/no question specific to that symptom." },
    { type: "Core", title: "Make sure each follow-up answer leads to its own resolution." },
    { type: "Core", title: "Write a specific instruction for each resolution, naming the exact part to check or clean." },
    { type: "Core", title: "Add a citation or note on at least 3 resolutions pointing to the real source the advice came from." },
    { type: "Core", title: "Go through every path from every starting symptom and confirm none of them dead-end." },
    { type: "Stretch", title: "Add a \"still not fixed?\" option after at least one resolution, offering a second thing to try." },
    { type: "Stretch", title: "Add a way to start over from every resolution, returning to the symptom choice." },
  ],
  "Car Rental Request System": [
    { type: "Core", title: "Set up a list of at least 5 available cars, each with a make/model, price, and availability status." },
    { type: "Core", title: "Set up a way for a customer to submit a request with their name, contact info, and their chosen car from the list." },
    { type: "Core", title: "Make sure a submitted request gets recorded somewhere alongside the car list." },
    { type: "Core", title: "Build a check that looks up the requested car's availability status." },
    { type: "Core", title: "Show a clear \"Available\" or \"Not available\" result for each request, based on that check." },
    { type: "Core", title: "Update a car's availability status once its request is confirmed (a manual update is fine — document that it's manual)." },
    { type: "Core", title: "Test the system with a request for a car that's already unavailable, and confirm the result correctly says so." },
    { type: "Core", title: "Test the system with a request for a car that's available, and confirm the result correctly says so." },
    { type: "Stretch", title: "Add a way to automatically suggest one other available car when the requested one is unavailable." },
    { type: "Stretch", title: "Research whether the list of car choices shown to a customer can be limited to only currently-available cars, and what that would require." },
  ],
  "Event RSVP & Digital Ticket Generator": [
    { type: "Core", title: "Set up a way for an attendee to submit their name, contact info, and an event choice from at least 2 real events." },
    { type: "Core", title: "Add a GA/VIP ticket-type choice to that submission." },
    { type: "Core", title: "Make sure every submission gets recorded somewhere." },
    { type: "Core", title: "Build a ticket template with placeholders for name, event, and ticket type." },
    { type: "Core", title: "Pull each submission's name, event, and ticket type into a generated ticket matching that template (by hand is fine — automation is a stretch item below)." },
    { type: "Core", title: "Add a QR code image (a placeholder/fake one is fine) to the ticket template." },
    { type: "Core", title: "Test the system with at least 3 different submissions and confirm each generated ticket shows the correct, matching information." },
    { type: "Core", title: "Add a running count of total GA tickets and total VIP tickets issued so far." },
    { type: "Stretch", title: "Research a way to automatically generate a new ticket the moment a submission comes in, instead of doing it by hand." },
    { type: "Stretch", title: "Add a unique ticket number to every generated ticket." },
  ],
  "Appointment Scheduler": [
    { type: "Core", title: "Set up a way for a patient to submit their name, contact info, insurance provider, and insurance ID number." },
    { type: "Core", title: "Add date and time selection to that submission." },
    { type: "Core", title: "Make sure every submission gets recorded somewhere." },
    { type: "Core", title: "Set up a shared schedule view for the doctor's office." },
    { type: "Core", title: "Add each submitted appointment to that shared schedule with the patient's name and appointment time (a manual update is fine — document that it's manual)." },
    { type: "Core", title: "Build a check that flags when a new request's date/time matches an already-booked slot." },
    { type: "Core", title: "Test the system with at least 3 different appointment submissions, and confirm each produces a correctly matching schedule entry." },
    { type: "Core", title: "Test the double-booking check with two submissions requesting the same date/time, and confirm it correctly flags the conflict." },
    { type: "Stretch", title: "Research a way to add the schedule entry automatically instead of by hand, and what that would require." },
    { type: "Stretch", title: "Build a confirmation the patient receives after submitting, showing their appointment details." },
  ],
};

export function ticketTitle(item) {
  return item.type === "Stretch" ? `(Stretch) ${item.title}` : item.title;
}

// Ticket titles that exist independent of any app backlog — every student
// gets these regardless of assignedApp, and they're never touched by the
// backlog-reassignment script.
export const ONBOARDING_TITLES = ["Create Google Drive folder", "Choose Tech Stack", "Share app"];
