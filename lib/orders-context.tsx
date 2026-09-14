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
import type { Order } from "@/lib/types";

interface OrdersState {
  orders: Order[];
}

type OrdersAction = { type: "ADD_ORDER"; order: Order } | { type: "HYDRATE"; state: OrdersState };

const STORAGE_KEY = "8x-amazon-rebuild:orders";

function ordersReducer(state: OrdersState, action: OrdersAction): OrdersState {
  switch (action.type) {
    case "ADD_ORDER":
      // newest first, matching how order history is displayed
      return { orders: [action.order, ...state.orders] };
    case "HYDRATE":
      return action.state;
    default:
      return state;
  }
}

interface OrdersContextValue {
  orders: Order[];
  placeOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ordersReducer, { orders: [] });
  // Same hydrated-guard pattern as CartProvider - see the note there for
  // why the persist effect must not fire before hydration completes.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        dispatch({ type: "HYDRATE", state: { orders: parsed.orders ?? [] } });
      }
    } catch {
      // localStorage unavailable - order history just starts empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore write failures
    }
  }, [state, hydrated]);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders: state.orders,
      placeOrder: (order) => dispatch({ type: "ADD_ORDER", order }),
      getOrder: (id) => state.orders.find((o) => o.id === id),
    }),
    [state]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error("useOrders must be used within an OrdersProvider");
  return ctx;
}
