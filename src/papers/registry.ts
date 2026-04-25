import { kvCacheCompression } from "./kv-cache-compression";
import { longContextEvals } from "./long-context-evals";
import type { PaperModule } from "./types";

export const papers: PaperModule[] = [kvCacheCompression, longContextEvals];

export function getAllPapers() {
  return [...papers].sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function getPaper(slug: string) {
  return papers.find((paper) => paper.meta.slug === slug);
}
