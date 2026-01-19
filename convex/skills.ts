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
    tags: v.array(v.string()),
    readme: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", q => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("skills", args);
    }
  },
});