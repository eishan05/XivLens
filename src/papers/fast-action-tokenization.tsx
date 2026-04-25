import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "fast-action-tokenization",
  title: "FAST: Action Tokenization",
  subtitle: "DCT and BPE turn high-frequency robot action chunks into dense tokens for autoregressive VLAs.",
  abstract:
    "A mechanism-first read of FAST, the compression tokenizer that lets autoregressive robot policies learn dexterous control without falling back to per-timestep binning.",
  authors: [
    "Karl Pertsch",
    "Kyle Stachowicz",
    "Brian Ichter",
    "Danny Driess",
    "Suraj Nair",
    "Quan Vuong",
    "Oier Mees",
    "Chelsea Finn",
    "Sergey Levine"
  ],
  venue: "arXiv 2501.09747",
  publishedAt: "Jan 16, 2025",
  sourceUrl: "https://arxiv.org/pdf/2501.09747",
  tags: ["robotics", "VLA", "tokenization", "compression"],
  accent: "#875f2a",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "High-frequency actions make weak next-token targets" },
  { id: "pipeline", label: "Pipeline", title: "FAST compresses the chunk before the VLA sees it" },
  { id: "comparison", label: "Comparison", title: "The baseline spends tokens on repeated motion" },
  { id: "universal", label: "FAST+", title: "A universal tokenizer makes the method portable" },
  { id: "evidence", label: "Evidence", title: "pi0-FAST trades inference speed for faster training" }
];

function FastEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Training signal"
        title="Binning high-rate control turns motion into near-duplicates."
        aside={
          <PullNote label="Core failure" tone="warm">
            When adjacent actions are nearly identical, the next-token objective can reward copying the last action
            instead of learning the task-conditioned trajectory.
          </PullNote>
        }
      >
        <ActionRedundancyDiagram />
        <StepList
          items={[
            {
              title: "Chunk actions",
              body: "VLA policies predict about one second of future robot commands at a time."
            },
            {
              title: "Discretize naively",
              body: "Per-dimension, per-timestep bins turn smooth high-frequency control into long runs of similar symbols."
            },
            {
              title: "Lose signal",
              body: "As control frequency rises, each next token carries less new information for autoregressive training."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="pipeline"
        kicker="Tokenizer mechanism"
        title="The action sequence is first treated as a signal."
        aside={
          <PullNote label="Design contract" tone="cool">
            FAST uses an analytical DCT transform, then keeps BPE as the only learned piece of the tokenizer.
          </PullNote>
        }
      >
        <TokenizerPipelineDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Normalize",
              body: "Map each action dimension with robust quantiles so different robot scales fit a shared range."
            },
            {
              label: "DCT + round",
              body: "Move each dimension into frequency space and drop small coefficients through scale-and-round quantization."
            },
            {
              label: "Flatten + BPE",
              body: "Read low frequencies first, then merge repeated coefficient patterns into dense action tokens."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="comparison"
        kicker="Token budget"
        title="Compression matters most when the robot moves quickly."
        aside={<CompressionScorecard />}
      >
        <ComparisonRows
          leftTitle="Naive bins"
          rightTitle="FAST tokens"
          rows={[
            {
              label: "Unit",
              left: "one token per action dimension per timestep",
              right: "one token for a compressed coefficient pattern"
            },
            {
              label: "Ordering",
              left: "time first, even when steps barely change",
              right: "low-frequency shape first, then detail"
            },
            {
              label: "50 Hz folding",
              left: "about 700 tokens per 1-second chunk",
              right: "about 53 tokens per 1-second chunk"
            },
            {
              label: "Learning",
              left: "struggles on table bussing and T-shirt folding",
              right: "trains effective autoregressive policies"
            }
          ]}
        />
        <FrequencyMatrix />
      </PaperSpread>

      <PaperSpread
        id="universal"
        kicker="FAST+"
        title="The universal tokenizer is trained once, then reused as a black box."
        aside={
          <PullNote label="Release shape" tone="neutral">
            FAST+ is released as a Hugging Face AutoProcessor under the physical-intelligence/fast identifier.
          </PullNote>
        }
      >
        <MetricDelta
          leftLabel="training data"
          leftValue="1M"
          center="real robot action sequences for the universal tokenizer"
          rightLabel="chunk size"
          rightValue="1s"
        />
        <EmbodimentStrip />
        <StepList
          items={[
            {
              title: "Collect cross-embodiment chunks",
              body: "The paper mixes single-arm, bi-manual, and mobile manipulation robots with different control spaces."
            },
            {
              title: "Train the BPE vocabulary",
              body: "DCT and quantization stay fixed while the BPE dictionary learns common coefficient patterns."
            },
            {
              title: "Apply off the shelf",
              body: "FAST+ remains competitive with dataset-specific FAST tokenizers across the tested settings."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Scaling result"
        title="pi0-FAST reaches diffusion-level performance with less training compute."
        aside={<InferenceTradeoff />}
      >
        <MetricDelta
          leftLabel="training reduction"
          leftValue="5x"
          center="fewer GPU hours reported for the generalist pi0-FAST policy"
          rightLabel="decoded tokens"
          rightValue="30-60"
        />
        <ComparisonRows
          leftTitle="What improves"
          rightTitle="What remains open"
          rows={[
            {
              label: "Training",
              left: "Autoregressive VLAs become viable on dexterous, high-frequency data.",
              right: "The best architecture tradeoff between diffusion and autoregression is not settled."
            },
            {
              label: "Scale",
              left: "pi0-FAST matches diffusion pi0 on the reported generalist robot tasks.",
              right: "The paper directly tests static manipulators, not every morphology in closed-loop policy rollouts."
            },
            {
              label: "Runtime",
              left: "Action chunks can be decoded from a standard VLM-style vocabulary.",
              right: "Autoregressive decoding is slower than diffusion pi0 in the reported setup."
            }
          ]}
        />
      </PaperSpread>
    </PaperShell>
  );
}

function ActionRedundancyDiagram() {
  const rows = [
    ["10 Hz", "a0", "a4", "a9", "shape"],
    ["20 Hz", "a0", "a2", "a4", "more repeats"],
    ["50 Hz", "a0", "a1", "a2", "copy trap"]
  ];

  return (
    <div className="fast-redundancy" aria-label="High-frequency action redundancy">
      {rows.map((row, rowIndex) => (
        <div className={`fast-redundancy-row row-${rowIndex}`} key={row[0]}>
          <span>{row[0]}</span>
          {row.slice(1).map((cell, cellIndex) => (
            <i key={`${row[0]}-${cellIndex}`}>{cell}</i>
          ))}
        </div>
      ))}
    </div>
  );
}

function TokenizerPipelineDiagram() {
  return (
    <div className="fast-pipeline" aria-label="FAST tokenizer pipeline">
      <PipelineBlock label="chunk" value="normalized actions" tone="input" />
      <PipelineArrow />
      <PipelineBlock label="DCT" value="frequency matrix" tone="signal" />
      <PipelineArrow />
      <PipelineBlock label="quantize" value="sparse integers" tone="signal" />
      <PipelineArrow />
      <PipelineBlock label="BPE" value="dense tokens" tone="tokens" />
    </div>
  );
}

function PipelineBlock({ label, value, tone }: { label: string; value: string; tone: "input" | "signal" | "tokens" }) {
  return (
    <div className={`fast-pipeline-block ${tone}`}>
      <LabelPill>{label}</LabelPill>
      <strong>{value}</strong>
    </div>
  );
}

function PipelineArrow() {
  return <span className="fast-pipeline-arrow" aria-hidden="true" />;
}

function CompressionScorecard() {
  return (
    <div className="fast-scorecard" aria-label="Token compression examples">
      <CompressionMetric label="DROID" naive="105" fast="29" />
      <CompressionMetric label="Bussing" naive="140" fast="28" />
      <CompressionMetric label="Shirt fold" naive="700" fast="53" />
    </div>
  );
}

function CompressionMetric({ label, naive, fast }: { label: string; naive: string; fast: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{naive}</strong>
      <i>to</i>
      <strong>{fast}</strong>
      <p>tokens per 1-second chunk</p>
    </div>
  );
}

function FrequencyMatrix() {
  const cells = [
    "124",
    "-86",
    "344",
    "-45",
    "178",
    "12",
    "0",
    "3",
    "0",
    "15",
    "0",
    "0",
    "-3",
    "0",
    "1",
    "0",
    "0",
    "0",
    "-1",
    "0",
    "0",
    "0",
    "1",
    "5"
  ];

  return (
    <div className="fast-frequency" aria-label="Sparse DCT coefficient matrix">
      {cells.map((cell, index) => (
        <span className={cell === "0" ? "zero" : "active"} key={`${cell}-${index}`}>
          {cell}
        </span>
      ))}
      <p>Low-frequency coefficients are flattened first, so the decoder predicts coarse trajectory shape early.</p>
    </div>
  );
}

function EmbodimentStrip() {
  const robots = ["single arm", "bi-manual", "mobile", "joint ctrl", "EEF ctrl", "mixed Hz"];

  return (
    <div className="fast-embodiments" aria-label="FAST+ training mixture sketch">
      {robots.map((robot) => (
        <span key={robot}>{robot}</span>
      ))}
    </div>
  );
}

function InferenceTradeoff() {
  return (
    <div className="fast-tradeoff" aria-label="pi0-FAST inference tradeoff">
      <div>
        <span>diffusion pi0</span>
        <strong>&lt;100 ms</strong>
        <p>about 10 diffusion steps through the action expert</p>
      </div>
      <div>
        <span>pi0-FAST</span>
        <strong>750 ms</strong>
        <p>30-60 autoregressive tokens through the VLM backbone</p>
      </div>
      <div className="fast-tradeoff-rule" style={{ "--fast-width": "7.5" } as CSSProperties} />
    </div>
  );
}

export const fastActionTokenization: PaperModule = {
  meta,
  sections,
  VisualEssay: FastEssay
};
