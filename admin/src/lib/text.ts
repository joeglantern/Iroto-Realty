// Rich text from the editor, flattened for previews.
export function plainText(html: string | null | undefined): string {
  if (!html) return '';
  return html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// The editor leaves markup like <p><br></p> behind when cleared; store that as empty.
export function richTextOrEmpty(html: string | null | undefined): string {
  return plainText(html) ? (html as string) : '';
}
