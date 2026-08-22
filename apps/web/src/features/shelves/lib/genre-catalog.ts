import {
  BookMarked,
  Compass,
  Ghost,
  Heart,
  Leaf,
  Search,
  Sparkles,
  Wand2,
  type LucideIcon,
} from "lucide-react";

interface GenreStyle {
  color: string;
  Icon: LucideIcon;
}

const GENRE_STYLES: { match: RegExp; style: GenreStyle }[] = [
  {
    match: /fantas/i,
    style: { color: "#9c8fc9", Icon: Wand2 },
  },
  {
    match: /roman/i,
    style: { color: "#d98695", Icon: Heart },
  },
  {
    match: /no.?ficci|ensayo|biograf/i,
    style: { color: "#7a9b7e", Icon: Leaf },
  },
  {
    match: /misterio|thriller|suspenso/i,
    style: { color: "#8a8a92", Icon: Search },
  },
  {
    match: /terror|horror/i,
    style: { color: "#5c5470", Icon: Ghost },
  },
  {
    match: /aventura|accion|acción/i,
    style: { color: "#c98a4c", Icon: Compass },
  },
];

const FALLBACK_STYLES: GenreStyle[] = [
  { color: "#9c8fc9", Icon: Sparkles },
  { color: "#c9a874", Icon: BookMarked },
  { color: "#7a9b7e", Icon: Leaf },
  { color: "#8a8a92", Icon: Compass },
];

export function getGenreStyle(genre: string | null, fallbackIndex: number): GenreStyle {
  if (genre) {
    const found = GENRE_STYLES.find(({ match }) => match.test(genre));
    if (found) return found.style;
  }
  return FALLBACK_STYLES[fallbackIndex % FALLBACK_STYLES.length];
}
