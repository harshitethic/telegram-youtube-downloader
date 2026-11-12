// Validate video links without trusting lookalike hostnames.
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function extractVideoId(input) {
  if (typeof input !== 'string') return null;

  try {
    const url = new URL(input);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    const host = url.hostname.toLowerCase();
    let videoId = null;

    if (host === 'youtu.be') {
      videoId = url.pathname.slice(1).split('/')[0];
    } else if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
      if (url.pathname === '/watch') {
        videoId = url.searchParams.get('v');
      } else {
        const match = url.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
        videoId = match?.[2] ?? null;
      }
    }

    return VIDEO_ID_PATTERN.test(videoId || '') ? videoId : null;
  } catch {
    return null;
  }
}
