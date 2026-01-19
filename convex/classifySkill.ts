import { CATEGORY_TREE } from "./categories"

type Group = keyof typeof CATEGORY_TREE;
type Category = (typeof CATEGORY_TREE)[Group][number];

type Rule = {
  group: Group;
  category: Category;
  keywords: string[];
};

export const CLASSIFICATION_RULES: Rule[] = [
  // ---- Development ----
  {
    group: "Development",
    category: "CMS & Platforms",
    keywords: ["cms", "wordpress", "shopify", "strapi", "drupal"],
  },
  {
    group: "Development",
    category: "Frontend",
    keywords: ["react", "vue", "svelte", "frontend", "ui", "tailwind"],
  },
  {
    group: "Development",
    category: "Backend",
    keywords: ["backend", "api", "server", "node", "django", "rails"],
  },

  // ---- Data & AI ----
  {
    group: "Data & AI",
    category: "LLM & AI",
    keywords: ["llm", "gpt", "openai", "anthropic", "claude", "ai"],
  },
  {
    group: "Data & AI",
    category: "Machine Learning",
    keywords: ["ml", "training", "model", "classifier"],
  },

  // ---- DevOps ----
  {
    group: "DevOps",
    category: "CI/CD",
    keywords: ["ci", "cd", "github actions", "pipeline"],
  },
  {
    group: "DevOps",
    category: "Containers",
    keywords: ["docker", "kubernetes", "k8s"],
  },

  // ---- Testing & Security ----
  {
    group: "Testing & Security",
    category: "Testing",
    keywords: ["test", "testing", "pytest", "jest", "playwright"],
  },
  {
    group: "Testing & Security",
    category: "Security",
    keywords: ["security", "auth", "encryption", "vulnerability"],
  },

  // ---- Tools ----
  {
    group: "Tools",
    category: "CLI Tools",
    keywords: ["cli", "command line"],
  },
];

export function classifySkill(input: {
    name: string;
    description: string;
    body: string;
    tags: string[];
  }): { group: Group; category: Category; confidence: number } {
    const text = (
      input.name +
      " " +
      input.description +
      " " +
      input.body +
      " " +
      input.tags.join(" ")
    ).toLowerCase();
  
    for (const rule of CLASSIFICATION_RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          return {
            group: rule.group,
            category: rule.category,
            confidence: 0.75,
          };
        }
      }
    }
  
    // fallback (rare, explicit)
    return {
      group: "Tools",
      category: "Productivity & Integration",
      confidence: 0.25,
    };
  }