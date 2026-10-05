// Agente de Armazém: estrutura de um packing list extraído e a conferência matemática.
// A IA só lê o documento; quem decide se está certo são estas regras.

export type PackingItem = {
  descricao: string;
  ncm?: string | null;
  qtd_por_volume: number | null;
  volumes: number | null;
  tipo_volume?: string | null;
  qtd_total: number | null;
  unidade?: string | null;
  peso_bruto_kg?: number | null;
  peso_liquido_kg?: number | null;
  volume_m3?: number | null;
  produto_sugerido?: string | null;
};

export type PackingList = {
  invoice: string | null;
  pedido?: string | null;
  sc?: string | null;
  data_documento?: string | null;
  fornecedor?: string | null;
  origem?: string | null;
  destino?: string | null;
  conteiner: string | null;
  data_embarque?: string | null;
  itens: PackingItem[];
  totais_documento: {
    qtd_total?: number | null;
    volumes?: number | null;
    peso_bruto_kg?: number | null;
    peso_liquido_kg?: number | null;
    volume_m3?: number | null;
  } | null;
};

export type PackingCheck = {
  ok: boolean;
  issues: string[];
  lineIssues: Record<number, string>;
  sums: { qtd: number; volumes: number; pesoBruto: number; pesoLiquido: number; volumeM3: number };
};

const num = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

export function normalizePackingList(raw: unknown): PackingList {
  const data = (raw ?? {}) as Record<string, unknown>;
  const items = Array.isArray(data.itens) ? data.itens : [];
  const totals = (data.totais_documento ?? null) as Record<string, unknown> | null;

  return {
    invoice: data.invoice ? String(data.invoice).trim() : null,
    pedido: data.pedido ? String(data.pedido) : null,
    sc: data.sc ? String(data.sc) : null,
    data_documento: data.data_documento ? String(data.data_documento) : null,
    fornecedor: data.fornecedor ? String(data.fornecedor) : null,
    origem: data.origem ? String(data.origem) : null,
    destino: data.destino ? String(data.destino) : null,
    conteiner: data.conteiner ? String(data.conteiner).trim() : null,
    data_embarque: data.data_embarque ? String(data.data_embarque) : null,
    itens: items.map((entry) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      return {
        descricao: String(item.descricao ?? "").trim(),
        ncm: item.ncm ? String(item.ncm) : null,
        qtd_por_volume: num(item.qtd_por_volume),
        volumes: num(item.volumes),
        tipo_volume: item.tipo_volume ? String(item.tipo_volume) : null,
        qtd_total: num(item.qtd_total),
        unidade: item.unidade ? String(item.unidade) : null,
        peso_bruto_kg: num(item.peso_bruto_kg),
        peso_liquido_kg: num(item.peso_liquido_kg),
        volume_m3: num(item.volume_m3),
        produto_sugerido: item.produto_sugerido ? String(item.produto_sugerido) : null,
      };
    }),
    totais_documento: totals
      ? {
          qtd_total: num(totals.qtd_total),
          volumes: num(totals.volumes),
          peso_bruto_kg: num(totals.peso_bruto_kg),
          peso_liquido_kg: num(totals.peso_liquido_kg),
          volume_m3: num(totals.volume_m3),
        }
      : null,
  };
}

