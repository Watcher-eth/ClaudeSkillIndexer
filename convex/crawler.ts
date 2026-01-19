// convex/crawler.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getState = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return ctx.db
      .query("crawlState")
      .withIndex("by_query", q => q.eq("query", query))
      .first();
  },
});

export const updateState = mutation({
  args: {
    query: v.string(),
    page: v.number(),
    etag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("crawlState")
      .withIndex("by_query", q => q.eq("query", args.query))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        page: args.page,
        etag: args.etag,
        lastRun: Date.now(),
      });
    } else {
      await ctx.db.insert("crawlState", {
        ...args,
        lastRun: Date.now(),
      });
    }
  },
});