import { COLUMNS } from "../constants";
import { TicketCard } from "./TicketCard";
import { TicketDetailModal } from "./TicketDetailModal";

export function TicketBoard({ tickets, isLead, currentUser, openTicketId, onOpenTicket, onCloseTicket }) {
  const openTicket = tickets.find((t) => t.id === openTicketId) || null;

  return (
    <div className="board">
      {COLUMNS.map((col) => {
        const colTickets = tickets.filter((t) => col.statuses.includes(t.status));
        return (
          <div key={col.key} className="board-column">
            <h2>
              {col.title} <span className="column-count">{colTickets.length}</span>
            </h2>
            <div className="column-tickets">
              {colTickets.map((t) => (
                <TicketCard key={t.id} ticket={t} onOpen={() => onOpenTicket(t.id)} />
              ))}
              {colTickets.length === 0 && <p className="column-empty">Nothing here.</p>}
            </div>
          </div>
        );
      })}

      {openTicket && (
        <TicketDetailModal
          ticket={openTicket}
          isLead={isLead}
          currentUser={currentUser}
          onClose={onCloseTicket}
        />
      )}
    </div>
  );
}
