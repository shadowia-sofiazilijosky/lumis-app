export const DECORATION_CATEGORIES = ["Todo", "Dragones", "PlantasFlores", "DarkRomance"] as const;

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
  // "Dark Romance" -- gothic/dark-academia trinkets (skulls, ravens, candles,
  // weapons, framed art). Most pieces are a tall 408x612 (~2:3) or 375x666
  // (~0.56) portrait PNG; a handful are notably wide/long (the spiderweb,
  // the five bladed/firearm pieces, one horizontal knife) and get an
  // explicit defaultSize below so they don't start out looking cramped.
  {
    type: "darkRomance",
    variant: "florero-calavera-rosas-rojas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-florero-calavera-rosas-rojas.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "jarron-negro-flores-azules",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-jarron-negro-flores-azules.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "copa-flores-rojas-negras",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-copa-flores-rojas-negras.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "florero-cristal-flores-marchitas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-florero-cristal-flores-marchitas.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "jarron-dorado-rosas-negras",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-jarron-dorado-rosas-negras.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "calavera-serpiente-ojos",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-serpiente-ojos.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "calavera-serpiente-boca",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-serpiente-boca.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "calavera-corona-espinas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-corona-espinas.png",
  },
  {
    type: "darkRomance",
    variant: "calavera-mariposa-negra",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-mariposa-negra.png",
  },
  {
    type: "darkRomance",
    variant: "calavera-enredadera-rosas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-enredadera-rosas.png",
  },
  {
    type: "darkRomance",
    variant: "calavera-negra-rosa-dorada",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-negra-rosa-dorada.png",
  },
  {
    type: "darkRomance",
    variant: "calavera-triple",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-triple.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "calavera-negra-serpiente-negra",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-negra-serpiente-negra.png",
  },
  {
    type: "darkRomance",
    variant: "calavera-saliendo",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-saliendo.png",
  },
  {
    type: "darkRomance",
    variant: "calaveras-enamoradas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calaveras-enamoradas.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "calavera-rosas-violetas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-rosas-violetas.png",
    // 375x666 (~0.56) -- same tall/narrow shape as the plant "enredadera
    // con flores blancas" above.
    defaultSize: { width: 90, height: 160 },
  },
  {
    type: "darkRomance",
    variant: "calavera-celeste",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-calavera-celeste.png",
    defaultSize: { width: 90, height: 160 },
  },
  {
    type: "darkRomance",
    variant: "parca-leyendo-libro",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-parca-leyendo-libro.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "cuervo-posado-libros",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuervo-posado-libros.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "cuervo-alas-abiertas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuervo-alas-abiertas.png",
  },
  {
    type: "darkRomance",
    variant: "mano-esqueleto-anillo",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-mano-esqueleto-anillo.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "portavela-calavera",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-portavela-calavera.png",
  },
  {
    type: "darkRomance",
    variant: "portavela-huesos-cruzados",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-portavela-huesos-cruzados.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "vela-negra-goteando",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-vela-negra-goteando.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "candelabro-serpiente-dorado",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-candelabro-serpiente-dorado.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "velas-negras-triples",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-velas-negras-triples.png",
  },
  {
    type: "darkRomance",
    variant: "candelabro-velas-rojas-rosas",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-candelabro-velas-rojas-rosas.png",
  },
  {
    type: "darkRomance",
    variant: "daga-gotica-mango-negro",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-daga-gotica-mango-negro.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "frasco-veneno-verde",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-frasco-veneno-verde.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "botella-veneno-calavera-tapa",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-botella-veneno-calavera-tapa.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "cuchillo-rosas-sangre",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuchillo-rosas-sangre.png",
    // 612x408 (~1.5) -- horizontal blade, wider than tall.
    defaultSize: { width: 120, height: 80 },
  },
  {
    type: "darkRomance",
    variant: "pistola-antigua-dorada",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-pistola-antigua-dorada.png",
    // 707x353 (~2:1) -- elongated firearm, same care as the vertical vines.
    defaultSize: { width: 150, height: 75 },
  },
  {
    type: "darkRomance",
    variant: "pistola-rosa-negra",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-pistola-rosa-negra.png",
    defaultSize: { width: 150, height: 75 },
  },
  {
    type: "darkRomance",
    variant: "revolver-vintage-cadena",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-revolver-vintage-cadena.png",
    defaultSize: { width: 150, height: 75 },
  },
  {
    type: "darkRomance",
    variant: "navaja-mango-hueso",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-navaja-mango-hueso.png",
    defaultSize: { width: 150, height: 75 },
  },
  {
    type: "darkRomance",
    variant: "katana-gotica-funda",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-katana-gotica-funda.png",
    defaultSize: { width: 150, height: 75 },
  },
  {
    type: "darkRomance",
    variant: "cuadro-mariposa-negra-marco",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuadro-mariposa-negra-marco.png",
  },
  {
    type: "darkRomance",
    variant: "cuadro-retrato-gotico-marco",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuadro-retrato-gotico-marco.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "cuadro-luna-cuervo-marco",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuadro-luna-cuervo-marco.png",
  },
  {
    type: "darkRomance",
    variant: "cuadro-rosas-negras-marco-dorado",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-cuadro-rosas-negras-marco-dorado.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "mascara-roja",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-mascara-roja.png",
    defaultSize: { width: 90, height: 160 },
  },
  {
    type: "darkRomance",
    variant: "mascara-verde",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-mascara-verde.png",
    defaultSize: { width: 90, height: 160 },
  },
  {
    type: "darkRomance",
    variant: "telarana",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-telarana.png",
    // 866x288 (~3:1) -- same wide/short shape as "enredadera simple" above,
    // so it doesn't get squeezed into a square on first drop.
    defaultSize: { width: 180, height: 60 },
  },
  {
    type: "darkRomance",
    variant: "libro-antiguo-cerradura",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-libro-antiguo-cerradura.png",
  },
  {
    type: "darkRomance",
    variant: "arana-decorativa-gotica",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-arana-decorativa-gotica.png",
  },
  {
    type: "darkRomance",
    variant: "reloj-arena-calavera-base",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-reloj-arena-calavera-base.png",
    defaultSize: { width: 100, height: 150 },
  },
  {
    type: "darkRomance",
    variant: "globo-terraqueo-vintage-oscuro",
    category: "DarkRomance",
    imageUrl: "/assets/shelves/decorations/deco-globo-terraqueo-vintage-oscuro.png",
    defaultSize: { width: 100, height: 150 },
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
