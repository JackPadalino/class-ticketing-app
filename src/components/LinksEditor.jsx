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

export function LinksEditor({ links, editable, onChange }) {
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
    const next = [...links, { label: label.trim() || safeUrl, url: safeUrl }];
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
        {links.map((link, i) => (
          <li key={i}>
            <a href={link.url} target="_blank" rel="noreferrer noopener">
              {link.label}
            </a>
            {editable && (
              <button type="button" className="link-remove" onClick={() => removeLink(i)}>
                ✕
              </button>
            )}
          </li>
        ))}
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
