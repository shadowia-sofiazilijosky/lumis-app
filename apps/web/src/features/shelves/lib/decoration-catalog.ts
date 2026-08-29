export const DECORATION_CATEGORIES = ["Todo", "Dragones", "PlantasFlores"] as const;

export type DecorationCategory = (typeof DECORATION_CATEGORIES)[number];

export interface DecorationCatalogItem {
  type: string;
  variant: string;
  category: DecorationCategory;
  imageUrl: string;
  /** Placement size when dragged onto the canvas, for pieces whose aspect
   * ratio would look wrong in the generic square DEFAULT_DECORATION_SIZE
   * (e.g. a long horizontal vine). Omitted items fall back to that default.
   * object-fit: contain on the rendered <img> means the artwork itself
   * never distorts either way -- this only affects the starting box shape. */
  defaultSize?: { width: number; height: number };
}

// The fire-breath pair (fuego-izq/fuego-der) and the black dragon pair
// (negro-cabeza/negro-cola) are deliberately two independent catalog items
// each, not one combined image -- the user drags each half separately onto
// either side of a row of books, instead of being locked into one fixed
// arrangement.
export const DECORATION_CATALOG: DecorationCatalogItem[] = [
  {
    type: "dragon",
    variant: "vitral",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-vitral.png",
  },
  {
    type: "dragon",
    variant: "fuego-izq",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-fuego-izq.png",
  },
  {
    type: "dragon",
    variant: "fuego-der",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-fuego-der.png",
  },
  {
    type: "dragon",
    variant: "lector",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-lector.png",
  },
  {
    type: "dragon",
    variant: "negro-cabeza",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-negro-cabeza.png",
  },
  {
    type: "dragon",
    variant: "negro-cola",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-negro-cola.png",
  },
  {
    type: "dragon",
    variant: "dorado",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-dorado.png",
  },
  {
    type: "dragon",
    variant: "rosa",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-dragon-rosa.png",
  },
  {
    type: "dragon",
    variant: "huevo",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-huevo-dragon.png",
  },
  {
    type: "dragon",
    variant: "garra",
    category: "Dragones",
    imageUrl: "/assets/shelves/decorations/deco-garra-dragon.png",
  },
  // "Plantas y flores" -- grows over time without touching anything else
  // (category chip, translations, and this catalog are the only places a
  // new piece needs to be registered).
  {
    type: "plant",
    variant: "enredadera-simple",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-enredadera-simple.png",
    // Image is 867x288 (~3:1) -- a wide, short box instead of the square
    // default so it doesn't start out looking cramped/letterboxed.
    defaultSize: { width: 180, height: 60 },
  },
  {
    type: "plant",
    variant: "enredadera-colgante",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-enredadera-colgante.png",
    // 408x612 (~2:3) -- tall hanging vine, needs a tall default box.
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "plant",
    variant: "enredadera-flores-blancas",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-enredadera-flores-blancas.png",
    // 375x666 (~0.56) -- even taller/narrower hanging vine.
    defaultSize: { width: 90, height: 160 },
  },
  {
    type: "plant",
    variant: "macetita-rosas-rojas",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-macetita-rosas-rojas.png",
  },
  {
    type: "plant",
    variant: "ramo-fantasia",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-ramo-fantasia.png",
  },
  {
    type: "plant",
    variant: "suculenta-barro",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-suculenta-barro.png",
  },
  {
    type: "plant",
    variant: "flores-secas-oscuro",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-flores-secas-oscuro.png",
  },
  {
    type: "plant",
    variant: "rosas-oscuras",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-rosas-oscuras.png",
  },
  {
    type: "plant",
    variant: "helecho-macetero",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-helecho-macetero.png",
  },
  {
    type: "plant",
    variant: "peonias-rosas",
    category: "PlantasFlores",
    imageUrl: "/assets/shelves/decorations/deco-peonias-rosas.png",
  },
];

export function findDecorationImage(type: string, variant: string | null): string | null {
  return (
    DECORATION_CATALOG.find((item) => item.type === type && item.variant === variant)
      ?.imageUrl ?? null
  );
}

export function findDecorationDefaultSize(
  type: string,
  variant: string | null,
): { width: number; height: number } | null {
  return (
    DECORATION_CATALOG.find((item) => item.type === type && item.variant === variant)
      ?.defaultSize ?? null
  );
}
