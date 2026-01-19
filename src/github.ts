const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

export async function githubFetch(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "skills-indexer",
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) throw new Error(`GitHub error ${res.status}`);
  return res.json();
}