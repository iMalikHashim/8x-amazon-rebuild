import type { Category } from "@/lib/types";

interface CategoryArt {
  accent: string; // icon + blob color
  tint: string; // soft background blob tone
}

export const categoryArt: Record<Category, CategoryArt> = {
  Electronics: { accent: "#3B4B66", tint: "#CFE0F2" },
  Computers: { accent: "#46516B", tint: "#D6DAF0" },
  "Home & Kitchen": { accent: "#A85C2A", tint: "#F4DCC2" },
  "Back to School": { accent: "#6B3FA0", tint: "#E4D3F5" },
  Gaming: { accent: "#1B6E7A", tint: "#C9EBEE" },
  Fashion: { accent: "#8C4A5D", tint: "#F0D6DC" },
  "Toys & Games": { accent: "#C4452E", tint: "#F8D9CE" },
  "Sports & Outdoors": { accent: "#2F6B4F", tint: "#CDE9DA" },
};
