export interface BackgroundOption {
  key: string;
  label: string;
  /** Solid options set backgroundColor and clear backgroundImageUrl; photo options do the opposite. */
  kind: "solid" | "photo";
  value: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { key: "solid-cream", label: "Crema", kind: "solid", value: "#f5ede0" },
  { key: "solid-rose", label: "Rosa viejo", kind: "solid", value: "#e3c3c3" },
  { key: "solid-forest", label: "Verde bosque", kind: "solid", value: "#3f5b46" },
  { key: "solid-navy", label: "Azul noche", kind: "solid", value: "#1c2740" },
  {
    key: "romantasy",
    label: "Romantasy",
    kind: "photo",
    value: "/assets/shelves/backgrounds/fondo-romantasy.jpg",
  },
  {
    key: "dark-academia",
    label: "Dark academia",
    kind: "photo",
    value: "/assets/shelves/backgrounds/fondo-dark-academia.jpg",
  },
  {
    key: "dark-romance",
    label: "Dark romance",
    kind: "photo",
    value: "/assets/shelves/backgrounds/fondo-dark-romance.jpg",
  },
  {
    key: "minimalista",
    label: "Minimalista",
    kind: "photo",
    value: "/assets/shelves/backgrounds/fondo-minimalista.jpg",
  },
];

export interface ShelfFrameOption {
  key: string;
  label: string;
  imageUrl: string;
}

export const SHELF_FRAME_OPTIONS: ShelfFrameOption[] = [
  {
    key: "clara",
    label: "Madera clara",
    imageUrl: "/assets/shelves/frames/estante-madera-clara.png",
  },
  {
    key: "media",
    label: "Madera media",
    imageUrl: "/assets/shelves/frames/estante-madera-media.png",
  },
  {
    key: "negra",
    label: "Madera negra",
    imageUrl: "/assets/shelves/frames/estante-madera-negra.png",
  },
  {
    key: "blanca",
    label: "Madera blanca",
    imageUrl: "/assets/shelves/frames/estante-madera-blanca.png",
  },
];

export function findShelfFrameImage(key: string | null): string | null {
  return SHELF_FRAME_OPTIONS.find((option) => option.key === key)?.imageUrl ?? null;
}
