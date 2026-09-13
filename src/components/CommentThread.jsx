import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { addComment, deleteComment, updateComment } from "../ticketActions";

function formatTime(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString();
}

function CommentRow({ ticketId, comment, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const [busy, setBusy] = useState(false);

  const saveEdit = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      await updateComment(ticketId, comment.id, trimmed);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this comment? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteComment(ticketId, comment.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className={`comment ${comment.decision || ""}`}>
      <div className="comment-meta">
        <strong>{comment.authorName}</strong>
        {comment.decision && (
          <span className={`decision-badge ${comment.decision}`}>{comment.decision.replace("_", " ")}</span>
        )}
        <span className="comment-time">
          {formatTime(comment.createdAt)}
          {comment.editedAt && " (edited)"}
        </span>
      </div>

      {editing ? (
        <div className="comment-edit">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} />
          <div className="comment-edit-actions">
            <button type="button" disabled={busy || !draft.trim()} onClick={saveEdit}>
              Save
            </button>
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => {
                setDraft(comment.text);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p>{comment.text}</p>
          {canEdit && (
            <div className="comment-row-actions">
              <button type="button" className="link-style" disabled={busy} onClick={() => setEditing(true)}>
                Edit
              </button>
              <button type="button" className="link-style danger" disabled={busy} onClick={remove}>
                Delete
              </button>
            </div>
          )}
        </>
      )}
    </li>
  );
}

export function CommentThread({ ticket, isLead, currentUser }) {
  const comments = useComments(ticket.id);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const post = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      await addComment(ticket, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorRole: isLead ? "lead" : "student",
        text: trimmed,
      });
      setText("");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="comment-thread">
      <h4>Comments</h4>
      <ul className="comment-list">
        {comments.length === 0 && <li className="comment-empty">No comments yet.</li>}
        {comments.map((c) => (
          <CommentRow
            key={c.id}
            ticketId={ticket.id}
            comment={c}
            canEdit={isLead && c.authorId === currentUser.uid}
          />
        ))}
      </ul>
      <div className="comment-add">
        <textarea
          placeholder={isLead ? "Leave feedback for the student..." : "Ask a question or post an update..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
        <button type="button" disabled={posting || !text.trim()} onClick={post}>
          Post comment
        </button>
      </div>
    </div>
  );
}
