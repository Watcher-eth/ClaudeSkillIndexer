import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  skills: defineTable({
    name: v.string(),
    description: v.string(),
    author: v.string(),
    repoUrl: v.string(),
    stars: v.number(),

    group: v.string(),
    category: v.string(),
    confidence: v.number(), // NEW (0–1)

    tags: v.array(v.string()),
    readme: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),

    indexedAt: v.number(), // NEW
    popularity: v.number(), // NEW (ranking score)
  })
    .index("by_name", ["name"])
    .index("by_repo", ["repoUrl"])
    .index("by_category", ["category"])
    .index("by_group", ["group"])
    .index("by_popularity", ["popularity"]),
});