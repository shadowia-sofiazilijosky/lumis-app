import { getTranslations } from "next-intl/server";
import { BookNotesView } from "@/features/notes/components/book-notes-view";

export async function generateMetadata() {
  const t = await getTranslations("notesPage");
  return { title: t("pageTitle") };
}

export default async function BookNotesPage({
  params,
}: {
  params: Promise<{ bookId: string }>;
}) {
  const { bookId } = await params;
  return <BookNotesView bookId={bookId} />;
}
