import type { ComponentType } from "react";

function LightWarm() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="#F2C879" stroke="#C9A08A" strokeWidth="2" />
    </svg>
  );
}

function LightString() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="8" cy="10" r="4" fill="#F2C879" />
      <circle cx="20" cy="10" r="4" fill="#F2C879" />
      <path
        d="M8 10 Q14 20 20 10"
        stroke="#8C6A4E"
        fill="none"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function PlantFern() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="10" y="20" width="8" height="6" fill="#B8925A" />
      <path
        d="M14 20 C14 10 6 8 4 4 M14 20 C14 10 22 8 24 4 M14 20 V6"
        stroke="#3E7A4C"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function PlantSucculent() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <rect x="9" y="18" width="10" height="8" rx="1" fill="#C9A08A" />
      <circle cx="14" cy="14" r="7" fill="#5FA96B" />
    </svg>
  );
}

export interface DecorationCatalogItem {
  type: string;
  variant: string;
  label: string;
  Icon: ComponentType;
}

export const DECORATION_CATALOG: DecorationCatalogItem[] = [
  { type: "light", variant: "warm", label: "Luz cálida", Icon: LightWarm },
  {
    type: "light",
    variant: "string",
    label: "Guirnalda de luces",
    Icon: LightString,
  },
  { type: "plant", variant: "fern", label: "Helecho", Icon: PlantFern },
  {
    type: "plant",
    variant: "succulent",
    label: "Suculenta",
    Icon: PlantSucculent,
  },
];

export const DECORATION_ICONS: Record<string, Record<string, ComponentType>> = {
  light: { warm: LightWarm, string: LightString },
  plant: { fern: PlantFern, succulent: PlantSucculent },
};
