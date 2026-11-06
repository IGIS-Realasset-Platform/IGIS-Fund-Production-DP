import React from 'react';
import { splitFeedBold } from '../../utils/workFeedBold';

// Same URL, punctuation and mention rendering as the 8083 feed.
const URL_CANDIDATE_PATTERN = /https?:\/\/[^\s<>"']+/giu;
const URL_TRAILING_PUNCTUATION = /[.,!?;:。！？；：]/u;
const escapeRegularExpression = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const trimUrlPunctuation = (candidate) => {
  let url = candidate;
  let trailing = '';
  while (url) {
    const lastCharacter = url.at(-1);
    const pair = lastCharacter === ')' ? ['(', ')']
      : lastCharacter === ']' ? ['[', ']']
        : lastCharacter === '}' ? ['{', '}']
          : null;
    if (URL_TRAILING_PUNCTUATION.test(lastCharacter)) {
      trailing = lastCharacter + trailing;
      url = url.slice(0, -1);
      continue;
    }
    if (pair) {
      const openingCount = [...url].filter((character) => character === pair[0]).length;
      const closingCount = [...url].filter((character) => character === pair[1]).length;
      if (closingCount > openingCount) {
        trailing = lastCharacter + trailing;
        url = url.slice(0, -1);
        continue;
      }
    }
    break;
  }
  return { url, trailing };
};

export default function WorkFeedText({ text, mentions = [] }) {
  const source = String(text || '');
  const parts = splitFeedBold(source);
  if (parts.some((part) => part.bold)) {
    return parts.map((part, index) => part.bold ? (
      <strong key={index} className="font-bold">
        <WorkFeedText text={part.text} mentions={mentions} />
      </strong>
    ) : <WorkFeedText key={index} text={part.text} mentions={mentions} />);
  }
  const mentionLabels = [...new Set(mentions
    .map((mention) => String(mention?.name || mention?.label || mention || '').trim())
    .filter(Boolean))]
    .sort((left, right) => right.length - left.length);
  const mentionPattern = mentionLabels.length
    ? new RegExp(`@(${mentionLabels.map(escapeRegularExpression).join('|')})`, 'gu')
    : null;
  const tokenPattern = mentionPattern
    ? new RegExp(`${URL_CANDIDATE_PATTERN.source}|${mentionPattern.source}`, 'giu')
    : URL_CANDIDATE_PATTERN;
  const nodes = [];
  let cursor = 0;
  for (const [index, match] of [...source.matchAll(tokenPattern)].entries()) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(source.slice(cursor, start));
    if (match[0].startsWith('@')) {
      nodes.push(
        <span
          key={`mention-${start}-${index}`}
          data-feed-mention
          className="font-bold text-[#9ab8b1]"
        >
          {match[0]}
        </span>,
      );
      cursor = start + match[0].length;
      continue;
    }
    const { url, trailing } = trimUrlPunctuation(match[0]);
    let isSafeExternalUrl = false;
    try {
      const parsed = new URL(url);
      isSafeExternalUrl = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      isSafeExternalUrl = false;
    }
    nodes.push(isSafeExternalUrl ? (
      <a
        key={`${start}-${index}`}
        data-feed-external-link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="cursor-pointer break-all text-[#78add6] underline decoration-[#78add6]/55 underline-offset-2 hover:text-[#a5c9e5]"
      >
        {url}
      </a>
    ) : url);
    if (trailing) nodes.push(trailing);
    cursor = start + match[0].length;
  }
  if (cursor < source.length) nodes.push(source.slice(cursor));
  return <>{nodes}</>;
}

