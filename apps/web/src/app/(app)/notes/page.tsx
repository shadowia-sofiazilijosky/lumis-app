import Link from "next/link";

export const metadata = {
  title: "Notas — Lumis",
};

export default function NotesPage() {
  return (
    <section>
      <h1>Notas</h1>
      <p>
        Acá vas a poder ver todas tus reseñas, resaltados y notas en un solo
        lugar. Todavía estamos armando esta vista — por ahora, revisá tus
        notas y resaltados directamente desde cada libro en{" "}
        <Link href="/library">tu biblioteca</Link>.
      </p>
    </section>
  );
}
