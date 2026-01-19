// src/github.ts
import "dotenv/config";

const TOKENS = (process.env.GITHUB_TOKENS ?? process.env.GITHUB_TOKEN ?? "")
  .split(",")
  .map(t => t.trim())
  .filter(Boolean);

let tokenIndex = 0;

function nextToken() {
  const token = TOKENS[tokenIndex % TOKENS.length];
  tokenIndex++;
  return token;
}

export async function githubFetch(
  url: string,
  etag?: string
): Promise<any & { _etag?: string }> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${nextToken()}`,
      "User-Agent": "skills-indexer",
      Accept: "application/vnd.github+json",
      ...(etag ? { "If-None-Match": etag } : {}),
    },
  });

  if (res.status === 304) {
    return { notModified: true };
  }

  if (!res.ok) {
    throw new Error(`GitHub error ${res.status}`);
  }

  const data = await res.json();
  (data as any)._etag = res.headers.get("etag") ?? undefined;
  return data;
}