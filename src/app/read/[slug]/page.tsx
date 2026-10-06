import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBook } from "@/lib/api";
import { ReaderClient } from "@/components/reader/reader-client";

export async function generateMetadata(props: PageProps<"/read/[slug]">): Promise<Metadata> {
  const b = await getBook((await props.params).slug);
  return { title: b ? `Reading ${b.title}` : "Reader" };
}

export default async function ReadPage(props: PageProps<"/read/[slug]">) {
  const book = await getBook((await props.params).slug);
  if (!book || !book.epubUrl) notFound();
  // TODO(paywall): once accounts exist, check the 5-free-books allowance / subscription
  // here (and in the API) and render the paywall instead of the reader.
  return (
    <ReaderClient
      book={{
        slug: book.slug,
        title: book.title,
        author: book.author,
        thumbUrl: book.thumbUrl,
        epubUrl: book.epubUrl,
        pageCount: book.pageCount,
      }}
    />
  );
}
