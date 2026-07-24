import {
  Briefcase,
  BookOpen,
  Users,
  Headphones,
  Calculator,
  Building2,
  FlaskConical,
  Layers,
} from "lucide-react";

const ICON_RULES = [
  { test: /advisory/i, icon: Briefcase },
  { test: /bookkeep/i, icon: BookOpen },
  { test: /payroll/i, icon: Users },
  { test: /support/i, icon: Headphones },
  { test: /tax|accountancy/i, icon: Calculator },
  { test: /construction|c\s?i\s?s/i, icon: Building2 },
  { test: /test/i, icon: FlaskConical },
];

// Category data has no icon field - pick one from the category name,
// falling back to a generic icon for anything unmatched.
export const getCategoryIcon = (categoryName = "") => {
  const rule = ICON_RULES.find(({ test }) => test.test(categoryName));
  return rule ? rule.icon : Layers;
};
