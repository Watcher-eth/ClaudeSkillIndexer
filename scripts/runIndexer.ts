import "dotenv/config";
import { crawlSkills } from "../src/crawl";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function main() {
  console.log("🔍 Crawling GitHub…");
  const skills = await crawlSkills();
  console.log(`Found ${skills.length} skills`);
console.log("ENV", process.env.CONVEX_URL);
  let indexed = 0;

  for (const skill of skills) {
    console.log("→ Upserting:", skill.name, skill.repoUrl);
    await client.mutation(api.skills.upsert, skill);
    console.log("Inserted:", skill.name);
    indexed++;
    if (indexed % 25 === 0) {
      console.log(`Indexed ${indexed}/${skills.length}`);
    }
  }

  console.log(`✅ Done. Indexed ${indexed} skills.`);
}

main();