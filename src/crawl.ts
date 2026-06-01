export function normalizeURL(urlString: string): string {
  const urlObj = new URL(urlString);
  const hostPath = `${urlObj.hostname}${urlObj.pathname}`;
  
  // If the path ends in a slash, we want to strip it off
  if (hostPath.length > 0 && hostPath.endsWith('/')) {
    return hostPath.slice(0, -1);
  }
  
  return hostPath;
}