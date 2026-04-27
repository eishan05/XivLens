import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "real-time-chunking",
  title: "RTC: Real-Time Chunking",
  subtitle:
    "Real-time chunking lets a flow- or diffusion-based VLA keep moving while inference runs by freezing actions that must execute and inpainting the next action chunk around them.",
  abstract:
    "A mechanism-first read of RTC, the inference-time algorithm for smooth asynchronous execution of action chunking robot policies under high model latency.",
  authors: ["Kevin Black", "Manuel Y. Galliker", "Sergey Levine"],
  venue: "NeurIPS 2025 / arXiv 2506.07339v2",
  publishedAt: "Submitted Jun 9, 2025; revised Dec 5, 2025",
  sourceUrl: "https://arxiv.org/pdf/2506.07339",
  tags: ["robotics", "VLA", "real-time inference", "action chunking"],
  accent: "#2f7568",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "The world keeps moving while the model thinks" },
  { id: "boundary", label: "Boundary", title: "Naive chunk switching can create invalid motion" },
  { id: "inpainting", label: "Inpainting", title: "RTC makes the next chunk agree with the old one" },
  { id: "system", label: "System", title: "A background inference loop preserves the control deadline" },
  { id: "evidence", label: "Evidence", title: "The gains appear when delay changes the physics" },
  { id: "limits", label: "Limits", title: "RTC is a runtime fix with a precise scope" }
];

function RealTimeChunkingEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="A robot cannot pause physics while a billion-parameter policy finishes inference."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The paper is not mainly a new VLA architecture. It is a runtime algorithm: keep executing the current
            action chunk while generating the next one, then make the two chunks continuous before the switch.
          </PullNote>
        }
      >
        <RtcTermPrimer />
        <RtcTeachingFrame />
        <LatencyBudget />
        <StepList
          items={[
            {
              title: "The controller has a deadline",
              body: "At 50 Hz, the robot consumes one action every 20 ms. If a VLA takes longer than that, a purely synchronous policy cannot react every control step."
            },
            {
              title: "Chunking buys time",
              body: "The model predicts a sequence of future actions, so the robot can execute several commands while the next prediction is being computed."
            },
            {
              title: "Chunking alone is not enough",
              body: "Adjacent chunks may represent different sampled strategies. Switching between them while the robot is moving can create jerks, pauses, or unsafe accelerations."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="boundary"
        kicker="Failure mode"
        title="The dangerous moment is not prediction; it is the handoff between chunks."
        aside={
          <PullNote label="Mental model" tone="warm">
            A chunk is a plan segment. If the next segment starts from a different plan, averaging the two segments is
            not guaranteed to be a valid plan; it may be the invalid middle between two good motions.
          </PullNote>
        }
      >
        <BoundarySwitchDiagram />
        <ComparisonRows
          leftTitle="Baseline behavior"
          rightTitle="Why it breaks"
          rows={[
            {
              label: "Synchronous",
              left: "Execute part of a chunk, stop or pause for inference, then start the next chunk.",
              right: "Avoids mid-motion discontinuity, but the pauses are slow and not part of the training distribution."
            },
            {
              label: "Naive async",
              left: "Generate the next chunk in parallel and switch as soon as it arrives.",
              right: "The arriving chunk can disagree with the motion that already happened during inference."
            },
            {
              label: "Temporal ensemble",
              left: "Average action predictions from multiple chunks for the same timestep.",
              right: "When the policy distribution is multi-modal, the average of two valid strategies may be an invalid strategy."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="inpainting"
        kicker="Mechanism"
        title="RTC turns real-time execution into an action inpainting problem."
        aside={<InpaintingEquation />}
      >
        <RtcChunkDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Freeze",
              body: "The first d actions of the new chunk correspond to timesteps that pass while inference is running, so RTC ties them to the previous chunk."
            },
            {
              label: "Guide",
              body: "The overlapping future actions are softly pulled toward the old chunk with a weight that decays toward zero."
            },
            {
              label: "Generate",
              body: "The non-overlapping suffix is left free, so the policy can still use the latest observation and choose new motion."
            }
          ]}
        />
        <PullNote label="Plain English" tone="cool">
          Inpainting means filling in missing content while respecting known content. Here, the known content is the
          portion of the old action chunk that the robot is already committed to executing.
        </PullNote>
      </PaperSpread>

      <PaperSpread
        id="system"
        kicker="Runtime loop"
        title="The controller consumes actions while a background thread prepares the next chunk."
        aside={<RtcRuntimeNumbers />}
      >
        <AsyncLoop />
        <ComparisonRows
          leftTitle="Quantity"
          rightTitle="Role in RTC"
          rows={[
            {
              label: "H",
              left: "Prediction horizon: the number of future actions in one generated chunk.",
              right: "It sets the total runway available for overlap, delay, and fresh future motion."
            },
            {
              label: "s",
              left: "Execution horizon: how many actions are consumed before the system starts the next inference pass.",
              right: "Smaller s improves reactivity, but only if the chunk transition remains continuous."
            },
            {
              label: "d",
              left: "Inference delay: the number of controller timesteps that elapse while the model runs.",
              right: "RTC estimates d conservatively from recent delays, then freezes the actions that d makes unavoidable."
            },
            {
              label: "W",
              left: "Soft mask: a per-timestep weight over the overlap with the previous chunk.",
              right: "W is 1 for committed actions, decays through the overlap, and becomes 0 for fresh actions."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="RTC is tested where delay changes the control problem, not just the wall clock."
        aside={<RealWorldScorecard />}
      >
        <MetricDelta
          leftLabel="sim benchmark"
          leftValue="12"
          center="dynamic Kinetix tasks plus real bimanual robot evaluation under injected latency"
          rightLabel="robot episodes"
          rightValue="480"
        />
        <EvidenceGrid />
        <ComparisonRows
          leftTitle="What is measured"
          rightTitle="What the result supports"
          rows={[
            {
              label: "Kinetix",
              left: "Success rates across dynamic throwing, catching, balancing, and locomotion-like environments.",
              right: "RTC is more robust to simulated delay than naive async, temporal ensembling, hard masking, and BID in the reported benchmark."
            },
            {
              label: "Real tasks",
              left: "Throughput across light candle, plug ethernet, make bed, shirt folding, batch folding, and dishes in sink.",
              right: "RTC reaches the best average throughput at all tested delays, with statistically significant gains at +100 ms and +200 ms."
            },
            {
              label: "Precision",
              left: "Cumulative progress measured in controller steps, removing inference pause time from synchronous runs.",
              right: "RTC often progresses earlier in the episode, suggesting fewer errors and retries rather than only fewer pauses."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="RTC solves chunk continuity, not every real-time robotics problem.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          RTC is valuable because it changes the runtime contract of a large VLA: the model can think while the robot
          moves, without asking the robot to jump between incompatible action chunks.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function RtcTermPrimer() {
  const terms = [
    {
      term: "Action chunk",
      body: "A sequence of future robot commands predicted together, instead of one command at a time."
    },
    {
      term: "Prediction horizon",
      body: "The length H of the generated chunk: how far into the future the model predicts."
    },
    {
      term: "Execution horizon",
      body: "The number s of actions the robot consumes before the system starts preparing a replacement chunk."
    },
    {
      term: "Inference delay",
      body: "The number d of controller steps that pass between observing the world and receiving the model's new chunk."
    },
    {
      term: "Flow policy",
      body: "A policy that starts with noisy actions and repeatedly follows a learned vector field until the noise becomes a valid action chunk."
    },
    {
      term: "Inpainting",
      body: "Filling in unknown parts while respecting known parts; RTC applies this idea to action trajectories."
    }
  ];

  return (
    <div className="term-primer" aria-label="Key terms for real-time chunking">
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
      body: "Large VLAs can take longer than one robot control step, so waiting for every new action creates pauses or stale reactions."
    },
    {
      label: "Assumption",
      body: "The policy already predicts chunks, and its diffusion or flow generation process can be guided at inference time."
    },
    {
      label: "Method",
      body: "Run inference asynchronously, freeze the actions that delay makes unavoidable, and inpaint the rest of the new chunk with soft overlap guidance."
    },
    {
      label: "Result",
      body: "The robot gets smoother chunk transitions, better throughput, and stronger robustness to injected latency in the reported experiments."
    },
    {
      label: "Why it matters",
      body: "As robot policies get larger or move to remote inference, latency becomes a control problem, not only an engineering nuisance."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="RTC teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function LatencyBudget() {
  return (
    <div className="rtc-budget" aria-label="Latency budget sketch">
      <BudgetBlock label="controller step" value="20 ms" body="50 Hz control consumes actions faster than a large VLA can usually generate them." tone="blue" />
      <BudgetBlock label="pi0 prefill example" value="46 ms" body="The paper notes this cost before denoising for a 3B model on an RTX 4090." tone="accent" />
      <BudgetBlock label="real RTC setup" value="~6 steps" body="The real-robot baseline delay is around six 20 ms controller ticks before injected latency." tone="warm" />
    </div>
  );
}

function BudgetBlock({
  label,
  value,
  body,
  tone
}: {
  label: string;
  value: string;
  body: string;
  tone: "blue" | "accent" | "warm";
}) {
  return (
    <div className={`rtc-budget-block ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </div>
  );
}

function BoundarySwitchDiagram() {
  const rows = [
    {
      label: "old chunk",
      cells: ["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7"],
      kind: "old"
    },
    {
      label: "delay",
      cells: ["run", "run", "run", "infer", "infer", "infer", "infer", "arrive"],
      kind: "delay"
    },
    {
      label: "new chunk",
      cells: ["", "", "", "", "b4", "b5", "b6", "b7"],
      kind: "new"
    },
    {
      label: "bad switch",
      cells: ["old", "old", "old", "old", "jump", "new", "new", "new"],
      kind: "switch"
    }
  ];

  return (
    <div className="rtc-boundary" aria-label="Naive asynchronous chunk switch">
      {rows.map((row) => (
        <div className={`rtc-boundary-row ${row.kind}`} key={row.label}>
          <span>{row.label}</span>
          {row.cells.map((cell, index) => (
            <i className={cell ? "" : "empty"} key={`${row.label}-${index}`}>
              {cell}
            </i>
          ))}
        </div>
      ))}
      <p>
        The new chunk is computed from a later observation, but it was not forced to agree with the old trajectory
        during the timesteps that passed while inference ran.
      </p>
    </div>
  );
}

function InpaintingEquation() {
  return (
    <div className="rtc-equation" aria-label="RTC timing equation">
      <span>timing constraint</span>
      <strong>
        <MathInline>{"d = \\lfloor \\delta / \\Delta t \\rfloor,\\quad d \\le s \\le H-d"}</MathInline>
      </strong>
      <p>
        <MathInline>{"\\delta"}</MathInline> is model latency, <MathInline>{"\\Delta t"}</MathInline> is the controller
        period, <MathInline>{"d"}</MathInline> is delay in control steps, <MathInline>{"s"}</MathInline> is how many
        actions are executed per chunk, and <MathInline>{"H"}</MathInline> is chunk length. In plain English: the
        chunk must be long enough to cover both movement and thinking time.
      </p>
    </div>
  );
}

function RtcChunkDiagram() {
  const cells = [
    { label: "a0", kind: "frozen", weight: "1.0" },
    { label: "a1", kind: "frozen", weight: "1.0" },
    { label: "a2", kind: "frozen", weight: "1.0" },
    { label: "a3", kind: "frozen", weight: "1.0" },
    { label: "a4", kind: "guided", weight: "0.8" },
    { label: "a5", kind: "guided", weight: "0.5" },
    { label: "a6", kind: "guided", weight: "0.2" },
    { label: "z7", kind: "fresh", weight: "0" },
    { label: "z8", kind: "fresh", weight: "0" },
    { label: "z9", kind: "fresh", weight: "0" }
  ];

  return (
    <div className="rtc-chunk" aria-label="RTC chunk inpainting regions">
      <div className="rtc-chunk-axis">
        <span>inference starts</span>
        <span>chunk available</span>
        <span>fresh suffix</span>
      </div>
      <div className="rtc-chunk-cells">
        {cells.map((cell) => (
          <div className={`rtc-chunk-cell ${cell.kind}`} key={cell.label}>
            <strong>{cell.label}</strong>
            <span>W={cell.weight}</span>
          </div>
        ))}
      </div>
      <div className="rtc-chunk-legend">
        <LegendSwatch label="frozen prefix" kind="frozen" />
        <LegendSwatch label="soft overlap" kind="guided" />
        <LegendSwatch label="free generation" kind="fresh" />
      </div>
    </div>
  );
}

function LegendSwatch({ label, kind }: { label: string; kind: "frozen" | "guided" | "fresh" }) {
  return (
    <span className={`rtc-legend ${kind}`}>
      <i />
      {label}
    </span>
  );
}

function AsyncLoop() {
  const steps = [
    {
      label: "01",
      title: "Consume",
      body: "GETACTION returns the next action every controller tick and stores the latest observation."
    },
    {
      label: "02",
      title: "Wake",
      body: "A background inference loop wakes once enough actions have been consumed from the current chunk."
    },
    {
      label: "03",
      title: "Guide",
      body: "The flow denoising update receives a weighted overlap target from the remaining previous actions."
    },
    {
      label: "04",
      title: "Swap",
      body: "The shared current chunk is replaced as soon as guided inference finishes."
    }
  ];

  return (
    <div className="rtc-loop" aria-label="RTC asynchronous controller loop">
      {steps.map((step, index) => (
        <div className="rtc-loop-step" key={step.label}>
          <span>{step.label}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          {index < steps.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function RtcRuntimeNumbers() {
  return (
    <div className="rtc-runtime" aria-label="RTC runtime numbers">
      <RuntimeStat label="chunk horizon" value="50" body="actions in the real-world pi0.5 policy" />
      <RuntimeStat label="control period" value="20 ms" body="one action every 50 Hz controller step" />
      <RuntimeStat label="RTC model latency" value="97 ms" body="with five denoising steps in the reported setup" />
      <RuntimeStat label="delay stress" value="+200 ms" body="injected to simulate larger models or remote inference" />
    </div>
  );
}

function RuntimeStat({ label, value, body }: { label: string; value: string; body: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </div>
  );
}

function EvidenceGrid() {
  const items = [
    {
      label: "Kinetix",
      value: "2048",
      body: "rollouts per simulated data point, with delays from 0 to 4 controller steps"
    },
    {
      label: "Real tasks",
      value: "6",
      body: "bimanual tasks, including two mobile manipulation tasks"
    },
    {
      label: "Robot time",
      value: "28h",
      body: "pure execution time across all real-world trials"
    }
  ];

  return (
    <div className="rtc-evidence" aria-label="RTC evaluation coverage">
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

function RealWorldScorecard() {
  const tasks = [
    "light candle",
    "plug ethernet",
    "make bed",
    "shirt folding",
    "batch folding",
    "dishes in sink"
  ];

  return (
    <div className="rtc-tasks" aria-label="RTC real-world task list">
      <LabelPill>real-world suite</LabelPill>
      {tasks.map((task) => (
        <span key={task}>{task}</span>
      ))}
      <p>Each task and method is evaluated for 10 trials across +0 ms, +100 ms, and +200 ms injected delay.</p>
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Model class",
      body: "The method is designed for diffusion- or flow-based policies whose iterative generation can be guided."
    },
    {
      label: "Extra compute",
      body: "Guided inference adds overhead compared with sampling directly from the base policy."
    },
    {
      label: "Overlap budget",
      body: "The timing constraint depends on having enough chunk horizon left after accounting for inference delay."
    },
    {
      label: "Real-world scope",
      body: "The real-robot experiments cover bimanual manipulation; the paper notes that dynamic settings like legged locomotion remain future work."
    }
  ];

  return (
    <div className="rtc-limits" aria-label="RTC limitations">
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

export const realTimeChunking: PaperModule = {
  meta,
  sections,
  VisualEssay: RealTimeChunkingEssay
};
