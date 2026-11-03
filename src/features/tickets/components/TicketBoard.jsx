/**
 * The four-column Kanban board. Splits the tickets it is given into COLUMNS by
 * status, renders a TicketCard for each, and shows the ticket detail modal for
 * `openTicketId`.
 *   - Props: tickets, isLead, currentUser, openTicketId, onOpenTicket, onCloseTicket.
 *
 * Where things are used:
 *   - TicketBoard: features/boards/LeadDashboard.jsx, features/boards/StudentDashboard.jsx
 */

import { COLUMNS } from "../constants/status";
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
              {colTickets.length === 0 && <p className="column-empty">Sector clear.</p>}
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
