/**
 * Extracts the two domain names from a CLASSES SrdItem content HTML string.
 *
 * The domain line appears inside a blockquote as:
 *   <strong>• DOMAINS:</strong> Domain1 &amp; Domain2
 *
 * Returns an array of (up to two) domain name strings, or an empty array
 * if the pattern is not found.
 */
export function extractDomains(contentHtml: string): string[] {
  // Match the text following "DOMAINS:" up to the next <br or <strong or </p
  const match = contentHtml.match(/DOMAINS:<\/strong>\s*([^<]+)/i);
  if (!match) return [];

  const raw = match[1];
  // Decode HTML entity for ampersand and split on " & "
  const decoded = raw.replace(/&amp;/g, '&');
  return decoded
    .split('&')
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

/**
 * Extracts the hope feature paragraph text from a CLASSES SrdItem content HTML string.
 *
 * The hope feature appears under a heading like:
 *   <h2>BARD'S HOPE FEATURE</h2>
 *   <p>...</p>
 *
 * Returns the inner HTML of the first paragraph after the heading, or null
 * if the pattern is not found.
 *
 * ⚠️ SECURITY: The `contentHtml` argument MUST be Jsoup-sanitised content
 * received from the backend (ADR-002). The returned HTML string is intended
 * for use with `dangerouslySetInnerHTML` and must NEVER be supplied with
 * user-provided or untrusted input.
 */
export function extractHopeFeatureHtml(contentHtml: string): string | null {
  // Match any heading that contains "HOPE FEATURE" (class-name-prefixed variants too)
  const match = contentHtml.match(/<h2>[^<]*HOPE FEATURE[^<]*<\/h2>\s*(<p>[\s\S]*?<\/p>)/i);
  if (!match) return null;
  return match[1];
}
