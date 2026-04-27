import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "training-time-action-conditioning",
  title: "Training-Time RTC",
  subtitle:
    "Training-Time Action Conditioning for Efficient Real-Time Chunking: a real-time policy can avoid inference-time inpainting by learning how to continue from an already committed action prefix.",
  abstract:
    "A mechanism-first read of the RTC variant that simulates robot inference delay during training, conditions a flow policy on action prefixes, and keeps runtime chunk generation cheap.",
  authors: ["Kevin Black", "Allen Z. Ren", "Michael Equi", "Sergey Levine"],
  venue: "arXiv 2512.05964v2",
  publishedAt: "Submitted Dec 5, 2025; revised Dec 9, 2025",
  sourceUrl: "https://arxiv.org/pdf/2512.05964",
  tags: ["robotics", "VLA", "real-time control", "flow matching"],
  accent: "#5f7f5a",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Large VLAs need time, but robots cannot pause the world" },
  { id: "overlap", label: "Overlap", title: "The next chunk must agree with actions already in flight" },
  { id: "training", label: "Training", title: "The model practices delayed execution before deployment" },
  { id: "evidence", label: "Evidence", title: "The runtime savings show up without losing task performance" },
  { id: "limits", label: "Limits", title: "Training-time conditioning is cheaper, but less flexible" }
];

function TrainingTimeActionConditioningEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="Move the continuity constraint out of inference and into training."
        aside={
          <PullNote label="Mental model" tone="cool">
            The robot is already executing old actions while the VLA computes the next chunk. This paper trains the VLA
            to treat those already committed actions as the prefix of the new chunk.
          </PullNote>
        }
      >
        <RtcTermPrimer />
        <RtcTeachingFrame />
        <StepList
          items={[
            {
              title: "Chunking buys time",
              body: "Instead of predicting one motor command per controller tick, the VLA predicts a short sequence of future commands."
            },
            {
              title: "Asynchrony creates overlap",
              body: "The next chunk is generated while the previous chunk is still being executed, so some actions are already fixed."
            },
            {
              title: "Inference-time inpainting costs time",
              body: "Prior RTC enforces continuity by guiding the flow sampler during inference, which adds backpropagation work inside each denoising step."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="overlap"
        kicker="Timing contract"
        title="A delayed chunk starts with actions the robot has already committed to."
        aside={<RtcNotation />}
      >
        <ChunkOverlapDiagram />
        <ComparisonRows
          leftTitle="Inference-time RTC"
          rightTitle="Training-time RTC"
          rows={[
            {
              label: "Where continuity is enforced",
              left: "During sampling, by inpainting the new chunk to match overlapping actions.",
              right: "During training, by giving the model a real prefix and training it to fill the postfix."
            },
            {
              label: "Prefix",
              left: "Uses the committed prefix plus softly weighted extra overlap.",
              right: "Uses the hard prefix implied by the measured delay."
            },
            {
              label: "Runtime cost",
              left: "Adds a vector-Jacobian product during denoising.",
              right: "Uses the same runtime interface as RTC without that guidance step."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="training"
        kicker="Conditioning trick"
        title="The loss teaches the policy to denoise only the unknown postfix."
        aside={
          <PullNote label="Implementation" tone="warm">
            The paper describes this as a small code change: sample a delay, mark prefix actions as known, and mask the
            loss so only the future postfix is trained.
          </PullNote>
        }
      >
        <TrainingObjective />
        <ConditioningStrip />
        <PipelineFlow
          stages={[
            {
              label: "Sample delay",
              body: "Draw a delay d during training so the model sees the range of latencies expected at deployment."
            },
            {
              label: "Freeze prefix",
              body: "Feed the first d actions as clean ground-truth actions and set their flow timestep to 1."
            },
            {
              label: "Denoise postfix",
              body: "Keep the remaining actions noisy and compute flow-matching loss only on those unknown postfix tokens."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The method is mainly a latency result, not a new robot backbone."
        aside={<LatencyCard />}
      >
        <MetricDelta
          leftLabel="inference-time RTC"
          leftValue="135 ms"
          center="end-to-end latency on the reported remote H100 setup with five denoising steps"
          rightLabel="training-time RTC"
          rightValue="108 ms"
        />
        <ExperimentGrid />
        <ComparisonRows
          leftTitle="What the result supports"
          rightTitle="What it does not settle"
          rows={[
            {
              label: "Simulation",
              left: "On dynamic Kinetix, training-time RTC beats inference-time RTC once delay reaches two or more controller steps.",
              right: "At zero or one delay step, the paper reports very slightly worse simulated performance."
            },
            {
              label: "Real tasks",
              left: "On box building and espresso making with pi0.6, training-time RTC maintains performance and speed parity with inference-time RTC.",
              right: "The tasks are precise and challenging, but still a small real-world evaluation slice."
            },
            {
              label: "Compute",
              left: "Runtime no longer pays the inpainting overhead; the cost is moved into task fine-tuning.",
              right: "The delay distribution must be chosen before deployment, so unexpected latency regimes remain a design risk."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="The tradeoff is runtime simplicity for training-time commitment.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          Training-time action conditioning is best read as a practical drop-in replacement for inference-time
          inpainting when expected delays are known well enough to simulate during training.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function RtcTermPrimer() {
  const terms = [
    {
      term: "RTC",
      body: "Real-time chunking: generate a future action chunk asynchronously while the current chunk is being executed."
    },
    {
      term: "Action prefix",
      body: "The first few actions of the new chunk that are already fixed because they came from the previous chunk."
    },
    {
      term: "Inference delay",
      body: "The number of controller timesteps between starting model inference and receiving the new action chunk."
    },
    {
      term: "Inpainting",
      body: "A guided generation step that fills unknown actions while keeping known actions fixed."
    }
  ];

  return (
    <div className="term-primer" aria-label="RTC term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function RtcTeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A large VLA may need tens or hundreds of milliseconds to produce the next action chunk."
    },
    {
      label: "Assumption",
      body: "The robot can keep executing already planned actions while the next chunk is being generated."
    },
    {
      label: "Method",
      body: "Simulate that delay during training and condition the flow policy on the prefix it will later inherit."
    },
    {
      label: "Result",
      body: "The robot gets smooth chunk transitions without paying inpainting overhead during deployment."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="Training-time RTC teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function RtcNotation() {
  return (
    <div className="ttac-notation" aria-label="Real-time chunking notation">
      <div>
        <span>chunk</span>
        <strong>
          <MathInline>{"A_t=[a_t,\\ldots,a_{t+H-1}]"}</MathInline>
        </strong>
        <p>A future sequence of H low-level actions predicted together.</p>
      </div>
      <div>
        <span>delay rule</span>
        <strong>
          <MathInline>{"d\\le H-s"}</MathInline>
        </strong>
        <p>The delayed prefix must fit inside the overlap left after executing s timesteps.</p>
      </div>
    </div>
  );
}

function ChunkOverlapDiagram() {
  const cells = [
    { label: "past", kind: "muted" },
    { label: "exec", kind: "previous" },
    { label: "t", kind: "mark" },
    { label: "prefix", kind: "prefix" },
    { label: "t+d", kind: "mark" },
    { label: "postfix", kind: "postfix" },
    { label: "future", kind: "postfix" }
  ];

  return (
    <div className="ttac-timeline" aria-label="Overlapping action chunks">
      <div className="ttac-timeline-row">
        <span>previous chunk</span>
        {cells.map((cell, index) => (
          <i className={cell.kind} key={`previous-${index}`}>
            {cell.label}
          </i>
        ))}
      </div>
      <div className="ttac-timeline-row current">
        <span>current chunk</span>
        {cells.map((cell, index) => (
          <i className={index < 3 ? "muted" : cell.kind} key={`current-${index}`}>
            {index < 3 ? "" : cell.label}
          </i>
        ))}
      </div>
      <p>
        The red prefix is not a prediction problem at deployment time. It is already committed motion that the new
        chunk must continue from.
      </p>
    </div>
  );
}

function TrainingObjective() {
  return (
    <div className="ttac-objective" aria-label="Training objective">
      <span>conditional target</span>
      <strong>
        <MathInline>{"p(A_{t+d:t+H}\\mid o_t, A_{t:t+d})"}</MathInline>
      </strong>
      <p>
        This says: given the current observation <MathInline>{"o_t"}</MathInline> and the known prefix{" "}
        <MathInline>{"A_{t:t+d}"}</MathInline>, generate the remaining postfix actions{" "}
        <MathInline>{"A_{t+d:t+H}"}</MathInline>.
      </p>
    </div>
  );
}

function ConditioningStrip() {
  const tokens = [
    { label: "a0", detail: "tau=1", kind: "prefix" },
    { label: "a1", detail: "tau=1", kind: "prefix" },
    { label: "a2", detail: "tau=1", kind: "prefix" },
    { label: "a3", detail: "noise", kind: "postfix" },
    { label: "a4", detail: "noise", kind: "postfix" },
    { label: "a5", detail: "noise", kind: "postfix" }
  ];

  return (
    <div className="ttac-conditioning" aria-label="Prefix-conditioned flow matching">
      <div className="ttac-conditioning-head">
        <LabelPill>prefix: no loss</LabelPill>
        <LabelPill>postfix: flow loss</LabelPill>
      </div>
      <div className="ttac-token-strip">
        {tokens.map((token) => (
          <span className={token.kind} key={token.label}>
            <strong>{token.label}</strong>
            <em>{token.detail}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function ExperimentGrid() {
  const items = [
    {
      label: "sim benchmark",
      value: "2048",
      body: "Kinetix rollouts per data point, testing delays from 0 to 4 with H = 8."
    },
    {
      label: "real fine-tune",
      value: "8k",
      body: "gradient steps on box building and espresso making, batch size 512."
    },
    {
      label: "robot control",
      value: "50 Hz",
      body: "uniform training delays from 0 to 10 support up to 200 ms of latency."
    }
  ];

  return (
    <div className="ttac-experiment-grid" aria-label="Training-time RTC experiment details">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function LatencyCard() {
  return (
    <div className="ttac-latency" aria-label="Reported real-world latency">
      <div>
        <span>training-time RTC</span>
        <i style={{ "--latency": "80%" } as CSSProperties} />
        <strong>108 ms</strong>
      </div>
      <div>
        <span>inference-time RTC</span>
        <i style={{ "--latency": "100%" } as CSSProperties} />
        <strong>135 ms</strong>
      </div>
      <p>Both RTC variants improve speed over synchronous inference; the training-time version removes inpainting cost.</p>
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Hard prefix only",
      body: "Training-time RTC conditions on the committed prefix, but does not keep inference-time RTC's soft masking flexibility."
    },
    {
      label: "Delay distribution",
      body: "The training recipe must choose which delays to simulate, and real systems can shift outside that range."
    },
    {
      label: "Fine-tuning cost",
      body: "The runtime is cheaper because the model has already paid for prefix conditioning during task training."
    },
    {
      label: "Scope",
      body: "The real-world evidence is on two pi0.6 tasks, so broader morphology and environment coverage remains future work."
    }
  ];

  return (
    <div className="ttac-limits" aria-label="Training-time RTC limitations">
      {limits.map((limit, index) => (
        <div key={limit.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{limit.label}</strong>
          <p>{limit.body}</p>
        </div>
      ))}
    </div>
  );
}

export const trainingTimeActionConditioning: PaperModule = {
  meta,
  sections,
  VisualEssay: TrainingTimeActionConditioningEssay
};