// Conferência: cada linha (qtd por volume × volumes = total) e a soma das linhas contra os totais do documento.
export function checkPackingList(list: PackingList): PackingCheck {
  const issues: string[] = [];
  const lineIssues: Record<number, string> = {};
  const sums = { qtd: 0, volumes: 0, pesoBruto: 0, pesoLiquido: 0, volumeM3: 0 };

  if (!list.invoice) issues.push("Número da invoice não encontrado.");
  if (!list.conteiner) issues.push("Número do contêiner não encontrado.");
  if (list.conteiner && !/^[A-Z]{4}\d{7}$/.test(list.conteiner.replace(/\s|-/g, ""))) {
    issues.push(`Contêiner "${list.conteiner}" fora do padrão (4 letras + 7 números). Confira no documento.`);
  }
  if (!list.itens.length) issues.push("Nenhum item encontrado.");

  list.itens.forEach((item, index) => {
    const problems: string[] = [];
    if (!item.qtd_total || !item.volumes) problems.push("faltam quantidade ou volumes");
    if (item.qtd_por_volume && item.volumes && item.qtd_total && Math.abs(item.qtd_por_volume * item.volumes - item.qtd_total) > 0.5) {
      problems.push(`${item.qtd_por_volume} × ${item.volumes} = ${item.qtd_por_volume * item.volumes}, mas o total diz ${item.qtd_total}`);
    }
    if (problems.length) lineIssues[index] = problems.join("; ");
    sums.qtd += item.qtd_total ?? 0;
    sums.volumes += item.volumes ?? 0;
    sums.pesoBruto += item.peso_bruto_kg ?? 0;
    sums.pesoLiquido += item.peso_liquido_kg ?? 0;
    sums.volumeM3 += item.volume_m3 ?? 0;
  });

  Object.entries(lineIssues).forEach(([index, text]) => issues.push(`Linha ${Number(index) + 1}: ${text}.`));

  const totals = list.totais_documento;
  const compare = (label: string, sum: number, total: number | null | undefined, tolerance: number, unit = "") => {
    if (total == null) return;
    if (Math.abs(sum - total) > tolerance) {
      issues.push(`${label}: a soma das linhas dá ${round(sum)}${unit}, mas o total do documento é ${round(total)}${unit}.`);
    }
  };
  if (totals) {
    compare("Quantidade", sums.qtd, totals.qtd_total, 0.5);
    compare("Volumes", sums.volumes, totals.volumes, 0.5);
    compare("Peso bruto", sums.pesoBruto, totals.peso_bruto_kg, 1, " kg");
    compare("Peso líquido", sums.pesoLiquido, totals.peso_liquido_kg, 1, " kg");
    compare("Cubagem", sums.volumeM3, totals.volume_m3, 0.05, " m³");
  } else {
    issues.push("Linha de totais do documento não encontrada: não dá para conferir as somas.");
  }

  return { ok: issues.length === 0, issues, lineIssues, sums };
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}

// Linhas no formato exato da aba CHEGADAS do sistema (INVOICE, CONTAINER, PRODUTO, FARDOS, PCS_FARDO, PREVISAO).
export function toChegadasRows(list: PackingList, names: string[], forecast: string) {
  return list.itens.map((item, index) => [
    (list.invoice ?? "").toUpperCase(),
    list.conteiner ?? "",
    names[index] || item.produto_sugerido || item.descricao,
    String(item.volumes ?? ""),
    String(item.qtd_por_volume ?? ""),
    forecast,
  ]);
}

export const PACKING_LIST_PROMPT = `Você extrai dados de PACKING LISTS de importação (fornecedores chineses para a TOP MAX, Brasil).

Responda SOMENTE com JSON válido, sem texto antes ou depois, neste formato:
{
  "invoice": "número da invoice exatamente como no documento",
  "pedido": "Order No.",
  "sc": "SC No.",
  "data_documento": "AAAA-MM-DD",
  "fornecedor": "nome do emitente",
  "origem": "porto de origem",
  "destino": "porto de destino",
  "conteiner": "número do contêiner exatamente como no documento",
  "data_embarque": "AAAA-MM-DD",
  "itens": [
    {
      "descricao": "descrição do produto + tamanho/modelo da linha",
      "ncm": "NCM se houver",
      "qtd_por_volume": 0,
      "volumes": 0,
      "tipo_volume": "CTNS ou BALES",
      "qtd_total": 0,
      "unidade": "PCS ou SETS",
      "peso_bruto_kg": 0,
      "peso_liquido_kg": 0,
      "volume_m3": 0,
      "produto_sugerido": "NOME EXATO de um produto da lista PRODUTOS_DO_ESTOQUE que corresponde a esta linha, ou null"
    }
  ],
  "totais_documento": {"qtd_total": 0, "volumes": 0, "peso_bruto_kg": 0, "peso_liquido_kg": 0, "volume_m3": 0}
}

Regras (zero erro):
- Copie números e códigos EXATAMENTE como estão. Não corrija, não arredonde, não invente.
- Cada linha de produto com quantidade vira UM item, mesmo que se repita (linhas repetidas são lotes diferentes; nunca junte nem remova).
- Formato típico de linha: "@ 24 / 888SETS  37 CTNS  @24.0 / 888.0  @21.6 / 800.00  @63 X50 X42  4.895" = qtd_por_volume 24, qtd_total 888, volumes 37, peso bruto TOTAL da linha 888.0 (o número depois da barra), peso líquido TOTAL 800.00, volume_m3 4.895. O "#" às vezes aparece no lugar da "/".
- Pesos e volume do item são os TOTAIS da linha (depois da barra), não o valor unitário (depois do @).
- Linhas de descrição (NCM, composição, "PLACE THE COUNTRY...") não são itens; use-as para completar a descrição/NCM do item seguinte.
- produto_sugerido: só preencha se tiver certeza (mesmo tipo de produto, mesma medida e mesmas peças por fardo); senão null.
- totais_documento = a linha de totais do documento. Se algum campo não existir, use null.`;

