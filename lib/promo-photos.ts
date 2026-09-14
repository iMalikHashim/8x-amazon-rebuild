import type { ProductIconKey } from "@/lib/types";

/**
 * Real, curl-verified Unsplash photos (same verification standard as
 * data/products.ts) standing in for each icon used in the homepage hero
 * and promo tiles - lets those spots show actual product photography
 * instead of a generic icon-on-tint square, reusing photos already in
 * the catalog rather than sourcing new ones.
 */
export const ICON_PHOTOS: Partial<Record<ProductIconKey, string>> = {
  Gamepad2: "1606813907291-d86efa9b94db", // Sony PlayStation 5
  Joystick: "1604586376807-f73185cf5867", // Xbox Wireless Controller
  Backpack: "1553062407-98eeb64c6a62", // JanSport Big Student Backpack
  Headphones: "1505740420928-5e560c06d30e", // Sony WH-1000XM5
  Pencil: "1513542789411-b6a5d4f31634", // Crayola Colored Pencils
  NotebookPen: "1531346878377-a5be20888e57", // Five Star Spiral Notebook
  CookingPot: "1544233726-9f1d2b27be8b", // Instant Pot Duo
  Coffee: "1495474472287-4d71bcdd2085", // Keurig K-Mini
  Utensils: "1556910103-1c02745aae4d", // OXO Good Grips Mixing Bowls
  GlassWater: "1523362628745-0c100150b504", // Hydro Flask
  Shirt: "1556821840-3a63f95609a7", // Champion Reverse Weave Hoodie
  Laptop: "1588872657578-7efd1f1555ed", // Dell XPS 13
  Speaker: "1543512214-318c7553f230", // Echo Dot (5th Gen)
  Watch: "1557935728-e6d1eaabe558", // Fitbit Charge 6
  Monitor: "1614179924047-e1ab49a0a0cf", // Samsung Odyssey G5
};
