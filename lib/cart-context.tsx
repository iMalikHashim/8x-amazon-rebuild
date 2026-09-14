"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth-context";
import type { Category, Product, ProductIconKey } from "@/lib/types";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  listPrice?: number;
  icon: ProductIconKey;
  category: Category;
  photos?: string[];
  quantity: number;
}

interface CartState {
  items: CartItem[];
  saved: CartItem[];
}

type CartAction =
  | { type: "ADD_ITEM"; product: Product; quantity: number }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "SET_QUANTITY"; productId: string; quantity: number }
  | { type: "SAVE_FOR_LATER"; productId: string }
  | { type: "MOVE_TO_CART"; productId: string }
  | { type: "REMOVE_SAVED"; productId: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; state: CartState };

const STORAGE_KEY = "8x-amazon-rebuild:cart";

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price,
    listPrice: product.listPrice,
    icon: product.icon,
    category: product.category,
    photos: product.photos,
    quantity,
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.productId === action.product.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === action.product.id ? { ...i, quantity: i.quantity + action.quantity } : i
          ),
        };
      }
      return {
        ...state,
        saved: state.saved.filter((i) => i.productId !== action.product.id),
        items: [...state.items, toCartItem(action.product, action.quantity)],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.productId !== action.productId) };
    case "SET_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId ? { ...i, quantity: Math.max(1, action.quantity) } : i
        ),
      };
    case "SAVE_FOR_LATER": {
      const item = state.items.find((i) => i.productId === action.productId);
      if (!item) return state;
      return {
        items: state.items.filter((i) => i.productId !== action.productId),
        saved: [...state.saved, item],
      };
    }
    case "MOVE_TO_CART": {
      const item = state.saved.find((i) => i.productId === action.productId);
      if (!item) return state;
      return {
        saved: state.saved.filter((i) => i.productId !== action.productId),
        items: [...state.items, item],
      };
    }
    case "REMOVE_SAVED":
      return { ...state, saved: state.saved.filter((i) => i.productId !== action.productId) };
    case "CLEAR":
      return { ...state, items: [] };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  saved: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  saveForLater: (productId: string) => void;
  moveToCart: (productId: string) => void;
  removeSaved: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

async function fetchDbCart(): Promise<CartState> {
  const res = await fetch("/api/cart");
  const data = await res.json().catch(() => ({ items: [], saved: [] }));
  return { items: data.items ?? [], saved: data.saved ?? [] };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], saved: [] });
  const [hydrated, setHydrated] = useState(false);
  // "guest" persists to localStorage; "db" fires API calls on every mutation.
  // A ref (not state) because mutation handlers below read it synchronously
  // and shouldn't re-render just because the mode flipped.
  const mode = useRef<"guest" | "db">("guest");
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (user) {
      const wasGuest = previousUserId.current === null;
      mode.current = "db";
      (async () => {
        if (wasGuest) {
          try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            const guest: CartState = raw ? JSON.parse(raw) : { items: [], saved: [] };
            const toMerge = [...guest.items, ...guest.saved].map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            }));
            if (toMerge.length > 0) {
              await fetch("/api/cart/merge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: toMerge }),
              });
            }
          } catch (err) {
            console.error("Cart merge failed:", err);
          }
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore
          }
        }
        try {
          dispatch({ type: "HYDRATE", state: await fetchDbCart() });
        } catch (err) {
          console.error("Failed to load cart:", err);
        }
        setHydrated(true);
      })();
    } else {
      mode.current = "guest";
      queueMicrotask(() => {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) dispatch({ type: "HYDRATE", state: JSON.parse(raw) });
        } catch {
          // localStorage unavailable - cart just starts empty
        }
        setHydrated(true);
      });
    }
    previousUserId.current = user?.id ?? null;
  }, [user, authReady]);

  useEffect(() => {
    if (!hydrated || mode.current !== "guest") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [state, hydrated]);

  const syncItem = (productId: string, body: Record<string, unknown>) => {
    if (mode.current !== "db") return;
    fetch(`/api/cart/items/${encodeURIComponent(productId)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch((err) => console.error("Cart sync failed:", err));
  };

  const deleteItem = (productId: string) => {
    if (mode.current !== "db") return;
    fetch(`/api/cart/items/${encodeURIComponent(productId)}`, { method: "DELETE" }).catch((err) =>
      console.error("Cart sync failed:", err)
    );
  };

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    return {
      items: state.items,
      saved: state.saved,
      count,
      subtotal,
      addItem: (product, quantity = 1) => {
        dispatch({ type: "ADD_ITEM", product, quantity });
        if (mode.current === "db") {
          fetch("/api/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity }),
          }).catch((err) => console.error("Cart sync failed:", err));
        }
      },
      removeItem: (productId) => {
        dispatch({ type: "REMOVE_ITEM", productId });
        deleteItem(productId);
      },
      setQuantity: (productId, quantity) => {
        dispatch({ type: "SET_QUANTITY", productId, quantity });
        syncItem(productId, { quantity });
      },
      saveForLater: (productId) => {
        dispatch({ type: "SAVE_FOR_LATER", productId });
        syncItem(productId, { savedForLater: true });
      },
      moveToCart: (productId) => {
        dispatch({ type: "MOVE_TO_CART", productId });
        syncItem(productId, { savedForLater: false });
      },
      removeSaved: (productId) => {
        dispatch({ type: "REMOVE_SAVED", productId });
        deleteItem(productId);
      },
      clear: () => dispatch({ type: "CLEAR" }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
