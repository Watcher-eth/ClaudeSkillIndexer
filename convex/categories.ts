
// src/components/tree/categories.ts
export type SkillCategoryGroup =
  | "Tools"
  | "Development"
  | "Data & AI"
  | "Business"
  | "DevOps"
  | "Testing & Security"
  | "Documentation"
  | "Content & Media"
  | "Research"
  | "Databases"
  | "Lifestyle"
  | "Blockchain";

export type SkillSubcategory =
  // Tools
  | "Productivity & Integration"
  | "Automation Tools"
  | "Debugging"
  | "System Administration"
  | "IDE Plugins"
  | "CLI Tools"
  | "Domain & DNS Tools"
  // Development
  | "CMS & Platforms"
  | "Architecture Patterns"
  | "Full Stack"
  | "Frontend"
  | "Scripting"
  | "Game Development"
  | "Mobile"
  | "Backend"
  | "Package & Distribution"
  | "E-commerce Development"
  | "Framework Internals"
  // Data & AI
  | "LLM & AI"
  | "Data Analysis"
  | "Data Engineering"
  | "Machine Learning"
  // Business
  | "Project Management"
  | "Sales & Marketing"
  | "Finance & Investment"
  | "Health & Fitness"
  | "Business Apps"
  | "Real Estate & Legal"
  | "Payment"
  | "E-commerce"
  // DevOps
  | "CI/CD"
  | "Git Workflows"
  | "Cloud"
  | "Containers"
  | "Monitoring"
  // Testing & Security
  | "Testing"
  | "Code Quality"
  | "Security"
  // Documentation
  | "Knowledge Base"
  | "Technical Docs"
  | "Education"
  // Content & Media
  | "Content Creation"
  | "Documents"
  | "Design"
  | "Media"
  // Research
  | "Academic"
  | "Scientific Computing"
  | "Computational Chemistry"
  | "Bioinformatics"
  | "Lab Tools"
  | "Astronomy & Physics"
  // Databases
  | "SQL Databases"
  | "Database Tools"
  | "NoSQL Databases"
  // Lifestyle
  | "Divination & Mysticism"
  | "Literature & Writing"
  | "Philosophy & Ethics"
  | "Wellness & Health"
  | "Arts & Crafts"
  | "Culinary Arts"
  // Blockchain
  | "Web3 Tools"
  | "Smart Contracts"
  | "DeFi";

export type CategoryTree = Record<SkillCategoryGroup, SkillSubcategory[]>;

export const CATEGORY_TREE: CategoryTree = {
  Tools: [
    "Productivity & Integration",
    "Automation Tools",
    "Debugging",
    "System Administration",
    "IDE Plugins",
    "CLI Tools",
    "Domain & DNS Tools",
  ],
  Development: [
    "CMS & Platforms",
    "Architecture Patterns",
    "Full Stack",
    "Frontend",
    "Scripting",
    "Game Development",
    "Mobile",
    "Backend",
    "Package & Distribution",
    "E-commerce Development",
    "Framework Internals",
  ],
  "Data & AI": ["LLM & AI", "Data Analysis", "Data Engineering", "Machine Learning"],
  Business: [
    "Project Management",
    "Sales & Marketing",
    "Finance & Investment",
    "Health & Fitness",
    "Business Apps",
    "Real Estate & Legal",
    "Payment",
    "E-commerce",
  ],
  DevOps: ["CI/CD", "Git Workflows", "Cloud", "Containers", "Monitoring"],
  "Testing & Security": ["Testing", "Code Quality", "Security"],
  Documentation: ["Knowledge Base", "Technical Docs", "Education"],
  "Content & Media": ["Content Creation", "Documents", "Design", "Media"],
  Research: [
    "Academic",
    "Scientific Computing",
    "Computational Chemistry",
    "Bioinformatics",
    "Lab Tools",
    "Astronomy & Physics",
  ],
  Databases: ["SQL Databases", "Database Tools", "NoSQL Databases"],
  Lifestyle: [
    "Divination & Mysticism",
    "Literature & Writing",
    "Philosophy & Ethics",
    "Wellness & Health",
    "Arts & Crafts",
    "Culinary Arts",
  ],
  Blockchain: ["Web3 Tools", "Smart Contracts", "DeFi"],
} as const;

export type SkillGroup = keyof typeof CATEGORY_TREE;
export type SkillCategory = (typeof CATEGORY_TREE)[SkillGroup][number];

export const CATEGORY_GROUPS = Object.keys(CATEGORY_TREE) as SkillCategoryGroup[];

export function allSubcategories(): SkillSubcategory[] {
  return CATEGORY_GROUPS.flatMap((g) => CATEGORY_TREE[g]);
}

export const GROUP_COLORS: Record<
  SkillGroup,
  { bg: string; text: string }
> = {
  Tools: { bg: "bg-slate-100", text: "text-slate-700" },
  Development: { bg: "bg-indigo-100", text: "text-indigo-700" },
  "Data & AI": { bg: "bg-cyan-100", text: "text-cyan-700" },
  Business: { bg: "bg-amber-100", text: "text-amber-700" },
  DevOps: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Testing & Security": { bg: "bg-rose-100", text: "text-rose-700" },
  Documentation: { bg: "bg-neutral-100", text: "text-neutral-700" },
  "Content & Media": { bg: "bg-pink-100", text: "text-pink-700" },
  Research: { bg: "bg-violet-100", text: "text-violet-700" },
  Databases: { bg: "bg-teal-100", text: "text-teal-700" },
  Lifestyle: { bg: "bg-orange-100", text: "text-orange-700" },
  Blockchain: { bg: "bg-purple-100", text: "text-purple-700" },
};