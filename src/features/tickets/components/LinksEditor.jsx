import { useState } from "react";

function toSafeHttpUrl(raw) {
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch {
    return null;
  }
}

// `addedByRole` is whichever role ("student" | "lead") is viewing/editing
// right now. A link only gets stamped with `addedBy` when it's created,
// and can only be removed by that same role - so a student can never
// remove a link the lead placed on the ticket (and vice versa). Links
// from before this existed have no `addedBy` and are treated as
// student-added, since only students could add links at all back then.
export function LinksEditor({ links, editable, addedByRole = "student", onChange }) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const addLink = () => {
    const raw = url.trim();
    if (!raw) return;
    const safeUrl = toSafeHttpUrl(raw);
    if (!safeUrl) {
      alert("Please enter a valid http:// or https:// link.");
      return;
    }
    const next = [...links, { label: label.trim() || safeUrl, url: safeUrl, addedBy: addedByRole }];
    onChange(next);
    setLabel("");
    setUrl("");
  };

  const removeLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div className="links-editor">
      <ul className="links-list">
        {links.length === 0 && <li className="links-empty">No links yet.</li>}
        {links.map((link, i) => {
          const canRemove = editable && (link.addedBy || "student") === addedByRole;
          return (
            <li key={i}>
              <a href={link.url} target="_blank" rel="noreferrer noopener">
                {link.label}
              </a>
              {canRemove && (
                <button type="button" className="link-remove" onClick={() => removeLink(i)}>
                  ✕
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {editable && (
        <div className="links-add">
          <input
            placeholder="Label (e.g. Design doc)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            placeholder="https://docs.google.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addLink()}
          />
          <button type="button" onClick={addLink}>
            Add link
          </button>
        </div>
      )}
    </div>
  );
}
