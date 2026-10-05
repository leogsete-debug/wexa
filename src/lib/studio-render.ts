// Motor de desenho do Estúdio de Conteúdo: artes (PNG) e vídeos (Reels/Stories)
// montados no navegador com <canvas>. Sem servidor e sem custo.

export type StudioFormat = "post" | "story" | "square";
export type ArtMode = "real" | "cenario" | "ia";

export const formatSizes: Record<StudioFormat, [number, number]> = {
  post: [1080, 1350],
  story: [1080, 1920],
  square: [1080, 1080],
};

export type ArtSlide = {
  mode: ArtMode;
  photos: HTMLImageElement[]; // fotos reais do produto (1 = destaque, várias = coleção)
  aiImage?: HTMLImageElement | null;
  name: string;
  stockLine?: string | null;
  priceLine?: string | null;
  badge?: string | null;
  cta: string;
  ctaHint: string;
};

const GOLD = "#d6b46a";
const GOLD_LIGHT = "#f0d89a";
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src.slice(0, 80)}`));
    image.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// Desenha a imagem cobrindo a área (como object-fit: cover), com zoom opcional (efeito Ken Burns).
function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, w: number, h: number, zoom = 1) {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight) * zoom;
  const dw = image.naturalWidth * scale;
  const dh = image.naturalHeight * scale;
  ctx.save();
  roundRect(ctx, x, y, w, h, 0);
  ctx.clip();
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, opts: { fill: string; color: string; size: number; border?: string; alignRight?: boolean }) {
  ctx.font = `800 ${opts.size}px ${FONT}`;
  ctx.letterSpacing = `${Math.round(opts.size * 0.12)}px`;
  const padX = opts.size * 0.9;
  const height = opts.size * 2.1;
  const width = ctx.measureText(text).width + padX * 2;
  const left = opts.alignRight ? x - width : x;

  roundRect(ctx, left, y, width, height, height / 2);
  ctx.fillStyle = opts.fill;
  ctx.fill();
  if (opts.border) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = opts.border;
    ctx.stroke();
  }
  ctx.fillStyle = opts.color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, left + padX, y + height / 2 + 1);
  ctx.letterSpacing = "0px";
  return { width, height };
}

// t: progresso da animação (0 → 1) usado no vídeo para o zoom suave.
export function drawArt(ctx: CanvasRenderingContext2D, slide: ArtSlide, t = 0) {
  const { width: W, height: H } = ctx.canvas;
  const zoom = 1 + 0.07 * t;
  const isStory = H / W > 1.6;

  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0, 0, W, H);

  // Fundo
  if (slide.mode === "real" && slide.photos.length > 1) {
    // Coleção: grade com até 4 fotos reais
    const photos = slide.photos.slice(0, 4);
    const gap = 14;
    const areaH = H * (isStory ? 0.6 : 0.62);
    const cols = photos.length === 1 ? 1 : 2;
    const rows = Math.ceil(photos.length / cols);
    const cellW = (W - gap * (cols + 1)) / cols;
    const cellH = (areaH - gap * (rows + 1)) / rows;
    photos.forEach((photo, index) => {
      const cx = gap + (index % cols) * (cellW + gap);
      const cy = gap + Math.floor(index / cols) * (cellH + gap) + (isStory ? H * 0.06 : 0);
      ctx.save();
      roundRect(ctx, cx, cy, cellW, cellH, 28);
      ctx.clip();
      drawCover(ctx, photo, cx, cy, cellW, cellH, zoom);
      ctx.restore();
    });
  } else if (slide.mode === "real" && slide.photos[0]) {
    drawCover(ctx, slide.photos[0], 0, 0, W, H, zoom);
  } else if (slide.aiImage) {
    drawCover(ctx, slide.aiImage, 0, 0, W, H, zoom);
  }

  // Cenário IA + foto real: o produto verdadeiro em destaque sobre o ambiente criado pela IA.
  if (slide.mode === "cenario" && slide.photos[0]) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, 0, W, H);
    const frameW = W * 0.74;
    const frameH = Math.min(H * (isStory ? 0.44 : 0.5), frameW * 1.05);
    const fx = (W - frameW) / 2;
    const fy = H * (isStory ? 0.15 : 0.11);
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 24;
    roundRect(ctx, fx - 14, fy - 14, frameW + 28, frameH + 28, 44);
    ctx.fillStyle = "#fbfaf7";
    ctx.fill();
    ctx.restore();
    ctx.save();
    roundRect(ctx, fx, fy, frameW, frameH, 32);
    ctx.clip();
    drawCover(ctx, slide.photos[0], fx, fy, frameW, frameH, 1 + 0.04 * t);
    ctx.restore();
  }

  // Degradê para leitura do texto
  const gradient = ctx.createLinearGradient(0, H * 0.4, 0, H);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.45, "rgba(0,0,0,0.62)");
  gradient.addColorStop(1, "rgba(0,0,0,0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, H * 0.4, W, H * 0.6);

  // Marca e selo
  const margin = 56;
  const topY = isStory ? 120 : margin;
  pill(ctx, "TOP MAX", margin, topY, { fill: "rgba(0,0,0,0.55)", color: GOLD, size: 30, border: "rgba(214,180,106,0.7)" });
  if (slide.badge) {
    pill(ctx, slide.badge.toUpperCase(), W - margin, topY, { fill: GOLD, color: "#111", size: 28, alignRight: true });
  }

  // Textos do rodapé (de baixo para cima)
  const bottomSafe = isStory ? 260 : 72;
  let y = H - bottomSafe;

  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "1px";
  const hintWidth = ctx.measureText(slide.ctaHint).width;
  ctx.letterSpacing = "0px";

  const ctaSize = 30;
  ctx.font = `800 ${ctaSize}px ${FONT}`;
  ctx.letterSpacing = "3px";
  const ctaWidth = ctx.measureText(slide.cta.toUpperCase()).width + ctaSize * 1.8;
  ctx.letterSpacing = "0px";
  const ctaHeight = ctaSize * 2.2;
  y -= ctaHeight;
  pill(ctx, slide.cta.toUpperCase(), margin, y, { fill: GOLD, color: "#111", size: ctaSize });
  if (margin + ctaWidth + 24 + hintWidth < W - margin) {
    ctx.font = `500 26px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.textBaseline = "middle";
    ctx.fillText(slide.ctaHint, margin + ctaWidth + 24, y + ctaHeight / 2);
  }
  y -= 34;

  ctx.textBaseline = "alphabetic";
  if (slide.priceLine) {
    ctx.font = `700 42px ${FONT}`;
    ctx.fillStyle = GOLD_LIGHT;
    ctx.fillText(slide.priceLine, margin, y);
    y -= 58;
  }
  if (slide.stockLine) {
    ctx.font = `500 34px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(slide.stockLine, margin, y);
    y -= 62;
  }

  ctx.font = `800 70px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.letterSpacing = "-1px";
  const lines = wrapText(ctx, slide.name, W - margin * 2, 3);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    ctx.fillText(lines[index], margin, y);
    y -= 80;
  }
  ctx.letterSpacing = "0px";
}

