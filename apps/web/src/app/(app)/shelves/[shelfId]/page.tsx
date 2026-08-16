import { ShelfEditorPage } from "@/features/shelves/components/shelf-editor-page";

export default async function Page(props: PageProps<"/shelves/[shelfId]">) {
  const { shelfId } = await props.params;
  return <ShelfEditorPage shelfId={shelfId} />;
}
