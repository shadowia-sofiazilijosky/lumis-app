import { getStroke } from "perfect-freehand";
import type { BrushDef } from "./brushes";

function outlineToPath2D(points: number[][]): Path2D {
  const path = new Path2D();
  if (!points.length) return path;
  path.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  path.closePath();
  return path;
}

/** Deterministic pseudo-random generator seeded from the stroke's own point
 * data, so a committed stroke's grain/spray texture looks identical every
 * time it's redrawn (zoom change, page revisit) instead of re-rolling new
 * random noise on each render. */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashPoints(points: [number, number][]): number {
  let hash = 0;
  for (const [x, y] of points) {
    hash = (hash * 31 + Math.round(x * 7)) | 0;
    hash = (hash * 31 + Math.round(y * 7)) | 0;
  }
  return Math.abs(hash) || 1;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

/** Renders one stroke (pixel-space points) onto the page canvas, using a
 * rendering technique specific to the brush -- not just a recolored line.
 * Each committed stroke replays through here on every redraw (zoom change,
 * new stroke added), which is also how the eraser works: it's a real
 * destination-out punch, order-dependent like a real raster eraser. */
export function renderStroke(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  brush: BrushDef,
  color: string,
  size: number,
): void {
  if (points.length < 2) return;
  const random = seededRandom(hashPoints(points));

  ctx.save();

  if (brush.key === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    const outline = getStroke(points, { size, thinning: 0, smoothing: 0.5, streamline: 0.5 });
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill(outlineToPath2D(outline));
    ctx.restore();
    return;
  }

  ctx.globalCompositeOperation = brush.key === "marker" ? "multiply" : "source-over";

  if (brush.render === "solid") {
    const outline = getStroke(points, { size, ...brush.strokeOptions });
    ctx.fillStyle = color;
    ctx.fill(outlineToPath2D(outline));
  } else if (brush.render === "soft" && brush.key === "airbrush") {
    // True spray: many tiny low-opacity dots scattered around each sampled
    // point, so density naturally builds up wherever the pointer lingers --
    // this is what actually reads as "aire"/spray, not a blur filter.
    const [r, g, b] = hexToRgb(color);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    for (const [x, y] of points) {
      for (let i = 0; i < 10; i++) {
        const angle = random() * Math.PI * 2;
        const radius = random() * size;
        const dx = x + Math.cos(angle) * radius;
        const dy = y + Math.sin(angle) * radius;
        ctx.globalAlpha = 0.04 + random() * 0.07;
        ctx.beginPath();
        ctx.arc(dx, dy, 0.6 + random() * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (brush.render === "soft") {
    // Watercolor: soft, blurred, layered bleed -- a wide faint pass under a
    // narrower, slightly stronger core.
    ctx.fillStyle = color;
    const outerOutline = getStroke(points, { size: size * 1.4, ...brush.strokeOptions });
    ctx.filter = "blur(5px)";
    ctx.globalAlpha = 0.3;
    ctx.fill(outlineToPath2D(outerOutline));
    ctx.filter = "none";
    ctx.globalAlpha = 0.45;
    const innerOutline = getStroke(points, { size: size * 0.8, ...brush.strokeOptions });
    ctx.fill(outlineToPath2D(innerOutline));
  } else if (brush.render === "textured" && brush.key === "oil-brush") {
    // Bristle simulation: several offset passes at varying opacity, like
    // separate bristle tracks loaded with slightly different paint.
    const outline = getStroke(points, { size, ...brush.strokeOptions });
    const path = outlineToPath2D(outline);
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate((random() - 0.5) * size * 0.35, (random() - 0.5) * size * 0.35);
      ctx.globalAlpha = 0.4 + random() * 0.35;
      ctx.fillStyle = color;
      ctx.fill(path);
      ctx.restore();
    }
  } else if (brush.render === "textured") {
    // Crayón / lápiz natural: dry-media grain -- lots of tiny jittered dabs
    // instead of a flat fill, so paper-texture-like gaps show through.
    ctx.fillStyle = color;
    const dabsPerPoint = brush.key === "crayon" ? 6 : 9;
    const jitter = brush.key === "crayon" ? size * 0.55 : size * 0.32;
    const dabSize = brush.key === "crayon" ? size * 0.3 : size * 0.13;
    for (const [x, y] of points) {
      for (let i = 0; i < dabsPerPoint; i++) {
        const dx = x + (random() - 0.5) * jitter;
        const dy = y + (random() - 0.5) * jitter;
        ctx.globalAlpha = 0.2 + random() * 0.55;
        ctx.beginPath();
        ctx.arc(dx, dy, dabSize * (0.5 + random() * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}
