// scripts/runIndexer.ts
import { mutation } from "../convex/_generated/server";
import { crawlOnePage } from "../src/crawl";
import { api } from "../convex/_generated/api";

export const run = mutation({
  args: {},
  handler: async (ctx) => {
    const skills = await crawlOnePage();
    for (const skill of skills) {
      await ctx.runMutation(api.skills.upsert, skill);
    }
    return { indexed: skills.length };
  },
});