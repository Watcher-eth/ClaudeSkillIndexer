// src/crawl.ts
import "dotenv/config";
import { githubFetch } from "./github";
import { parseSkillMarkdown } from "./parse";
import { classify } from "./classify";
import type { SkillInput } from "./types";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

const PER_PAGE = 100;
const QUERIES = [
  "path:.claude/skills filename:SKILL.md",
  "path:skills filename:SKILL.md",
  "path:.cursor filename:SKILL.md",
];

function safeDate(v: any): number {
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : Date.now();
}

function popularityScore(stars: number, updatedAt: number, confidence: number) {
  const ageDays = (Date.now() - updatedAt) / 86400000;
  return Math.round(Math.log1p(stars) * Math.exp(-ageDays / 180) * confidence * 1000);
}

export async function crawlOnePage(): Promise<SkillInput[]> {
  const skills: SkillInput[] = [];

  for (const q of QUERIES) {
    const state = await client.query(api.crawler.getState, { query: q });
    const page = state?.page ?? 1;
    const etag = state?.etag;

    const search = await githubFetch(
      `https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=${PER_PAGE}&page=${page}`,
      etag
    );

    if (search.notModified) {
      continue;
    }

    for (const item of search.items ?? []) {
      const repo = item.repository;
      if (!repo || repo.fork) continue;

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

      if (!parsed || parsed.description.length < 40) continue;

      const updatedAt = safeDate(repo.updated_at);
      const skillKey = `${parsed.name}::${repo.html_url}`;
      const { group, category, confidence } = classify(
        parsed.description + "\n" + parsed.body
      );

      skills.push({
        skillKey,
        name: parsed.name,
        description: parsed.description,
        author: repo.owner?.login ?? "unknown",
        repoUrl: repo.html_url,
        stars: repo.stargazers_count ?? 0,
        group,
        category,
        confidence,
        popularity: popularityScore(repo.stargazers_count ?? 0, updatedAt, confidence),
        tags: parsed.tags,
        readme: parsed.body,
        createdAt: safeDate(repo.created_at),
        updatedAt,
      });
    }

    await client.mutation(api.crawler.updateState, {
      query: q,
      page: page + 1,
      etag: search._etag,
    });
  }

  return skills;
}