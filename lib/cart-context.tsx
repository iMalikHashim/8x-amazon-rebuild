"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/lib/types";

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  listPrice?: number;
  icon: Product["icon"];
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
            i.productId === action.product.id
              ? { ...i, quantity: i.quantity + action.quantity }
              : i
          ),
        };
      }
      return {
        ...state,
        // adding an item you'd previously saved for later moves it back to the cart
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], saved: [] });
  // Guards the persist effect below: without it, the effect fires once
  // with the reducer's pre-hydration empty state (same commit as the
  // hydration effect, before its dispatch is applied) and overwrites
  // real localStorage data with {items:[],saved:[]} - found by testing
  // the add-to-cart -> navigate -> view-cart flow end to end, where a
  // second product page load silently wiped the first item.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "HYDRATE", state: { items: parsed.items ?? [], saved: parsed.saved ?? [] } });
      }
    } catch {
      // localStorage unavailable - cart just starts empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [state, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = state.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    return {
      items: state.items,
      saved: state.saved,
      count,
      subtotal,
      addItem: (product, quantity = 1) => dispatch({ type: "ADD_ITEM", product, quantity }),
      removeItem: (productId) => dispatch({ type: "REMOVE_ITEM", productId }),
      setQuantity: (productId, quantity) => dispatch({ type: "SET_QUANTITY", productId, quantity }),
      saveForLater: (productId) => dispatch({ type: "SAVE_FOR_LATER", productId }),
      moveToCart: (productId) => dispatch({ type: "MOVE_TO_CART", productId }),
      removeSaved: (productId) => dispatch({ type: "REMOVE_SAVED", productId }),
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
