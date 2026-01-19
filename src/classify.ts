import { CATEGORY_TREE } from "./categories";

export function classify(text: string): { group: string; category: string } {
  const t = text.toLowerCase();

  for (const [group, subs] of Object.entries(CATEGORY_TREE)) {
    for (const sub of subs) {
      const needle = sub.toLowerCase().split(/[ &/]/)[0];
      if (t.includes(needle)) {
        return { group, category: sub };
      }
    }
  }

  // Fallback
  return { group: "Tools", category: "Productivity & Integration" };
}