"use client";

import { useSyncExternalStore } from "react";

export type QuoteCartItem = {
  productId: string;
  name: string;
  image: string;
  quantity: number;
};

const storageKey = "topmax_quote_cart";
const changeEvent = "topmax-quote-cart-change";
const emptyCart: QuoteCartItem[] = [];

let cachedRaw: string | null = null;
let cachedItems: QuoteCartItem[] = emptyCart;

function readCart(): QuoteCartItem[] {
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    return cachedItems;
  }

  if (raw === cachedRaw) return cachedItems;

  cachedRaw = raw;

  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedItems = Array.isArray(parsed) ? parsed : emptyCart;
  } catch {
    cachedItems = emptyCart;
  }

  return cachedItems;
}

function writeCart(items: QuoteCartItem[]) {
  cachedItems = items;
  cachedRaw = JSON.stringify(items);

  try {
    window.localStorage.setItem(storageKey, cachedRaw);
  } catch {
    // Sem localStorage (modo privado): o carrinho vive só na memória da página.
  }

  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(callback: () => void) {
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useQuoteCart() {
  return useSyncExternalStore(subscribe, readCart, () => emptyCart);
}

export function addToQuoteCart(item: Omit<QuoteCartItem, "quantity">) {
  const items = readCart();

  if (items.some((current) => current.productId === item.productId)) return;

  writeCart([...items, { ...item, quantity: 1 }]);
  window.dispatchEvent(new Event("topmax-quote-cart-open"));
}

export function setQuoteCartQuantity(productId: string, quantity: number) {
  writeCart(
    readCart().map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item)),
  );
}

export function removeFromQuoteCart(productId: string) {
  writeCart(readCart().filter((item) => item.productId !== productId));
}

export function clearQuoteCart() {
  writeCart([]);
}
