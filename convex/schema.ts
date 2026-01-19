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
    confidence: v.number(),     // ✅ ADD
    popularity: v.number(),     // ✅ ADD
    tags: v.array(v.string()),
    readme: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_group", ["group"])
    .index("by_category", ["category"])
    .index("by_stars", ["stars"])
    .index("by_popularity", ["popularity"]) // optional but useful
    .index("by_repo", ["repoUrl"]), // NEW
});