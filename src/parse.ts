import yaml from "js-yaml";

export function parseSkillMarkdown(md: string) {
  if (!md.startsWith("---")) return null;

  const [, rawYaml, ...rest] = md.split("---");
  const meta = yaml.load(rawYaml) as any;

  if (!meta?.name || !meta?.description) return null;

  return {
    name: meta.name,
    description: meta.description,
    body: rest.join("---").trim(),
    tags: extractTags(meta, md),
  };
}

function extractTags(meta: any, md: string): string[] {
  const tags = new Set<string>();
  const allowedTools = meta["allowed-tools"];

if (allowedTools) {
  if (Array.isArray(allowedTools)) {
    allowedTools.forEach((t: string) => tags.add(t));
  }
}


  md.match(/\b(cli|git|cloud|docker|ai|llm|sql)\b/gi)?.forEach(t =>
    tags.add(t.toLowerCase())
  );

  return [...tags];
}