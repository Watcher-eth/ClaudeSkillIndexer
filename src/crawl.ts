import { githubFetch } from "./github";
import { parseSkillMarkdown } from "./parse";
import { classify } from "./classify";
import type { SkillInput } from "./types"; // adjust path if needed


function popularityScore(
  stars: number,
  updatedAt: number,
  confidence: number
) {
  const ageDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24);
  const freshness = Math.exp(-ageDays / 180); // 6-month half-life

  return Math.round((Math.log1p(stars) * freshness * confidence) * 1000);
}

export async function crawlSkills(): Promise<SkillInput[]> {
  const queries = [
    "path:.claude/skills filename:SKILL.md",
    "path:skills filename:SKILL.md",
    "path:.cursor filename:SKILL.md",
  ];

  const skills: SkillInput[] = [];
  const seenRepos = new Set<string>();

  for (const q of queries) {
    const search = await githubFetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=100`
    );

    console.log("Query returned:", search.items?.length ?? 0);

    for (const item of search.items ?? []) {
      const repo = item.repository;

      
      if (!repo || repo.fork || !repo.html_url) continue;
      if (seenRepos.has(repo.html_url)) continue;
      seenRepos.add(repo.html_url);

      

      const file = await githubFetch(item.url);
      if (!file?.content) continue;

      const content = Buffer.from(file.content, "base64").toString("utf8");
      const parsed = parseSkillMarkdown(content);
      if (!parsed) continue;
      console.log("✓ Parsed skill:", parsed.name, "from", repo.full_name);
      const { group, category, confidence } = classify(
        parsed.description + "\n" + parsed.body
      );

      skills.push({
        name: parsed.name,
        description: parsed.description,
        author: repo.owner.login,
        repoUrl: repo.html_url,
        stars: repo.stargazers_count,
        group,
        category,
        confidence,
        popularity: popularityScore(
          repo.stargazers_count,
          Date.parse(repo.updated_at),
          confidence
        ),
        tags: parsed.tags,
        readme: parsed.body,
        createdAt: Date.parse(repo.created_at),
        updatedAt: Date.parse(repo.updated_at),
      });
    }
  }

  return skills;
}