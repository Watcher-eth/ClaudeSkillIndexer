"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import yaml from "js-yaml";
import { classifySkill } from "./classifySkill";

const PER_PAGE = 100;
const MAX_SEARCH_PAGES = 10;

const QUERIES = [
  "path:.claude/skills filename:SKILL.md",
  "path:skills filename:SKILL.md",
  "path:.cursor filename:SKILL.md",
];

// ---- GitHub token rotation ----
const TOKENS = (process.env.GITHUB_TOKENS ?? process.env.GITHUB_TOKEN ?? "")
  .split(",")
  .map(t => t.trim())
  .filter(Boolean);

let tokenIndex = 0;
function nextToken() {
  const t = TOKENS[tokenIndex % TOKENS.length];
  tokenIndex++;
  return t;
}

// ---- GitHub fetch with exhaustion handling ----
async function githubFetch(url: string, etag?: string) {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${nextToken()}`,
      "User-Agent": "skills-indexer",
      Accept: "application/vnd.github+json",
      ...(etag ? { "If-None-Match": etag } : {}),
    },
  });

  if (res.status === 304) return { notModified: true };
  if (res.status === 422) return { exhausted: true };

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status}: ${body}`);
  }

  const json = await res.json();
  return {
    ...json,
    _etag: res.headers.get("etag") ?? undefined,
  };
}

// ---- Helpers ----
function safeDate(v: any) {
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : Date.now();
}

function popularityScore(stars: number, updatedAt: number, confidence: number) {
  const ageDays = (Date.now() - updatedAt) / 86400000;
  return Math.round(
    Math.log1p(stars) * Math.exp(-ageDays / 180) * confidence * 1000
  );
}

// ---- SKILL.md parser ----
function parseSkillMarkdown(md: string) {
  if (!md.startsWith("---")) return null;

  try {
    const parts = md.split("---");
    if (parts.length < 3) return null;

    const meta = yaml.load(parts[1]) as any;
    const body = parts.slice(2).join("---").trim();

    if (
      !meta ||
      typeof meta.name !== "string" ||
      typeof meta.description !== "string"
    ) {
      return null;
    }

    // Skip templates / placeholders
    if (meta.name.includes("[") || meta.description.includes("[")) {
      return null;
    }

    return {
      name: meta.name.trim(),
      description: meta.description.trim(),
      confidence: typeof meta.confidence === "number" ? meta.confidence : 0.4,
      tags: Array.isArray(meta["allowed-tools"]) ? meta["allowed-tools"] : [],
      body,
    };
  } catch {
    return null;
  }
}

// ---- MAIN ACTION ----
export const run = action({
  args: {},
  handler: async (ctx) => {
    let indexed = 0;

    for (const query of QUERIES) {
      const state = await ctx.runQuery(api.crawler.getState, { query });
      const page = state?.page ?? 1;
      const etag = state?.etag;

      // 🔒 Hard cap to avoid GitHub 422
      if (page > MAX_SEARCH_PAGES) {
        console.log(`[crawler] Page cap reached for "${query}", resetting`);
        await ctx.runMutation(api.crawler.updateState, {
          query,
          page: 1,
          etag: undefined,
        });
        continue;
      }

      const search = await githubFetch(
        `https://api.github.com/search/code?q=${encodeURIComponent(
          query
        )}&per_page=${PER_PAGE}&page=${page}`,
        etag
      );

      // 🛑 Search exhausted (GitHub limit hit)
      if ((search as any).exhausted) {
        console.log(`[crawler] Exhausted search for "${query}", resetting`);
        await ctx.runMutation(api.crawler.updateState, {
          query,
          page: 1,
          etag: undefined,
        });
        continue;
      }

      if ((search as any).notModified) continue;

      for (const item of (search as any).items ?? []) {
        const repo = item.repository;
        if (!repo || repo.fork || !repo.html_url) continue;

        const file = await githubFetch(item.url);
        if (!(file as any)?.content) continue;

        const parsed = parseSkillMarkdown(
          Buffer.from((file as any).content, "base64").toString("utf8")
        );

        if (!parsed) continue;

        // 🧠 Classification
        const classification = classifySkill({
          name: parsed.name,
          description: parsed.description,
          body: parsed.body,
          tags: parsed.tags,
        });

        const updatedAt = safeDate(repo.updated_at);
        const skillKey = `${parsed.name}::${repo.html_url}`;

        await ctx.runMutation(api.skills.upsert, {
          skillKey,
          name: parsed.name,
          description: parsed.description,
          author: repo.owner?.login ?? "unknown",
          repoUrl: repo.html_url,
          stars: repo.stargazers_count ?? 0,
          group: classification.group,
          category: classification.category,
          confidence: Math.max(parsed.confidence, classification.confidence),
          popularity: popularityScore(
            repo.stargazers_count ?? 0,
            updatedAt,
            parsed.confidence
          ),
          tags: parsed.tags,
          readme: parsed.body,
          createdAt: safeDate(repo.created_at),
          updatedAt,
        });

        indexed++;
      }

      await ctx.runMutation(api.crawler.updateState, {
        query,
        page: page + 1,
        etag: (search as any)._etag,
      });
    }

    return { indexed };
  },
});