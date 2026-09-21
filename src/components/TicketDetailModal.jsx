import { useState } from "react";
import {
  LEAD_STATUS_OPTIONS,
  STATUS,
  STUDENT_STATUS_OPTIONS,
  formatDueDate,
  getPhaseLabel,
  getStatusLabel,
  isOverdue,
  isStudentStatusUpdateAllowed,
} from "../constants";
import { useSettings } from "../hooks/useSettings";
import { LinksEditor } from "./LinksEditor";
import { CommentThread } from "./CommentThread";
import { TicketTimeline } from "./TicketTimeline";
import {
  approveTicket,
  markNeedSupport,
  requestRevision,
  updateDueDate,
  updateLinks,
  updateStudentStatus,
  updateTicketStatusAsLead,
} from "../ticketActions";

export function TicketDetailModal({ ticket, isLead, currentUser, onClose }) {
  const settings = useSettings();
  const canStudentUpdateStatus = isStudentStatusUpdateAllowed(settings);
  const [busy, setBusy] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    STUDENT_STATUS_OPTIONS.some((o) => o.value === ticket.status) ? ticket.status : STATUS.IN_PROGRESS
  );
  const [selectedLeadStatus, setSelectedLeadStatus] = useState(
    LEAD_STATUS_OPTIONS.some((o) => o.value === ticket.status) ? ticket.status : STATUS.IN_PROGRESS
  );
  const [showSupportPrompt, setShowSupportPrompt] = useState(false);
  const [supportComment, setSupportComment] = useState("");

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
  const overdue = isOverdue(ticket.dueDate, ticket.status);

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    if (value !== STATUS.NEED_SUPPORT) setShowSupportPrompt(false);
  };

  const handleUpdateStatusClick = () => {
    if (selectedStatus === STATUS.NEED_SUPPORT) {
      setShowSupportPrompt(true);
      return;
    }
    run(() => updateStudentStatus(ticket, currentUser, selectedStatus));
  };

  const submitSupportComment = () => {
    const trimmed = supportComment.trim();
    if (!trimmed) return;
    run(async () => {
      await markNeedSupport(ticket, currentUser, trimmed);
      setShowSupportPrompt(false);
      setSupportComment("");
    });
  };

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
          {statusLabel && (
            <span className={`status-pill ${ticket.status === STATUS.NEED_SUPPORT ? "need-support" : ""}`}>
              {statusLabel}
            </span>
          )}

          {isLead ? (
            <div className="due-date-field">
              <label htmlFor="due-date-input">Due date</label>
              <input
                id="due-date-input"
                type="date"
                value={ticket.dueDate || ""}
                onChange={(e) => run(() => updateDueDate(ticket.id, e.target.value))}
              />
            </div>
          ) : (
            ticket.dueDate && (
              <p className={`ticket-due-date ${overdue ? "overdue" : ""}`}>
                Due: {formatDueDate(ticket.dueDate)}
              </p>
            )
          )}

          <p className="ticket-description">{ticket.description}</p>

          <h4>Links</h4>
          <LinksEditor
            links={ticket.links || []}
            editable={studentCanEditLinks}
            addedByRole={isLead ? "lead" : "student"}
            onChange={(links) => run(() => updateLinks(ticket.id, links))}
          />

          <div className="modal-actions">
            {isLead && (
              <div className="status-update">
                <select value={selectedLeadStatus} onChange={(e) => setSelectedLeadStatus(e.target.value)}>
                  {LEAD_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <button
                  disabled={busy || selectedLeadStatus === ticket.status}
                  onClick={() => run(() => updateTicketStatusAsLead(ticket, currentUser, selectedLeadStatus))}
                >
                  Update status
                </button>
              </div>
            )}

            {!isLead && ticket.status !== STATUS.COMPLETED && (
              canStudentUpdateStatus ? (
                <div className="status-update">
                  <select value={selectedStatus} onChange={(e) => handleStatusChange(e.target.value)}>
                    {STUDENT_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button disabled={busy || selectedStatus === ticket.status} onClick={handleUpdateStatusClick}>
                    Update status
                  </button>
                </div>
              ) : (
                <p className="hint">Only your lead can update this ticket's status right now.</p>
              )
            )}

            {!isLead && canStudentUpdateStatus && showSupportPrompt && (
              <div className="support-prompt">
                <p className="support-prompt-message">
                  Let the lead know what you're stuck on — a comment is required before marking a ticket
                  "Need support."
                </p>
                <textarea
                  value={supportComment}
                  onChange={(e) => setSupportComment(e.target.value)}
                  placeholder="What do you need help with?"
                  rows={3}
                  autoFocus
                />
                <div className="support-prompt-actions">
                  <button disabled={busy || !supportComment.trim()} onClick={submitSupportComment}>
                    Submit & mark Need support
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={() => {
                      setShowSupportPrompt(false);
                      setSupportComment("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
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
