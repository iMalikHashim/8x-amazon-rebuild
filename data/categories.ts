import type { Category } from "@/lib/types";

/** The 8 real shoppable departments, backed by the fixture catalog. */
export const categories: Category[] = [
  "Electronics",
  "Computers",
  "Home & Kitchen",
  "Back to School",
  "Gaming",
  "Fashion",
  "Toys & Games",
  "Sports & Outdoors",
];

export interface MenuItem {
  label: string;
  href?: string;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

/** Structure of the "All" department mega-menu, matching screenshots/amazon-screenshot-2.png. */
export const departmentMenuGroups: MenuGroup[] = [
  {
    title: "Digital Content & Devices",
    items: [
      { label: "Prime Video", href: "/out-of-scope?feature=Prime+Video" },
      { label: "Amazon Music", href: "/out-of-scope?feature=Amazon+Music" },
      { label: "Kindle E-readers & Books", href: "/out-of-scope?feature=Kindle" },
      { label: "Amazon Appstore", href: "/out-of-scope?feature=Amazon+Appstore" },
    ],
  },
  {
    title: "Shop by Department",
    items: categories.map((c) => ({
      label: c,
      href: `/search?category=${encodeURIComponent(c)}`,
    })),
  },
  {
    title: "Programs & Features",
    items: [
      { label: "Gift Cards", href: "/gift-cards" },
      { label: "Amazon Live", href: "/out-of-scope?feature=Amazon+Live" },
      { label: "International Shopping", href: "/out-of-scope?feature=International+Shopping" },
      { label: "Amazon Second Chance", href: "/out-of-scope?feature=Amazon+Second+Chance" },
    ],
  },
  {
    title: "Help & Settings",
    items: [
      { label: "Your Account", href: "/account" },
      { label: "Customer Service", href: "/help" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];
