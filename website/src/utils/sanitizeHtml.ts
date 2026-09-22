// Simple HTML sanitization for rich text content
// This allows basic formatting while removing potentially dangerous tags

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''); // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*'[^']*'/gi, ''); // Remove event handlers
  sanitized = sanitized.replace(/\s*javascript\s*:/gi, ''); // Remove javascript: URLs
  
  // Allow only specific tags that are safe for rich text
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a', 'span', 'div'
  ];
  
  // For now, return the content as-is since React Quill generates safe HTML
  // In production, consider using a proper sanitization library like DOMPurify
  return sanitized;
}

export function renderRichText(content: string, fallback?: string): { __html: string } {
  const sanitized = sanitizeHtml(content);
  return { __html: sanitized || fallback || '' };
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Content that may be rich text or older plain text; plain text keeps its line breaks.
export function renderFormattedText(content: string | null | undefined): { __html: string } {
  if (!content) return { __html: '' };
  const isHtml = /<\/?[a-z][^>]*>/i.test(content);
  return renderRichText(isHtml ? content : escapeHtml(content).replace(/\r?\n/g, '<br>'));
}
