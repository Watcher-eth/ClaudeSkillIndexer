import { CATEGORY_TREE } from "./categories";

export function classify(text: string): {
  group: string;
  category: string;
  confidence: number;
} {
  const t = text.toLowerCase();

  let bestMatch: {
    group: string;
    category: string;
    score: number;
  } | null = null;

  for (const [group, subs] of Object.entries(CATEGORY_TREE)) {
    for (const sub of subs) {
      const tokens = sub.toLowerCase().split(/[ &/]/);
      let score = 0;

      for (const token of tokens) {
        if (t.includes(token)) score++;
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { group, category: sub, score };
      }
    }
  }

  if (!bestMatch) {
    return {
      group: "Tools",
      category: "Productivity & Integration",
      confidence: 0.1,
    };
  }

  return {
    group: bestMatch.group,
    category: bestMatch.category,
    confidence: Math.min(1, bestMatch.score / 3),
  };
}