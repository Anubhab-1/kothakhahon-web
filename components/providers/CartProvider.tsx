"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const STORAGE_KEY = "kothakhahon_cart_v1";

export interface CartLineItem {
  bookId: string;
  title: string;
  authorName?: string;
  coverImageUrl?: string;
  price: number;
  quantity: number;
}

interface AddCartInput {
  bookId: string;
  title: string;
  authorName?: string;
  coverImageUrl?: string;
  price?: number;
}

interface CartContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  isDrawerOpen: boolean;
  addItem: (item: AddCartInput, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  setQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const noop = () => {};
const fallbackCartContext: CartContextValue = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  isDrawerOpen: false,
  addItem: noop,
  removeItem: noop,
  setQuantity: noop,
  clearCart: noop,
  openDrawer: noop,
  closeDrawer: noop,
  toggleDrawer: noop,
};

function withTimeout<T, F>(
  promise: PromiseLike<T>,
  timeoutMs = 1800,
  fallback: F,
): Promise<T | F> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<F>((resolve) => {
      setTimeout(() => resolve(fallback), timeoutMs);
    }),
  ]);
}

function sanitizePrice(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }
  return value;
}

function normalizeItem(item: CartLineItem): CartLineItem {
  return {
    bookId: item.bookId,
    title: item.title,
    authorName: item.authorName,
    coverImageUrl: item.coverImageUrl,
    price: sanitizePrice(item.price),
    quantity: Math.max(1, Math.floor(item.quantity || 1)),
  };
}

function mergeItems(a: CartLineItem[], b: CartLineItem[]) {
  const merged = new Map<string, CartLineItem>();

  [...a, ...b].forEach((item) => {
    const normalized = normalizeItem(item);
    const existing = merged.get(normalized.bookId);
    if (existing) {
      merged.set(normalized.bookId, {
        ...existing,
        quantity: existing.quantity + normalized.quantity,
      });
      return;
    }
    merged.set(normalized.bookId, normalized);
  });

  return Array.from(merged.values());
}

function parseStoredItems(value: string | null): CartLineItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CartLineItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.bookId === "string" && typeof item.title === "string")
      .map((item) => normalizeItem(item));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>(() => {
    if (typeof window === "undefined") return [];
    return parseStoredItems(window.localStorage.getItem(STORAGE_KEY));
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const mountedRef = useRef(false);
  const itemsRef = useRef<CartLineItem[]>([]);
  const hasEnvRef = useRef(hasSupabaseEnv());

  const getSupabaseClient = useCallback(() => {
    if (!hasEnvRef.current) return null;
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  }, []);

  const syncCartToSupabase = useCallback(
    async (currentItems: CartLineItem[], currentUser: User | null) => {
      if (!currentUser) return;
      const supabase = getSupabaseClient();
      if (!supabase) return;

      if (currentItems.length === 0) {
        await withTimeout(
          Promise.resolve(supabase.from("cart_items").delete().eq("user_id", currentUser.id)),
          1800,
          { error: null, data: null, count: null, status: 200, statusText: "" },
        );
        return;
      }

      const payload = currentItems.map((item) => ({
        user_id: currentUser.id,
        book_id: item.bookId,
        book_title: item.title,
        book_cover_url: item.coverImageUrl ?? null,
        price: item.price,
        quantity: item.quantity,
      }));

      await withTimeout(
        Promise.resolve(supabase.from("cart_items").upsert(payload, { onConflict: "user_id,book_id" })),
        1800,
        { error: null, data: null, count: null, status: 200, statusText: "" },
      );
    },
    [getSupabaseClient],
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    mountedRef.current = true;

    const stored = parseStoredItems(window.localStorage.getItem(STORAGE_KEY));

    const supabase = getSupabaseClient();
    if (!supabase) {
      return () => {
        mountedRef.current = false;
      };
    }

    let unsubscribed = false;

    const mergeWithRemote = async (authUser: User, baseItems: CartLineItem[]) => {
      interface RemoteCartRow {
        book_id: string;
        book_title: string;
        book_cover_url: string | null;
        price: number | null;
        quantity: number | null;
      }

      const remote = await withTimeout(
        Promise.resolve(
          supabase
            .from("cart_items")
            .select("book_id,book_title,book_cover_url,price,quantity")
            .eq("user_id", authUser.id),
        ),
        1800,
        { data: [] as RemoteCartRow[], error: null as null },
      );

      const remoteRows = Array.isArray(remote.data) ? remote.data : [];
      const remoteItems: CartLineItem[] = remoteRows.map((row) => ({
        bookId: row.book_id,
        title: row.book_title,
        coverImageUrl: row.book_cover_url ?? undefined,
        price: sanitizePrice(row.price ?? undefined),
        quantity: Math.max(1, Number(row.quantity) || 1),
      }));

      const merged = mergeItems(baseItems, remoteItems);
      if (!mountedRef.current || unsubscribed) return;
      setItems(merged);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    };

    const initializeAuth = async () => {
      const authResult = await withTimeout(
        Promise.resolve(
          supabase.auth.getUser().then(({ data, error }) => ({
            data: { user: data.user ?? null },
            error: error ?? null,
          })),
        ),
        1800,
        { data: { user: null as User | null }, error: null as null },
      );
      const authUser = authResult?.data?.user ?? null;
      if (unsubscribed) return;
      setUser(authUser);

      if (!authUser) return;
      await mergeWithRemote(authUser, stored);
    };

    void initializeAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        void mergeWithRemote(nextUser, itemsRef.current);
      }
    });

    return () => {
      unsubscribed = true;
      mountedRef.current = false;
      subscription.subscription.unsubscribe();
    };
  }, [getSupabaseClient]);

  useEffect(() => {
    if (!mountedRef.current) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    void syncCartToSupabase(items, user);
  }, [items, user, syncCartToSupabase]);

  const addItem = useCallback((item: AddCartInput, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.floor(quantity || 1));
    const nextItem: CartLineItem = normalizeItem({
      bookId: item.bookId,
      title: item.title,
      authorName: item.authorName,
      coverImageUrl: item.coverImageUrl,
      price: sanitizePrice(item.price),
      quantity: safeQuantity,
    });

    setItems((current) => {
      const existing = current.find((entry) => entry.bookId === nextItem.bookId);
      if (!existing) {
        return [...current, nextItem];
      }
      return current.map((entry) =>
        entry.bookId === nextItem.bookId
          ? { ...entry, quantity: entry.quantity + nextItem.quantity }
          : entry,
      );
    });
  }, []);

  const removeItem = useCallback((bookId: string) => {
    setItems((current) => current.filter((entry) => entry.bookId !== bookId));
  }, []);

  const setQuantity = useCallback((bookId: string, quantity: number) => {
    const safeQuantity = Math.max(0, Math.floor(quantity));
    setItems((current) => {
      if (safeQuantity === 0) {
        return current.filter((entry) => entry.bookId !== bookId);
      }
      return current.map((entry) =>
        entry.bookId === bookId ? { ...entry, quantity: safeQuantity } : entry,
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((value) => !value), []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0),
    [items],
  );
  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + sanitizePrice(item.price) * Math.max(1, item.quantity), 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      isDrawerOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    }),
    [
      items,
      itemCount,
      subtotal,
      isDrawerOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      openDrawer,
      closeDrawer,
      toggleDrawer,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context) {
    return context;
  }
  return fallbackCartContext;
}
