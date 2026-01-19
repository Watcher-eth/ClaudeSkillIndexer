import { crawlSkills } from "./crawl";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function run() {
  const skills = await crawlSkills();

  for (const skill of skills) {
    await client.mutation(api.skills.upsert, skill);
    console.log("Indexed:", skill.name);
  }

  console.log(`✅ Indexed ${skills.length} skills`);
}

run();