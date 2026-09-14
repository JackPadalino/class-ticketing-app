import { useState } from "react";
import { STATUS, STUDENT_STATUS_OPTIONS, getPhaseLabel, getStatusLabel } from "../constants";
import { LinksEditor } from "./LinksEditor";
import { CommentThread } from "./CommentThread";
import { TicketTimeline } from "./TicketTimeline";
import { approveTicket, requestRevision, updateLinks, updateStudentStatus } from "../ticketActions";

export function TicketDetailModal({ ticket, isLead, currentUser, onClose }) {
  const [busy, setBusy] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    STUDENT_STATUS_OPTIONS.some((o) => o.value === ticket.status) ? ticket.status : STATUS.IN_PROGRESS
  );

  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const studentCanEditLinks = !isLead && ticket.status !== STATUS.COMPLETED;
  const statusLabel = getStatusLabel(ticket);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal ticket-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="ticket-modal-scroll">
          <span className="phase-badge">{getPhaseLabel(ticket.phase)}</span>
          <h2>{ticket.title}</h2>
          <p className="ticket-assignee">Assigned to: {ticket.assignedToName}</p>
          {statusLabel && <span className="status-pill">{statusLabel}</span>}

          <p className="ticket-description">{ticket.description}</p>

          <h4>Links</h4>
          <LinksEditor
            links={ticket.links || []}
            editable={studentCanEditLinks}
            addedByRole={isLead ? "lead" : "student"}
            onChange={(links) => run(() => updateLinks(ticket.id, links))}
          />

          <div className="modal-actions">
            {!isLead && ticket.status !== STATUS.COMPLETED && (
              <div className="status-update">
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  {STUDENT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy || selectedStatus === ticket.status}
                  onClick={() => run(() => updateStudentStatus(ticket, currentUser, selectedStatus))}
                >
                  Update status
                </button>
              </div>
            )}
            {!isLead && ticket.status === STATUS.READY_FOR_REVIEW && (
              <p className="waiting-note">Waiting on lead review.</p>
            )}

            {isLead && ticket.status === STATUS.READY_FOR_REVIEW && (
              <>
                <button disabled={busy} onClick={() => run(() => approveTicket(ticket, currentUser))}>
                  Approve
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => run(() => requestRevision(ticket, currentUser))}
                >
                  Needs revisions
                </button>
              </>
            )}
          </div>

          <CommentThread ticket={ticket} isLead={isLead} currentUser={currentUser} />

          <TicketTimeline ticketId={ticket.id} />
        </div>
      </div>
    </div>
  );
}