function drawBrandCard(ctx: CanvasRenderingContext2D, title: string, subtitle: string, footer: string, t: number) {
  const { width: W, height: H } = ctx.canvas;
  ctx.fillStyle = "#07100d";
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.3, H * 0.3, W * (0.9 + 0.1 * t));
  glow.addColorStop(0, "rgba(214,180,106,0.35)");
  glow.addColorStop(1, "rgba(214,180,106,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const alpha = Math.min(1, t * 3);
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 120px ${FONT}`;
  ctx.letterSpacing = "6px";
  ctx.fillStyle = GOLD;
  ctx.fillText("TOP MAX", W / 2, H * 0.4);
  ctx.letterSpacing = "0px";

  ctx.font = `800 64px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  const lines = wrapText(ctx, title, W - 160, 3);
  lines.forEach((line, index) => ctx.fillText(line, W / 2, H * 0.52 + index * 76));

  ctx.font = `500 36px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(subtitle, W / 2, H * 0.52 + lines.length * 76 + 40);

  ctx.font = `700 32px ${FONT}`;
  ctx.fillStyle = GOLD_LIGHT;
  ctx.fillText(footer, W / 2, H * 0.86);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}

export type VideoPlan = {
  slides: ArtSlide[];
  secondsPerSlide: number;
  intro: { title: string; subtitle: string };
  outro: { title: string; subtitle: string };
  footer: string;
};

function pickVideoMime() {
  const candidates = ["video/mp4;codecs=avc1.42E01E", "video/mp4", "video/webm;codecs=vp9", "video/webm"];
  return candidates.find((type) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) ?? "video/webm";
}

// Grava o vídeo em tempo real a partir do canvas (a aba precisa ficar visível durante a gravação).
export async function renderVideo(canvas: HTMLCanvasElement, plan: VideoPlan, onProgress: (value: number) => void) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");

  const introSeconds = 1.8;
  const outroSeconds = 2.4;
  const fade = 0.35;
  const total = introSeconds + plan.slides.length * plan.secondsPerSlide + outroSeconds;
  const mimeType = pickVideoMime();
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  const drawAt = (time: number) => {
    if (time < introSeconds) {
      drawBrandCard(ctx, plan.intro.title, plan.intro.subtitle, plan.footer, time / introSeconds);
      return;
    }
    const afterIntro = time - introSeconds;
    const index = Math.floor(afterIntro / plan.secondsPerSlide);
    if (index < plan.slides.length) {
      const local = (afterIntro % plan.secondsPerSlide) / plan.secondsPerSlide;
      drawArt(ctx, plan.slides[index], local);
      const localSeconds = afterIntro % plan.secondsPerSlide;
      if (localSeconds < fade) {
        ctx.fillStyle = `rgba(0,0,0,${1 - localSeconds / fade})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }
    const outroTime = afterIntro - plan.slides.length * plan.secondsPerSlide;
    drawBrandCard(ctx, plan.outro.title, plan.outro.subtitle, plan.footer, Math.min(1, outroTime / outroSeconds));
  };

  drawAt(0);
  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
  });
  recorder.start(250);

  await new Promise<void>((resolve) => {
    const startedAt = performance.now();
    const tick = () => {
      const time = (performance.now() - startedAt) / 1000;
      if (time >= total) {
        drawAt(total - 0.001);
        resolve();
        return;
      }
      drawAt(time);
      onProgress(time / total);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  recorder.stop();
  stream.getTracks().forEach((track) => track.stop());
  onProgress(1);
  const blob = await done;
  return { blob, extension: mimeType.startsWith("video/mp4") ? "mp4" : "webm" };
}
