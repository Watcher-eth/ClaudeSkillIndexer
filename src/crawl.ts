import "dotenv/config";
import { githubFetch } from "./github";
import { parseSkillMarkdown } from "./parse";
import { classify } from "./classify";
import type { SkillInput } from "./types";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const MAX_PAGES = 5;
const PER_PAGE = 100;

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function safeDate(v: any): number {
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : Date.now();
}

function popularityScore(
  stars: number,
  updatedAt: number,
  confidence: number
) {
  const ageDays = (Date.now() - updatedAt) / (1000 * 60 * 60 * 24);
  const freshness = Math.exp(-ageDays / 180);
  return Math.round(Math.log1p(stars) * freshness * confidence * 1000);
}

/* ---------------------------------- */
/* Main crawler */
/* ---------------------------------- */

export async function crawlSkills(): Promise<SkillInput[]> {
  const queries = [
    "path:.claude/skills filename:SKILL.md",
    "path:skills filename:SKILL.md",
    "path:.cursor filename:SKILL.md",
  ];

  const skills: SkillInput[] = [];
  const seenRepos = new Set<string>();

  for (const q of queries) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const search = await githubFetch(
        `https://api.github.com/search/code?q=${encodeURIComponent(
          q
        )}&per_page=${PER_PAGE}&page=${page}`
      );

      const items = search.items ?? [];
      console.log(`Query "${q}" page ${page}: ${items.length}`);

      if (items.length === 0) break;

      for (const item of items) {
        const repo = item.repository;
        if (!repo || repo.fork || !repo.html_url) continue;
        if (seenRepos.has(repo.html_url)) continue;
        seenRepos.add(repo.html_url);

        const updatedAt = safeDate(repo.updated_at);

        // // 🔁 Incremental check
        // const existing = await client.query(api.skills.getByRepo, {
        //   repoUrl: repo.html_url,
        // });

        // if (existing && existing.updatedAt >= updatedAt) {
        //   continue;
        // }

        const file = await githubFetch(item.url);
        if (!file?.content) continue;

        let parsed;
        try {
          parsed = parseSkillMarkdown(
            Buffer.from(file.content, "base64").toString("utf8")
          );
        } catch {
          continue;
        }

        if (!parsed) continue;

        const { group, category, confidence } = classify(
          parsed.description + "\n" + parsed.body
        );

        skills.push({
          name: parsed.name,
          description: parsed.description,
          author: repo.owner?.login ?? "unknown",
          repoUrl: repo.html_url,
          stars: repo.stargazers_count ?? 0,
          group,
          category,
          confidence,
          popularity: popularityScore(
            repo.stargazers_count ?? 0,
            updatedAt,
            confidence
          ),
          tags: parsed.tags,
          readme: parsed.body,
          createdAt: safeDate(repo.created_at),
          updatedAt,
        });
      }
    }
  }

  return skills;
}