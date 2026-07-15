export function toRelativeImageUrl(url: string): string {
  if (!url) return url;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url;
  }
}
