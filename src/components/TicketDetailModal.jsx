import { useState } from "react";
import { STATUS, STUDENT_STATUS_OPTIONS, getStatusLabel } from "../constants";
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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ✕
        </button>

        <span className="phase-badge">{ticket.phase}</span>
        <h2>{ticket.title}</h2>
        {statusLabel && <span className="status-pill">{statusLabel}</span>}

        <p className="ticket-description">{ticket.description}</p>

        <h4>Links</h4>
        <LinksEditor
          links={ticket.links || []}
          editable={studentCanEditLinks}
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

        <CommentThread ticketId={ticket.id} canPost={isLead} currentUser={currentUser} />

        <TicketTimeline ticketId={ticket.id} />
      </div>
    </div>
  );
}
