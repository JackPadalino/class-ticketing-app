import { getPhaseLabel, getStatusLabel } from "../constants";

export function TicketCard({ ticket, onOpen }) {
  const statusLabel = getStatusLabel(ticket);
  return (
    <button type="button" className="ticket-card" onClick={onOpen}>
      <div className="ticket-card-top">
        <span className="phase-badge">{getPhaseLabel(ticket.phase)}</span>
        {statusLabel && <span className="status-pill">{statusLabel}</span>}
      </div>
      <h3>{ticket.title}</h3>
      <p className="ticket-assignee">Assigned to: {ticket.assignedToName}</p>
      {ticket.links?.length > 0 && (
        <p className="ticket-links-count">
          🔗 {ticket.links.length} link{ticket.links.length === 1 ? "" : "s"}
        </p>
      )}
    </button>
  );
}
