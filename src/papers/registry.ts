import { pi0VlaFlow } from "./pi0-vla-flow";
import type { PaperModule } from "./types";

export const papers: PaperModule[] = [pi0VlaFlow];

export function getAllPapers() {
  return [...papers].sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function getPaper(slug: string) {
  return papers.find((paper) => paper.meta.slug === slug);
}
