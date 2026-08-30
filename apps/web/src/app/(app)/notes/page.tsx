import { getTranslations } from "next-intl/server";
import { NotesView } from "@/features/notes/components/notes-view";

export async function generateMetadata() {
  const t = await getTranslations("notesPage");
  return { title: t("pageTitle") };
}

export default function NotesPage() {
  return <NotesView />;
}
