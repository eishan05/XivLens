import { pi0VlaFlow } from "./pi0-vla-flow";
import { fastActionTokenization } from "./fast-action-tokenization";
import { hiRobot } from "./hi-robot";
import type { PaperModule } from "./types";

export const papers: PaperModule[] = [fastActionTokenization, hiRobot, pi0VlaFlow];

export function getAllPapers() {
  return [...papers].sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function getPaper(slug: string) {
  return papers.find((paper) => paper.meta.slug === slug);
}
