// Bold is the only supported formatting; all other content stays plain text.
export function splitFeedBold(value) {
  const source = String(value ?? '');
  const parts = [];
  const pattern = /\*\*([^*\s](?:[^*]*?[^*\s])?)\*\*/gu;
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > cursor) parts.push({ text: source.slice(cursor, match.index), bold: false });
    parts.push({ text: match[1], bold: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < source.length) parts.push({ text: source.slice(cursor), bold: false });
  return parts;
}

export function toggleFeedBold(value, start, end) {
  const source = String(value ?? '');
  const selected = source.slice(start, end);
  if (start >= 2 && source.slice(start - 2, start) === '**' && source.slice(end, end + 2) === '**') {
    return {
      content: source.slice(0, start - 2) + selected + source.slice(end + 2),
      start: start - 2,
      end: end - 2,
    };
  }
  if (selected.length > 4 && selected.startsWith('**') && selected.endsWith('**')) {
    return {
      content: source.slice(0, start) + selected.slice(2, -2) + source.slice(end),
      start,
      end: end - 4,
    };
  }
  const label = selected || '굵은 글씨';
  // Keep surrounding whitespace outside the markers (including line breaks).
  const leading = label.match(/^\s*/u)[0];
  const trailing = label.match(/\s*$/u)[0];
  const body = label.trim();
  if (!body) return { content: source, start, end };
  return {
    content: source.slice(0, start) + leading + '**' + body + '**' + trailing + source.slice(end),
    start: start + leading.length + 2,
    end: start + leading.length + 2 + body.length,
  };
}
