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
      const needle = q.trim().toLowerCase();
      if (!needle) return [];
  
      let rows;
  
      if (group && category) {
        rows = await ctx.db
          .query("skills")
          .withIndex("by_group_category_popularity", q =>
            q.eq("group", group).eq("category", category)
          )
          .order("desc") // ✅ correct
          .take(200);
      } else {
        rows = await ctx.db
          .query("skills")
          .order("desc") // creationTime desc fallback
          .take(200);
      }
  
      const filtered = rows.filter(r =>
        r.name.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle)
      );
  
      return filtered.slice(0, limit);
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