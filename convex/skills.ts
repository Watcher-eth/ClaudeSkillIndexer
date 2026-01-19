import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    author: v.string(),
    repoUrl: v.string(),
    stars: v.number(),
    group: v.string(),
    category: v.string(),
    confidence: v.number(),
    tags: v.array(v.string()),
    readme: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    popularity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_repo", q => q.eq("repoUrl", args.repoUrl))
      .first();

    if (existing) {
      // 🔑 Incremental guard
      if (existing.updatedAt >= args.updatedAt) return;
      await ctx.db.patch(existing._id, {
        ...args,
        indexedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("skills", {
        ...args,
        indexedAt: Date.now(),
      });
    }
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