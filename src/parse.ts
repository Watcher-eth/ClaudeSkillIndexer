import yaml from "js-yaml";

export function parseSkillMarkdown(md: string) {
  if (!md.startsWith("---")) return null;

  let meta: any;
  let body = "";

  try {
    const parts = md.split("---");
    if (parts.length < 3) return null;

    meta = yaml.load(parts[1]);
    body = parts.slice(2).join("---").trim();
  } catch {
    // ❌ Invalid YAML → skip
    return null;
  }

  if (
    !meta ||
    typeof meta.name !== "string" ||
    typeof meta.description !== "string"
  ) {
    return null;
  }

  // ❌ Skip template / placeholder skills
  if (
    meta.name.includes("[") ||
    meta.description.includes("[")
  ) {
    return null;
  }

  return {
    name: meta.name.trim(),
    description: meta.description.trim(),
    body,
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