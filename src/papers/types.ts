import type { ComponentType } from "react";

export type PaperStatus = "demo" | "paper";

export type PaperSection = {
  id: string;
  label: string;
  title: string;
};

export type PaperMeta = {
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  authors: string[];
  venue: string;
  publishedAt: string;
  sourceUrl?: string;
  tags: string[];
  accent: string;
  status: PaperStatus;
};

export type PaperModule = {
  meta: PaperMeta;
  sections: PaperSection[];
  VisualEssay: ComponentType;
};
