import { parseSkillMarkdown } from "../src/parse";
import { readFileSync } from "fs";

const md = readFileSync("./fixtures/sample-skill.md", "utf8");
console.log(parseSkillMarkdown(md));