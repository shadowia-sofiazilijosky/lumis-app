import { ReaderShell } from "@/features/reader/components/reader-shell";

export default async function Page(props: PageProps<"/read/[bookId]">) {
  const { bookId } = await props.params;
  return <ReaderShell bookId={bookId} />;
}
