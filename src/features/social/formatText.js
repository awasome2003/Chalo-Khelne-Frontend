/**
 * Extract @tagged users from text.
 */
export function extractTags(text) {
  if (!text) return [];
  const matches = text.match(/@(\w+)/g);
  return matches ? matches.map((tag) => tag.substring(1)) : [];
}

/**
 * Render text with @mentions (blue) and #hashtags (purple) highlighted.
 * Returns array of React elements.
 */
export function formatDescription(text) {
  if (!text) return null;
  const parts = text.split(/(@\w+|#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <span key={i} className="text-blue-600 font-semibold cursor-pointer hover:underline">
          {part}
        </span>
      );
    }
    if (part.startsWith("#")) {
      return (
        <span key={i} className="text-purple-600 font-semibold cursor-pointer hover:underline">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
