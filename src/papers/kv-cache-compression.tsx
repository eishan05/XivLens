import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import {
  CompressionDiagram,
  LabelPill,
  MatrixSketch,
  MetricDelta,
  PipelineFlow,
  StateBuffer,
  TokenRail
} from "@/components/VisualPrimitives";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "kv-cache-compression",
  title: "Prefill vs Decode",
  subtitle: "Both compress KV cache. Both use gated pooling. The phases demand different visual explanations.",
  abstract:
    "A starter module showing how XivLens can explain one mechanism twice: once as a full-prompt prefill pass, and once as token-by-token decode accumulation.",
  authors: ["XivLens demo"],
  venue: "Starter visualization",
  publishedAt: "2026",
  tags: ["KV cache", "long context", "systems"],
  accent: "#2f7568",
  status: "demo" as const
};

const sections: PaperSection[] = [
  { id: "overview", label: "Overview", title: "Same compression ratio, different phase" },
  { id: "prefill", label: "Prefill", title: "Full prompt, vectorized once" },
  { id: "decode", label: "Decode", title: "Incremental state, gated writes" },
  { id: "overlap", label: "Overlap", title: "Receptive field without a full recompute" },
  { id: "takeaway", label: "Takeaway", title: "What the atlas should preserve" }
];

function KvCacheCompressionEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="overview"
        kicker="Core contrast"
        title="The same operator has two jobs depending on when it runs."
        aside={
          <PullNote label="Why visualize it" tone="cool">
            A paper reader needs to see which work is parallel, which work is delayed, and where the cache
            boundary lands. A single equation hides that distinction.
          </PullNote>
        }
      >
        <div className="split-visual">
          <div>
            <LabelPill>prefill</LabelPill>
            <h3>Everything arrives at once.</h3>
            <p>
              The full prompt can be reshaped into chunks, scored, pooled, and written in a vectorized pass.
            </p>
            <TokenRail
              tokens={[
                { label: "t0", kind: "cool" },
                { label: "t1", kind: "cool" },
                { label: "t2", kind: "cool" },
                { label: "t3", kind: "cool" },
                { label: "t4", kind: "warm" },
                { label: "t5", kind: "warm" },
                { label: "t6", kind: "warm" },
                { label: "t7", kind: "warm" }
              ]}
            />
          </div>
          <div>
            <LabelPill>decode</LabelPill>
            <h3>Only one new token arrives.</h3>
            <p>
              The module silently accumulates state and writes compressed KV only when the window is full.
            </p>
            <StateBuffer />
          </div>
        </div>
      </PaperSpread>

      <PaperSpread
        id="prefill"
        kicker="Vectorized path"
        title="Prefill compresses the whole prompt in one shot."
        aside={<MatrixSketch />}
      >
        <PipelineFlow
          stages={[
            {
              label: "Unflatten",
              body: "Reshape the sequence into chunk windows so every chunk can be handled together."
            },
            {
              label: "Gate",
              body: "Score tokens inside each chunk with a learned weighted mixture."
            },
            {
              label: "Pool",
              body: "Collapse the ratio dimension and preserve the compressed KV stream."
            }
          ]}
        />
        <PullNote label="Boundary condition" tone="warm">
          The final partial chunk cannot be completed during prefill. It becomes decode state rather than a
          visible cache discontinuity.
        </PullNote>
      </PaperSpread>

      <PaperSpread
        id="decode"
        kicker="Incremental path"
        title="Decode waits, then makes one compression event."
        aside={<StateBuffer />}
      >
        <StepList
          items={[
            {
              title: "Slot",
              body: "Each incoming token writes its KV into a small state buffer."
            },
            {
              title: "Wait",
              body: "If the current position is not the end of the compression window, return nothing."
            },
            {
              title: "Pool",
              body: "When the gate fires, compress the accumulated window into one cache entry."
            },
            {
              title: "Write",
              body: "Advance the cache position and roll the buffer forward for the next window."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="overlap"
        kicker="Receptive field"
        title="Overlap mode trades extra projection cost for a wider local view."
      >
        <CompressionDiagram />
        <ComparisonRows
          leftTitle="No overlap"
          rightTitle="Overlap mode"
          rows={[
            {
              label: "Input window",
              left: "current chunk only",
              right: "previous chunk plus current chunk"
            },
            {
              label: "Projection cost",
              left: "1x",
              right: "2x projection, same compressed cache size"
            },
            {
              label: "What improves",
              left: "clean compression boundary",
              right: "more evidence for each compressed KV entry"
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="takeaway" kicker="Atlas summary" title="A useful visualization protects the phase split.">
        <MetricDelta
          leftLabel="memory per layer"
          leftValue="4x"
          center="same compression ratio, different runtime demand"
          rightLabel="silent decode steps"
          rightValue="75%"
        />
        <PullNote label="Implementation note" tone="cool">
          For a real paper module, this section should cite the exact equation, algorithm block, and experiment
          table that support the diagram.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

export const kvCacheCompression: PaperModule = {
  meta,
  sections,
  VisualEssay: KvCacheCompressionEssay
};
