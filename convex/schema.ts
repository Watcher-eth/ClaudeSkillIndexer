// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  skills: defineTable({
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
  })
    // identity
    .index("by_skillKey", ["skillKey"])

    // repo lookups (REQUIRED by getByRepo)
    .index("by_repo", ["repoUrl"])

    // category browsing + ordering
    .index(
      "by_group_category_popularity",
      ["group", "category", "popularity"]
    )

    // full-text search
    .searchIndex("search_text", {
      searchField: "name",
      filterFields: ["group", "category"],
    }),

  crawlState: defineTable({
    query: v.string(),
    page: v.number(),
    etag: v.optional(v.string()),
    lastRun: v.number(),
  }).index("by_query", ["query"]),
});