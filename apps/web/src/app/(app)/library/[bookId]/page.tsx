import { BookDetailView } from "@/features/books/components/book-detail-view";

export default async function Page(props: PageProps<"/library/[bookId]">) {
  const { bookId } = await props.params;
  return <BookDetailView bookId={bookId} />;
}
