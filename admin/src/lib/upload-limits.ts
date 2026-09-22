'use client';

// Images above the recommended size can still be uploaded after the admin confirms;
// only files above the hard limit are refused (the server enforces the same ceiling).
export const RECOMMENDED_MAX_MB = 40;
export const HARD_MAX_MB = 100;
export const RECOMMENDED_MAX_BYTES = RECOMMENDED_MAX_MB * 1024 * 1024;
export const HARD_MAX_BYTES = HARD_MAX_MB * 1024 * 1024;

export const formatFileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const isTooLargeToUpload = (file: File) => file.size > HARD_MAX_BYTES;

const BRAND = '#713900';
const AMBER = '#b45309';

function el<K extends keyof HTMLElementTagNameMap>(tag: K, style: Partial<CSSStyleDeclaration>, text?: string) {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  if (text !== undefined) node.textContent = text;
  return node;
}

// Resolves true when there is nothing to warn about, or when the admin chooses to continue.
export function confirmLargeImages(files: File[]): Promise<boolean> {
  const large = files.filter(file => file.size > RECOMMENDED_MAX_BYTES && !isTooLargeToUpload(file));
  if (large.length === 0 || typeof document === 'undefined') return Promise.resolve(true);

  return new Promise(resolve => {
    const backdrop = el('div', {
      position: 'fixed', inset: '0', background: 'rgba(17,24,39,0.55)', zIndex: '99998',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      animation: 'iroto-backdrop-in 0.15s ease-out',
    });
    backdrop.setAttribute('role', 'presentation');

    const dialog = el('div', {
      background: '#ffffff', borderRadius: '14px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
      maxWidth: '460px', width: '100%', overflow: 'hidden', fontFamily: 'inherit',
      animation: 'iroto-dialog-in 0.18s ease-out', maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column',
    });
    dialog.setAttribute('role', 'alertdialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'iroto-large-upload-title');
    dialog.setAttribute('aria-describedby', 'iroto-large-upload-body');

    // Header band
    const header = el('div', { display: 'flex', alignItems: 'center', gap: '14px', padding: '20px 24px 16px', background: '#fffbeb', borderBottom: '1px solid #fde68a' });
    const icon = el('div', {
      width: '44px', height: '44px', borderRadius: '50%', background: '#fef3c7', color: AMBER,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0',
    });
    icon.innerHTML =
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3 .7 0 1.37-.03 2-.1"/>' +
      '<path d="M19 15v3"/><path d="M19 21h.01"/></svg>';
    const titleWrap = el('div', {});
    const title = el('h3', { margin: '0', fontSize: '17px', fontWeight: '700', color: '#111827' },
      large.length === 1 ? 'This image is larger than recommended' : `${large.length} images are larger than recommended`);
    title.id = 'iroto-large-upload-title';
    const subtitle = el('p', { margin: '2px 0 0', fontSize: '13px', color: '#92400e' }, `Recommended maximum: ${RECOMMENDED_MAX_MB} MB per image`);
    titleWrap.append(title, subtitle);
    header.append(icon, titleWrap);

    // Body
    const body = el('div', { padding: '18px 24px 8px', overflowY: 'auto' });
    body.id = 'iroto-large-upload-body';

    const list = el('ul', { listStyle: 'none', margin: '0 0 16px', padding: '0', display: 'flex', flexDirection: 'column', gap: '6px' });
    large.slice(0, 5).forEach(file => {
      const item = el('li', {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px',
      });
      const name = el('span', { color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: '0' }, file.name);
      name.title = file.name;
      const size = el('span', {
        flexShrink: '0', fontWeight: '700', color: AMBER, background: '#fef3c7', padding: '2px 8px', borderRadius: '999px', fontSize: '12px',
      }, formatFileSize(file.size));
      item.append(name, size);
      list.append(item);
    });
    if (large.length > 5) {
      list.append(el('li', { fontSize: '12px', color: '#6b7280', paddingLeft: '4px' }, `and ${large.length - 5} more`));
    }

    const explain = el('p', { margin: '0 0 12px', fontSize: '14px', lineHeight: '1.55', color: '#374151' },
      'Large images take longer to upload and use more of the website’s storage space on the server.');

    const reassure = el('div', {
      display: 'flex', gap: '10px', padding: '12px 14px', margin: '0 0 12px',
      background: '#f5ebe0', borderRadius: '10px', fontSize: '13px', lineHeight: '1.55', color: '#4a2600',
    });
    const infoDot = el('span', {
      flexShrink: '0', width: '20px', height: '20px', borderRadius: '50%', background: BRAND, color: '#ffffff',
      fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px',
    }, 'i');
    const reassureText = el('span', {});
    const strong = el('strong', {}, 'This won’t fill up the storage right away. ');
    reassureText.append(strong, document.createTextNode(
      'Each large image simply adds to the total space used over time, so it’s fine now and then — it only adds up if many large images are uploaded.'));
    reassure.append(infoDot, reassureText);

    const tip = el('p', { margin: '0 0 8px', fontSize: '12px', lineHeight: '1.5', color: '#6b7280' },
      'Tip: saving photos as high-quality JPEG around 2500 px wide usually brings them under 5 MB with no visible difference.');

    body.append(list, explain, reassure, tip);

    // Footer
    const footer = el('div', { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px 20px', flexWrap: 'wrap' });
    const cancelBtn = el('button', {
      padding: '10px 18px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff',
      color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
    }, large.length === 1 ? 'Choose a smaller image' : 'Remove large images');
    cancelBtn.type = 'button';
    const continueBtn = el('button', {
      padding: '10px 18px', borderRadius: '8px', border: 'none', background: BRAND,
      color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
    }, 'Continue anyway');
    continueBtn.type = 'button';
    footer.append(cancelBtn, continueBtn);

    const cleanup = (result: boolean) => {
      document.removeEventListener('keydown', onKey);
      backdrop.remove();
      resolve(result);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cleanup(false);
    };
    cancelBtn.onclick = () => cleanup(false);
    continueBtn.onclick = () => cleanup(true);
    backdrop.onclick = e => {
      if (e.target === backdrop) cleanup(false);
    };
    document.addEventListener('keydown', onKey);

    dialog.append(header, body, footer);
    backdrop.append(dialog);
    document.body.append(backdrop);
    cancelBtn.focus();
  });
}

// Filter a selection: refuse files over the hard limit, and ask before keeping ones over the recommended size.
// Returns the files to keep plus messages for any that were refused.
export async function screenImageSizes(files: File[]): Promise<{ accepted: File[]; refused: string[] }> {
  const refused = files.filter(isTooLargeToUpload).map(file => `${file.name}: ${formatFileSize(file.size)} is over the ${HARD_MAX_MB} MB limit`);
  const candidates = files.filter(file => !isTooLargeToUpload(file));
  const proceed = await confirmLargeImages(candidates);
  const accepted = proceed ? candidates : candidates.filter(file => file.size <= RECOMMENDED_MAX_BYTES);
  return { accepted, refused };
}
