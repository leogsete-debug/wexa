"use client";

import { Check, Plus } from "lucide-react";
import type { SiteLocale } from "@/components/HomePage";
import { addToQuoteCart, useQuoteCart } from "@/lib/quote-cart";

type AddToQuoteButtonProps = {
  productId: string;
  name: string;
  image: string;
  locale?: SiteLocale;
};

const text = {
  pt: { add: "Adicionar à cotação", added: "Na cotação" },
  zh: { add: "加入询价单", added: "已加入询价单" },
};

export default function AddToQuoteButton({ productId, name, image, locale = "pt" }: AddToQuoteButtonProps) {
  const items = useQuoteCart();
  const isAdded = items.some((item) => item.productId === productId);
  const labels = text[locale];

  return (
    <button
      type="button"
      onClick={() => addToQuoteCart({ productId, name, image })}
      disabled={isAdded}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#111] px-5 py-3.5 text-center text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#d6b46a] hover:text-[#111] hover:shadow-[0_18px_45px_rgba(214,180,106,0.28)] disabled:translate-y-0 disabled:bg-[#d6b46a] disabled:text-[#111] sm:w-auto sm:px-6 sm:text-[0.72rem] sm:tracking-[0.18em]"
    >
      {isAdded ? <Check size={15} /> : <Plus size={15} />}
      {isAdded ? labels.added : labels.add}
    </button>
  );
}
