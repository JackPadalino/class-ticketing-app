import { useState } from "react";
import { useComments } from "../hooks/useComments";
import { addComment } from "../ticketActions";

function formatTime(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString();
}

export function CommentThread({ ticketId, canPost, currentUser }) {
  const comments = useComments(ticketId);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const post = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setPosting(true);
    try {
      await addComment(ticketId, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email,
        authorRole: "lead",
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
          <li key={c.id} className={`comment ${c.decision || ""}`}>
            <div className="comment-meta">
              <strong>{c.authorName}</strong>
              {c.decision && <span className={`decision-badge ${c.decision}`}>{c.decision.replace("_", " ")}</span>}
              <span className="comment-time">{formatTime(c.createdAt)}</span>
            </div>
            <p>{c.text}</p>
          </li>
        ))}
      </ul>
      {canPost && (
        <div className="comment-add">
          <textarea
            placeholder="Leave feedback for the student..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
          />
          <button type="button" disabled={posting || !text.trim()} onClick={post}>
            Post comment
          </button>
        </div>
      )}
    </div>
  );
}
