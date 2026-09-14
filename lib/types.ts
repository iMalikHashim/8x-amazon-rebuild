export type Category =
  | "Electronics"
  | "Computers"
  | "Home & Kitchen"
  | "Back to School"
  | "Gaming"
  | "Fashion"
  | "Toys & Games"
  | "Sports & Outdoors";

/** Keys into the lucide-react icon set used by ProductArt. */
export type ProductIconKey =
  | "Headphones"
  | "Speaker"
  | "Mouse"
  | "Keyboard"
  | "Laptop"
  | "Monitor"
  | "Smartphone"
  | "Tablet"
  | "Watch"
  | "Camera"
  | "Gamepad2"
  | "Joystick"
  | "Backpack"
  | "BookOpen"
  | "Pencil"
  | "PenTool"
  | "Calculator"
  | "Notebook"
  | "NotebookPen"
  | "Shirt"
  | "Footprints"
  | "Glasses"
  | "Dumbbell"
  | "Tent"
  | "Bike"
  | "ToyBrick"
  | "Dices"
  | "Coffee"
  | "CookingPot"
  | "Utensils"
  | "Blocks"
  | "Cpu"
  | "HardDrive"
  | "Battery"
  | "BatteryCharging"
  | "Router"
  | "GlassWater";

export interface Address {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  icon: ProductIconKey;
  quantity: number;
}

export interface Order {
  id: string;
  userEmail: string;
  placedAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Address;
  cardLast4: string;
  estimatedDelivery: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: Category;
  price: number;
  listPrice?: number;
  rating: number;
  reviewCount: number;
  prime: boolean;
  bullets: string[];
  description: string;
  icon: ProductIconKey;
  /**
   * Unsplash photo IDs (the segment after "photo-" in images.unsplash.com
   * URLs) - every one of these has been curl-verified to return a real
   * image before being added here. See docs/architecture.md and the
   * Step 1 commit for how these were sourced and checked. Omitted
   * entirely for a product means no verified match was found - it keeps
   * the generated ProductArt SVG instead.
   */
  photos?: string[];
}
