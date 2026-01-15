export async function fetchRepoTimestamp(
  baseUrl: string,
  repoPath: string,
  signal: AbortSignal
): Promise<null | number> {
  try {
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const fullUrl = `${base}${repoPath}/lastupdate`;

    const res = await fetch(fullUrl, {next: {revalidate: 60}, signal});
    if (!res.ok) return null;

    const text = await res.text();
    const timestamp = Number.parseInt(text.trim(), 10);
    return Number.isNaN(timestamp) ? null : timestamp / 1000;
  } catch {
    return null;
  }
}