// ---------- Ligação linha do packing list → produto do estoque (regra fixa, sem "achismo") ----------
export type StockProduct = { name: string; piecesPerBale: number };

const SYNONYMS: Array<[RegExp, string]> = [
  [/\b(twin|solteiro|single)\b/g, " TWIN "],
  [/\b(full|casal|double)\b/g, " FULL "],
  [/\bqueen\b/g, " QUEEN "],
  [/\bking\b/g, " KING "],
  [/\b(blanket|blankets|mantas?|cobertor(es)?)\b/g, " MANTA "],
  [/\b(towel|towels|toalhas?)\b/g, " TOALHA "],
  [/\b(rug|rugs|carpet|tapetes?|mat)\b/g, " TAPETE "],
  [/\b(curtain|cortinas?)\b/g, " CORTINA "],
  [/\b(pillow ?case|pillowcases|fronhas?)\b/g, " FRONHA "],
  [/\b(bed ?spread|bedspreads|quilt|cobre ?leito)\b/g, " COBRELEITO "],
  [/\b(table ?cloth|table ?runner|trilho|mesa)\b/g, " MESA "],
  [/\b(fitted|elastico|elástico)\b/g, " ELASTICO "],
  [/\b(sheet ?set|jogo|4 ?p[cç]s|4pcs)\b/g, " JOGO "],
];

function tokens(text: string) {
  let t = ` ${text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")} `;
  for (const [pattern, replacement] of SYNONYMS) t = t.replace(pattern, replacement);
  const words = new Set(t.toUpperCase().match(/[A-Z]{3,}/g) ?? []);
  const numbers = new Set((t.match(/\d{2,3}/g) ?? []).map((n) => String(Number(n))));
  return { words, numbers };
}

// Retorna o produto só quando há um vencedor claro com as mesmas peças por fardo.
export function matchStockProduct(item: PackingItem, products: StockProduct[]): string | null {
  if (!item.qtd_por_volume) return null;
  const candidates = products.filter((product) => product.piecesPerBale === item.qtd_por_volume);
  if (!candidates.length) return null;

  const source = tokens(item.descricao);
  const scored = candidates
    .map((product) => {
      const target = tokens(product.name);
      let score = 0;
      for (const word of ["TWIN", "FULL", "QUEEN", "KING"]) {
        if (source.words.has(word) && target.words.has(word)) score += 5;
        if (source.words.has(word) !== target.words.has(word) && (source.words.has(word) || target.words.has(word))) score -= 4;
      }
      for (const word of ["MANTA", "TOALHA", "TAPETE", "CORTINA", "FRONHA", "COBRELEITO", "MESA", "ELASTICO"]) {
        if (source.words.has(word) && target.words.has(word)) score += 3;
      }
      for (const number of target.numbers) if (source.numbers.has(number)) score += 2;
      return { product, score };
    })
    .sort((a, b) => b.score - a.score);

  const [best, second] = scored;
  if (!best || best.score < 4) return null;
  if (second && second.score >= best.score - 1) return null; // empate: deixa a escolha com a pessoa
  return best.product.name;
}
