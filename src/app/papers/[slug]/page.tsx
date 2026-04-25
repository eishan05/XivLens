import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPapers, getPaper } from "@/papers/registry";

type PaperPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllPapers().map((paper) => ({
    slug: paper.meta.slug
  }));
}

export async function generateMetadata({ params }: PaperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = getPaper(slug);

  if (!paper) {
    return {
      title: "Paper not found - XivLens"
    };
  }

  return {
    title: `${paper.meta.title} - XivLens`,
    description: paper.meta.abstract
  };
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { slug } = await params;
  const paper = getPaper(slug);

  if (!paper) {
    notFound();
  }

  const VisualEssay = paper.VisualEssay;
  return <VisualEssay />;
}
