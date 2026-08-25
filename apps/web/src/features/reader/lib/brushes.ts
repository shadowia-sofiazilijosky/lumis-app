import { getStroke } from "perfect-freehand";
import type { StrokeOptions } from "perfect-freehand";

export interface BrushDef {
  key: string;
  label: string;
  strokeOptions: StrokeOptions;
  /** solid = flat fill; soft = blurred/translucent (airbrush, acuarela);
   * textured = grainy edge (óleo, crayón, lápiz). */
  render: "solid" | "soft" | "textured";
}

export const BRUSHES: BrushDef[] = [
  {
    key: "calligraphy-brush",
    label: "Pincel de caligrafía",
    strokeOptions: { thinning: 0.75, smoothing: 0.4, streamline: 0.25, simulatePressure: true },
    render: "solid",
  },
  {
    key: "calligraphy-pencil",
    label: "Lápiz caligráfico",
    strokeOptions: { thinning: 0.85, smoothing: 0.25, streamline: 0.15, simulatePressure: true },
    render: "solid",
  },
  {
    key: "airbrush",
    label: "Aerógrafo",
    strokeOptions: { thinning: 0.15, smoothing: 0.8, streamline: 0.5, simulatePressure: true },
    render: "soft",
  },
  {
    key: "oil-brush",
    label: "Pincel para óleo",
    strokeOptions: { thinning: 0.25, smoothing: 0.55, streamline: 0.4, simulatePressure: true },
    render: "textured",
  },
  {
    key: "crayon",
    label: "Crayón",
    strokeOptions: { thinning: 0.35, smoothing: 0.15, streamline: 0.2, simulatePressure: true },
    render: "textured",
  },
  {
    key: "marker",
    label: "Marcador",
    strokeOptions: { thinning: 0.05, smoothing: 0.5, streamline: 0.55 },
    render: "solid",
  },
  {
    key: "natural-pencil",
    label: "Lápiz natural",
    strokeOptions: { thinning: 0.5, smoothing: 0.3, streamline: 0.3, simulatePressure: true },
    render: "textured",
  },
  {
    key: "watercolor",
    label: "Pincel para acuarela",
    strokeOptions: { thinning: 0.2, smoothing: 0.9, streamline: 0.6, simulatePressure: true },
    render: "soft",
  },
];

export function getBrush(key: string): BrushDef {
  return BRUSHES.find((b) => b.key === key) ?? BRUSHES[5];
}

/** perfect-freehand's own reference conversion from its outline points to a
 * smooth SVG path (consecutive quadratic beziers through the midpoints). */
export function getSvgPathFromStroke(points: number[][]): string {
  if (!points.length) return "";

  const d = points.reduce<(string | number)[]>(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...points[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

/** Builds the filled outline path for a stroke's points (pixel coordinates)
 * at the given brush + base size. */
export function strokeToPath(
  points: [number, number][],
  brush: BrushDef,
  size: number,
): string {
  const outline = getStroke(points, { size, ...brush.strokeOptions });
  return getSvgPathFromStroke(outline);
}
