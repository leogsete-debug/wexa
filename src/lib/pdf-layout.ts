import { getDocumentProxy } from "unpdf";

type TextItem = { str: string; transform: number[]; width: number };

// Extrai o texto do PDF mantendo a posição das colunas (como "pdftotext -layout"),
// para a IA não misturar quantidade, peso e volume de colunas diferentes.
export async function extractPdfLayout(data: Uint8Array, maxPages = 6) {
  const pdf = await getDocumentProxy(data);
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, maxPages); pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = (content.items as TextItem[]).filter((item) => item.str && item.str.trim());
    if (!items.length) continue;

    // Agrupa por linha (mesmo y, com tolerância) e ordena da esquerda para a direita
    const rows: Array<{ y: number; items: TextItem[] }> = [];
    for (const item of items) {
      const y = item.transform[5];
      const row = rows.find((candidate) => Math.abs(candidate.y - y) < 3);
      if (row) row.items.push(item);
      else rows.push({ y, items: [item] });
    }
    rows.sort((a, b) => b.y - a.y);

    const charWidth = 4.2; // ~pontos por caractere para posicionar as colunas
    const lines = rows.map((row) => {
      row.items.sort((a, b) => a.transform[4] - b.transform[4]);
      let line = "";
      for (const item of row.items) {
        const column = Math.max(0, Math.round(item.transform[4] / charWidth));
        if (line.length < column) line += " ".repeat(column - line.length);
        else if (line.length && !line.endsWith(" ")) line += " ";
        line += item.str;
      }
      return line.replace(/\s+$/, "");
    });

    pages.push(lines.join("\n"));
  }

  return { text: pages.join("\n\n----- página -----\n\n"), pages: pdf.numPages };
}
