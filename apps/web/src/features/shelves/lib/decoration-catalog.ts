export const DECORATION_CATEGORIES = ["Todo", "Dragones"] as const;

export type DecorationCategory = (typeof DECORATION_CATEGORIES)[number];

export interface DecorationCatalogItem {
  type: string;
  variant: string;
  category: DecorationCategory;
  imageUrl: string;
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
];

export function findDecorationImage(type: string, variant: string | null): string | null {
  return (
    DECORATION_CATALOG.find((item) => item.type === type && item.variant === variant)
      ?.imageUrl ?? null
  );
}
