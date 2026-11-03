import { useHistory } from "../hooks/useHistory";

const EVENT_LABEL = {
  created: "Created",
  started: "In progress",
  submitted_for_review: "Ready for review",
  reset_to_ready: "Ready to start",
  resumed: "In progress",
  needs_revision: "Needs revisions",
  approved: "Approved",
  requested_support: "Requested support",
};

function formatTime(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString();
}

export function TicketTimeline({ ticketId }) {
  const history = useHistory(ticketId);

  return (
    <div className="ticket-timeline">
      <h4>Timeline</h4>
      {history.length === 0 ? (
        <p className="timeline-empty">No history yet.</p>
      ) : (
        <ul className="timeline-list">
          {history.map((event) => (
            <li key={event.id} className={`timeline-event ${event.type}`}>
              <span className="timeline-dot" />
              <div className="timeline-body">
                <p>
                  {event.actorName} - {EVENT_LABEL[event.type] || event.type}
                </p>
                <span className="timeline-time">{formatTime(event.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
