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

/** Unit tangent (stroke direction) at each point, used to lay bristle
 * offsets and hatch marks along the actual curve instead of scattering
 * them in raw x/y space. */
function computeTangents(points: [number, number][]): [number, number][] {
  return points.map((_, i) => {
    const [x0, y0] = points[Math.max(0, i - 1)];
    const [x1, y1] = points[Math.min(points.length - 1, i + 1)];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    return [dx / len, dy / len];
  });
}

function computeNormals(points: [number, number][]): [number, number][] {
  return computeTangents(points).map(([tx, ty]) => [-ty, tx]);
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
    // Cepillo, marcador, ambos caligráficos -- one flat fill, the shape
    // itself (perfect-freehand's per-brush thinning/smoothing) is what
    // tells them apart.
    const outline = getStroke(points, { size, ...brush.strokeOptions });
    ctx.fillStyle = color;
    ctx.fill(outlineToPath2D(outline));
  } else if (brush.render === "soft" && brush.key === "airbrush") {
    // True spray: many tiny low-opacity dots scattered around each sampled
    // point, fading out at the very start/end of the stroke like a real
    // spray can being pulled away from the page.
    const [r, g, b] = hexToRgb(color);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    points.forEach(([x, y], i) => {
      const t = i / Math.max(1, points.length - 1);
      const edgeFade = Math.min(1, Math.min(t, 1 - t) * 8 + 0.3);
      for (let d = 0; d < 10; d++) {
        const angle = random() * Math.PI * 2;
        const radius = random() * size;
        const dx = x + Math.cos(angle) * radius;
        const dy = y + Math.sin(angle) * radius;
        ctx.globalAlpha = (0.04 + random() * 0.07) * edgeFade;
        ctx.beginPath();
        ctx.arc(dx, dy, 0.6 + random() * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  } else if (brush.render === "soft") {
    // Acuarela: soft blurred bleed, tapered at both ends via
    // perfect-freehand's own start/end taper (baked into strokeOptions).
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
    // Bristle simulation: several parallel tracks offset sideways from the
    // stroke's own direction (not a random blob) -- reads as loaded
    // bristles dragging paint, each track independently semi-transparent.
    const normals = computeNormals(points);
    const bristleCount = 6;
    for (let b = 0; b < bristleCount; b++) {
      const offset = (b / (bristleCount - 1) - 0.5) * size * 0.9;
      const bristlePoints: [number, number][] = points.map(([x, y], i) => {
        const [nx, ny] = normals[i];
        const wobble = (random() - 0.5) * size * 0.08;
        return [x + nx * (offset + wobble), y + ny * (offset + wobble)];
      });
      const outline = getStroke(bristlePoints, {
        size: size * 0.24,
        thinning: 0.3,
        smoothing: 0.5,
        streamline: 0.4,
      });
      ctx.globalAlpha = 0.45 + random() * 0.4;
      ctx.fillStyle = color;
      ctx.fill(outlineToPath2D(outline));
    }
  } else if (brush.render === "textured") {
    // Crayón / lápiz natural: short scratchy hatch marks laid along the
    // stroke's own direction with lateral jitter, not random dots -- the
    // gaps between marks are what actually reads as dry, textured media.
    const tangents = computeTangents(points);
    const normals = computeNormals(points);
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
    const marksPerPoint = brush.key === "crayon" ? 5 : 8;
    const jitter = brush.key === "crayon" ? size * 0.45 : size * 0.28;
    const markLength = brush.key === "crayon" ? size * 0.55 : size * 0.4;
    const markWidth = brush.key === "crayon" ? size * 0.17 : size * 0.07;
    points.forEach(([x, y], i) => {
      const [tx, ty] = tangents[i];
      const [nx, ny] = normals[i];
      for (let m = 0; m < marksPerPoint; m++) {
        const lateral = (random() - 0.5) * jitter;
        const cx = x + nx * lateral;
        const cy = y + ny * lateral;
        const half = (markLength * (0.4 + random() * 0.6)) / 2;
        ctx.globalAlpha = 0.25 + random() * 0.5;
        ctx.lineWidth = markWidth * (0.6 + random() * 0.7);
        ctx.beginPath();
        ctx.moveTo(cx - tx * half, cy - ty * half);
        ctx.lineTo(cx + tx * half, cy + ty * half);
        ctx.stroke();
      }
    });
  }

  ctx.restore();
}
