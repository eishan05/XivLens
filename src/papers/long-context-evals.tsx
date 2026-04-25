import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import {
  GraphWalkDiagram,
  LabelPill,
  MetricDelta,
  PipelineFlow,
  TokenRail
} from "@/components/VisualPrimitives";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "long-context-evals",
  title: "MRCR vs GraphWalks",
  subtitle: "Both fill the context window. One stresses ordered memory; the other stresses computation over memory.",
  abstract:
    "A starter module for comparing long-context evaluation tasks without flattening them into one generic retrieval story.",
  authors: ["XivLens demo"],
  venue: "Starter visualization",
  publishedAt: "2026",
  tags: ["evaluation", "long context", "reasoning"],
  accent: "#b85f43",
  status: "demo" as const
};

const sections: PaperSection[] = [
  { id: "overview", label: "Overview", title: "Same context size, different skill" },
  { id: "mrcr", label: "MRCR", title: "Ordering plus disambiguation" },
  { id: "graphwalks", label: "GraphWalks", title: "Algorithmic traversal over remembered structure" },
  { id: "comparison", label: "Comparison", title: "What each benchmark buys" },
  { id: "takeaway", label: "Takeaway", title: "Do not call every long-context task retrieval" }
];

function LongContextEvalsEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="overview"
        kicker="Evaluation lens"
        title="A million tokens can test different failure modes."
        aside={
          <PullNote label="Reading posture" tone="warm">
            The right visualization separates memory location, disambiguation, and computation instead of
            compressing them into one score.
          </PullNote>
        }
      >
        <div className="split-visual">
          <div>
            <LabelPill>MRCR-style</LabelPill>
            <h3>Find the kth matching request.</h3>
            <p>Many similar turns compete. The model must count, select the target, and copy it exactly.</p>
          </div>
          <div>
            <LabelPill>Graph walk</LabelPill>
            <h3>Run the traversal.</h3>
            <p>Scattered edges define structure. The model must reconstruct adjacency and execute the query.</p>
          </div>
        </div>
      </PaperSpread>

      <PaperSpread
        id="mrcr"
        kicker="Memory pressure"
        title="MRCR makes abundance a disambiguation problem."
      >
        <TokenRail
          activeIndex={7}
          tokens={[
            { label: "T1", kind: "warm" },
            { label: ".", kind: "muted" },
            { label: "T2", kind: "warm" },
            { label: ".", kind: "muted" },
            { label: "T3", kind: "warm" },
            { label: ".", kind: "muted" },
            { label: "T4", kind: "warm" },
            { label: ".", kind: "muted" },
            { label: "T5", kind: "warm" },
            { label: ".", kind: "muted" },
            { label: "TN", kind: "warm" }
          ]}
        />
        <StepList
          items={[
            {
              title: "Count ordered turns",
              body: "The target is defined by position among similar requests, not by unique wording."
            },
            {
              title: "Filter near duplicates",
              body: "Distractor answers are valid-looking but wrong for the requested index."
            },
            {
              title: "Copy back exactly",
              body: "Evaluation penalizes paraphrase because the task asks for a specific prior answer."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="graphwalks"
        kicker="Computation pressure"
        title="GraphWalks asks the model to execute an algorithm over context."
        aside={<GraphWalkDiagram />}
      >
        <PipelineFlow
          stages={[
            {
              label: "Parse",
              body: "Collect scattered edge statements into an implicit adjacency list."
            },
            {
              label: "Expand",
              body: "Move frontier by frontier, deduplicating nodes at each depth."
            },
            {
              label: "Return",
              body: "Emit the exact node set requested by the query."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="comparison" kicker="Benchmark anatomy" title="The tasks reward different capabilities.">
        <ComparisonRows
          leftTitle="MRCR-style"
          rightTitle="GraphWalks-style"
          rows={[
            {
              label: "Measures",
              left: "memory of where an answer appeared",
              right: "computation over remembered structure"
            },
            {
              label: "Gets harder when",
              left: "more similar needles are inserted",
              right: "more hops compound traversal state"
            },
            {
              label: "What CoT buys",
              left: "little if the target token was never retained",
              right: "a lot because the chain can simulate the traversal"
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="takeaway" kicker="Atlas summary" title="Long context is not a single axis.">
        <MetricDelta
          leftLabel="ordered memory"
          leftValue="MRCR"
          center="same window length, different bottleneck"
          rightLabel="stateful reasoning"
          rightValue="GraphWalks"
        />
        <PullNote label="For real papers" tone="cool">
          This page should anchor every comparison to the benchmark definition, scoring rule, and reported model
          behavior from the source paper.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

export const longContextEvals: PaperModule = {
  meta,
  sections,
  VisualEssay: LongContextEvalsEssay
};
