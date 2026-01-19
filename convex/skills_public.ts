import { query } from "./_generated/server";
import { v } from "convex/values";

export const search = query({
    args: {
      q: v.string(),
      limit: v.optional(v.number()),
      group: v.optional(v.string()),
      category: v.optional(v.string()),
    },
    handler: async (ctx, { q, limit = 20, group, category }) => {
      if (!q.trim()) return [];
  
      return ctx.db
        .search("skills", "search_text", {
          query: q,
        })
        .filter(qb =>
          qb.and(
            group ? qb.eq(qb.field("group"), group) : qb.true(),
            category ? qb.eq(qb.field("category"), category) : qb.true()
          )
        )
        .take(limit);
    },
  });

  export const byGroupCategory = query({
    args: {
      group: v.string(),
      category: v.string(),
      limit: v.optional(v.number()),
    },
    handler: async (ctx, { group, category, limit = 50 }) => {
      return ctx.db
        .query("skills")
        .withIndex("by_group_category_popularity", q =>
          q.eq("group", group).eq("category", category)
        )
        .take(limit)
        .then(rows => rows.reverse()); // 🔑 popularity DESC
    },
  });