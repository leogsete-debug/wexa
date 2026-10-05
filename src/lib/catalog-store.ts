// O site é a vitrine; compra e negociação acontecem no catálogo (topmax-catalogo).
export const CATALOG_STORE_URL =
  process.env.NEXT_PUBLIC_CATALOG_STORE_URL || "https://topmax-catalogo.vercel.app/?lang=pt";

export const catalogStoreLabels = {
  pt: {
    order: "Fazer pedido",
    hero: "Ver catálogo e negociar",
    product: "Negociar no catálogo",
    allProducts: "Ver todos os produtos com estoque",
    allProductsHint: "Estoque atualizado, preço sugerido por peça e proposta online.",
    section: "Abrir catálogo de pedidos",
  },
  zh: {
    order: "在线订购",
    hero: "查看目录并议价",
    product: "在目录中议价",
    allProducts: "查看所有现货产品",
    allProductsHint: "实时库存、每件建议价格并可在线提交报价。",
    section: "打开订购目录",
  },
};
