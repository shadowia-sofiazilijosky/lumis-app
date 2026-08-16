import { LibraryView } from "@/features/books/components/library-view";

export const metadata = {
  title: "Tu biblioteca — Lumis",
};

export default function LibraryPage() {
  return (
    <section>
      <h1>Tu biblioteca</h1>
      <LibraryView />
    </section>
  );
}
