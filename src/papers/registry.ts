import { pi0VlaFlow } from "./pi0-vla-flow";
import { pi05KnowledgeInsulation } from "./pi05-knowledge-insulation";
import { pi05OpenWorld } from "./pi05-open-world";
import { piStar06Recap } from "./pistar06-recap";
import { pi07SteerableGeneralist } from "./pi07-steerable-generalist";
import { fastActionTokenization } from "./fast-action-tokenization";
import { hiRobot } from "./hi-robot";
import { humanToRobotTransfer } from "./human-to-robot-transfer";
import { memMultiscaleMemory } from "./mem-multiscale-memory";
import { realTimeChunking } from "./real-time-chunking";
import { rlToken } from "./rl-token";
import { trainingTimeActionConditioning } from "./training-time-action-conditioning";
import type { PaperModule } from "./types";

export const papers: PaperModule[] = [
  fastActionTokenization,
  hiRobot,
  humanToRobotTransfer,
  memMultiscaleMemory,
  pi05KnowledgeInsulation,
  pi05OpenWorld,
  piStar06Recap,
  pi07SteerableGeneralist,
  pi0VlaFlow,
  realTimeChunking,
  rlToken,
  trainingTimeActionConditioning
];

export function getAllPapers() {
  return [...papers].sort((a, b) => a.meta.title.localeCompare(b.meta.title));
}

export function getPaper(slug: string) {
  return papers.find((paper) => paper.meta.slug === slug);
}
