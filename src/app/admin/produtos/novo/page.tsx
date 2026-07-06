import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#161616] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-black/10 pb-8">
          <Link href="/admin/produtos" className="text-sm font-semibold text-[#9b7a3e] transition hover:text-[#111]">
            Voltar para produtos
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111] sm:text-5xl">
            Novo Produto
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
            Preencha os dados comerciais e salve como rascunho, publicado ou oculto.
          </p>
        </header>

        <ProductForm mode="create" />
      </div>
    </main>
  );
}
