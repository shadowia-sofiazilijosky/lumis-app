import { ShelfList } from "@/features/shelves/components/shelf-list";

export const metadata = {
  title: "Tus estanterías — Lumis",
};

export default function ShelvesPage() {
  return (
    <section>
      <ShelfList />
    </section>
  );
}
