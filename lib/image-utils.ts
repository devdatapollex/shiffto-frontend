export function toRelativeImageUrl(url: string): string {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    // REVERT_MARKER: Remove this dev workaround if only uploads should be supported.
    // Keep external hosts (like placeholders and seeds) absolute so they resolve correctly
    if (!urlObj.pathname.startsWith('/uploads/')) {
      return url;
    }
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}
