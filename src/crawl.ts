import { githubFetch } from "./github";
import { parseSkillMarkdown } from "./parse";
import { classify } from "./classify";
import type { SkillInput } from "./types"; // adjust path if needed

export async function crawlSkills(): Promise<SkillInput[]> {
  const query = "filename:SKILL.md";
  const search = await githubFetch(
    `https://api.github.com/search/code?q=${encodeURIComponent(query)}&per_page=100`
  );

  const skills: SkillInput[] = [];

  for (const item of search.items) {
    const repo = item.repository;
    const file = await githubFetch(item.url);

    const content = Buffer.from(file.content, "base64").toString("utf8");
    const parsed = parseSkillMarkdown(content);
    if (!parsed) continue;

    const { group, category } = classify(
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
      tags: parsed.tags,
      readme: parsed.body,
      createdAt: Date.parse(repo.created_at),
      updatedAt: Date.parse(repo.updated_at),
    });
  }

  return skills;
}