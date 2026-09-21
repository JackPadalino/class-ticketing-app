const URL_REGEX = /https?:\/\/[^\s]+/g;
// A trailing char that's almost always punctuation closing the sentence
// rather than part of the URL itself (e.g. "see https://example.com."
// or "(https://example.com)").
const TRAILING_PUNCTUATION = /[).,;:!?\]}'"]+$/;

// Turns any http(s) URL inside plain text into a clickable link that
// opens in a new tab, leaving the rest of the text untouched. Returns
// an array of strings/<a> elements suitable for rendering directly
// inside a React element (e.g. <p>{linkify(text)}</p>).
export function linkify(text) {
  if (!text) return text;

  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  URL_REGEX.lastIndex = 0;

  while ((match = URL_REGEX.exec(text))) {
    let url = match[0];
    let end = URL_REGEX.lastIndex;
    const trailing = url.match(TRAILING_PUNCTUATION);
    if (trailing) {
      url = url.slice(0, url.length - trailing[0].length);
      end -= trailing[0].length;
    }
    if (!url) continue;

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a key={key++} href={url} target="_blank" rel="noreferrer noopener">
        {url}
      </a>
    );
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
