// convex/skills.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    skillKey: v.string(),

    name: v.string(),
    description: v.string(),
    author: v.string(),
    repoUrl: v.string(),

    stars: v.number(),
    group: v.string(),
    category: v.string(),
    confidence: v.number(),
    popularity: v.number(),

    tags: v.array(v.string()),
    readme: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_skillKey", q => q.eq("skillKey", args.skillKey))
      .first();

    if (existing && existing.updatedAt >= args.updatedAt) {
      return { skipped: true };
    }

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { updated: true };
    }

    await ctx.db.insert("skills", args);
    return { inserted: true };
  },
});

export const getByRepo = query({
  args: { repoUrl: v.string() },
  handler: async (ctx, { repoUrl }) => {
    return ctx.db
      .query("skills")
      .withIndex("by_repo", q => q.eq("repoUrl", repoUrl))
      .first();
  },
});