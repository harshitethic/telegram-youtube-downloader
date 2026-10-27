/** Return an 11-character YouTube video ID from a supported HTTP(S) link. */
export function extractVideoId(input) {
  try {
    const url = new URL(input);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    let id;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.split('/')[1];
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v');
      } else {
        const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)\/?$/);
        id = match?.[1];
      }
    } else {
      return null;
    }
    return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
