import type { StrokeOptions } from "perfect-freehand";

export interface BrushDef {
  key: string;
  label: string;
  strokeOptions: StrokeOptions;
  /** solid = flat fill; soft = airbrush spray / watercolor bleed; textured =
   * grainy dry-media dabs (óleo, crayón, lápiz); eraser = destination-out. */
  render: "solid" | "soft" | "textured" | "eraser";
}

// Same order and set as MS Paint's brush picker (Cepillo, caligrafía x2,
// aerógrafo, óleo, crayón, marcador, lápiz natural, acuarela).
export const BRUSHES: BrushDef[] = [
  {
    key: "brush",
    label: "Cepillo",
    strokeOptions: { thinning: 0.35, smoothing: 0.55, streamline: 0.4, simulatePressure: true },
    render: "solid",
  },
  {
    key: "calligraphy-brush",
    label: "Pincel de caligrafía",
    strokeOptions: { thinning: 0.9, smoothing: 0.4, streamline: 0.2, simulatePressure: true },
    render: "solid",
  },
  {
    key: "calligraphy-pencil",
    label: "Lápiz caligráfico",
    strokeOptions: { thinning: 0.95, smoothing: 0.2, streamline: 0.1, simulatePressure: true },
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
    strokeOptions: {
      thinning: 0.2,
      smoothing: 0.9,
      streamline: 0.6,
      simulatePressure: true,
      start: { taper: true },
      end: { taper: true },
    },
    render: "soft",
  },
  {
    key: "eraser",
    label: "Goma de borrar",
    strokeOptions: { thinning: 0, smoothing: 0.5, streamline: 0.5 },
    render: "eraser",
  },
];

const MARKER = BRUSHES.find((b) => b.key === "marker")!;

export function getBrush(key: string): BrushDef {
  return BRUSHES.find((b) => b.key === key) ?? MARKER;
}
