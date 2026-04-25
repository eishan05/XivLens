import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pi0-vla-flow",
  title: "π0: VLA Flow Model",
  subtitle: "A pretrained VLM becomes a robot policy by adding an action expert and flow-matched action chunks.",
  abstract:
    "Architecture-first notes on how π0 couples a PaliGemma-style vision-language backbone with a robot action expert for continuous dexterous control.",
  authors: ["Physical Intelligence"],
  venue: "arXiv 2410.24164",
  publishedAt: "Oct 31, 2024",
  sourceUrl: "https://www.pi.website/download/pi0.pdf",
  tags: ["robotics", "VLA", "flow matching", "architecture"],
  accent: "#6b6f2c",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "overview", label: "Overview", title: "A VLM with a motor system attached" },
  { id: "tokens", label: "Tokens", title: "Observations and actions enter as different streams" },
  { id: "experts", label: "Experts", title: "The backbone keeps semantics; the expert learns control" },
  { id: "mask", label: "Mask", title: "Attention defines the architectural contract" },
  { id: "flow", label: "Flow", title: "Actions are generated as a denoising trajectory" },
  { id: "inference", label: "Inference", title: "Cache the observation, iterate the action suffix" }
];

function Pi0Essay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="overview"
        kicker="Architecture lens"
        title="π0 is not just a VLM with action tokens."
        aside={
          <PullNote label="Main design move" tone="cool">
            One transformer sequence uses two routed weight sets: PaliGemma for image-language tokens, and a
            smaller action expert for robot state and noisy action tokens.
          </PullNote>
        }
      >
        <Pi0ArchitectureDiagram />
      </PaperSpread>

      <PaperSpread
        id="tokens"
        kicker="Input contract"
        title="Each control step becomes one observation prefix plus one action chunk."
        aside={
          <PullNote label="Action chunking" tone="warm">
            The paper uses <MathInline>{"H = 50"}</MathInline> action tokens per chunk, letting the model run
            slower than the low-level control loop.
          </PullNote>
        }
      >
        <TokenRouteDiagram />
        <StepList
          items={[
            {
              title: "Observe",
              body: "Images, language, and proprioceptive robot state form the conditioning context."
            },
            {
              title: "Corrupt actions",
              body: "During training, the future action chunk is mixed with Gaussian noise at flow timestep τ."
            },
            {
              title: "Predict vector field",
              body: "The action expert returns the direction that moves noisy actions toward executable actions."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="experts"
        kicker="Mixture of roles"
        title="Two parameter sets share one sequence."
        aside={<ParameterStack />}
      >
        <ComparisonRows
          leftTitle="VLM backbone"
          rightTitle="Action expert"
          rows={[
            {
              label: "Initialization",
              left: "PaliGemma weights",
              right: "trained from scratch"
            },
            {
              label: "Handles",
              left: "image and language tokens",
              right: "robot state, noisy actions, flow timestep"
            },
            {
              label: "Job",
              left: "semantic grounding and instruction understanding",
              right: "continuous control distribution"
            },
            {
              label: "Scale",
              left: "about 3B parameters",
              right: "about 300M parameters"
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="mask"
        kicker="Attention contract"
        title="The mask lets action tokens see the task, then coordinate with each other."
      >
        <AttentionMaskDiagram />
        <PullNote label="Why this matters" tone="cool">
          The architecture is closer to a decoder-only expert mixture than a classic encoder-decoder policy:
          observation tokens are cached, while action tokens are recomputed during flow integration.
        </PullNote>
      </PaperSpread>

      <PaperSpread
        id="flow"
        kicker="Action generation"
        title="Control is a short flow-matching solve, not one autoregressive token."
        aside={<FlowLoopDiagram />}
      >
        <PipelineFlow
          stages={[
            {
              label: "Start noisy",
              body: "Sample a random action chunk at τ = 0."
            },
            {
              label: "Integrate",
              body: "Run Euler steps through the action expert, conditioned on the cached observation prefix."
            },
            {
              label: "Execute",
              body: "Use the final denoised chunk as continuous robot commands."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="inference" kicker="Runtime shape" title="The expensive context pass happens once per chunk.">
        <MetricDelta
          leftLabel="model size"
          leftValue="3.3B"
          center="VLM backbone plus action expert"
          rightLabel="flow steps"
          rightValue="10"
        />
        <InferenceTimeline />
        <ComparisonRows
          leftTitle="Observation prefix"
          rightTitle="Action suffix"
          rows={[
            {
              label: "When computed",
              left: "once per new action chunk",
              right: "once per flow integration step"
            },
            {
              label: "Caching",
              left: "keys and values are reused",
              right: "tokens are updated each denoising step"
            },
            {
              label: "Paper timing",
              left: "image encoders plus observation pass dominate setup",
              right: "10 action passes add the flow solve"
            }
          ]}
        />
      </PaperSpread>
    </PaperShell>
  );
}

function Pi0ArchitectureDiagram() {
  return (
    <div className="pi0-architecture" aria-label="π0 architecture overview">
      <div className="pi0-inputs">
        <ArchitectureBlock label="images" value="camera views" tone="vision" />
        <ArchitectureBlock label="language" value="task prompt" tone="language" />
        <ArchitectureBlock label="state" value="robot joints" tone="action" />
        <ArchitectureBlock label="actions" value="noisy chunk" tone="action" />
      </div>
      <div className="pi0-arrows" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="pi0-core">
        <div>
          <LabelPill>pretrained</LabelPill>
          <strong>VLM backbone</strong>
          <p>PaliGemma-derived weights for the image and language prefix.</p>
        </div>
        <div>
          <LabelPill>new expert</LabelPill>
          <strong>Action expert</strong>
          <p>Separate transformer weights for state and noisy action tokens.</p>
        </div>
      </div>
      <div className="pi0-head">
        <span>vector field</span>
        <strong>
          <MathInline ariaLabel="v theta of A tau and o">{"v_{\\theta}(A_{\\tau}, o)"}</MathInline>
        </strong>
        <p>Direction for denoising continuous actions.</p>
      </div>
    </div>
  );
}

function ArchitectureBlock({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "vision" | "language" | "action";
}) {
  return (
    <div className={`architecture-block ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TokenRouteDiagram() {
  const tokens = [
    { id: "i1", label: "I1", tone: "vision" },
    { id: "i2", label: "I2", tone: "vision" },
    { id: "text", label: "text", tone: "language" },
    { id: "qt", label: <MathInline>{"q_t"}</MathInline>, tone: "action" },
    { id: "a0", label: <MathInline>{"a_t^{\\tau}"}</MathInline>, tone: "action" },
    { id: "a1", label: <MathInline>{"a_{t+1}^{\\tau}"}</MathInline>, tone: "action" },
    { id: "a2", label: <MathInline>{"a_{t+2}^{\\tau}"}</MathInline>, tone: "action" },
    { id: "dots", label: "...", tone: "action" },
    { id: "a49", label: <MathInline>{"a_{t+49}^{\\tau}"}</MathInline>, tone: "action" }
  ];

  return (
    <div className="pi0-token-route" aria-label="Token routing into π0">
      {tokens.map((token) => (
        <span className={token.tone} key={token.id}>
          {token.label}
        </span>
      ))}
      <em>
        <MathInline>{"\\tau"}</MathInline> is fused into each noisy action embedding, not added as its own token.
      </em>
    </div>
  );
}

function ParameterStack() {
  return (
    <div className="pi0-parameter-stack" aria-label="Parameter split">
      <div>
        <span>3B</span>
        <strong>VLM</strong>
        <p>semantic backbone</p>
      </div>
      <div>
        <span>300M</span>
        <strong>expert</strong>
        <p>motor control</p>
      </div>
    </div>
  );
}

function AttentionMaskDiagram() {
  const labels = ["img", "lang", "state", "act"];
  const cells = [
    ["on", "on", "off", "off"],
    ["on", "on", "off", "off"],
    ["on", "on", "on", "off"],
    ["on", "on", "on", "on"]
  ];

  return (
    <div className="pi0-mask" aria-label="Attention mask sketch">
      <span />
      {labels.map((label) => (
        <b key={`col-${label}`}>{label}</b>
      ))}
      {labels.map((row, rowIndex) => [
        <b key={`row-${row}`}>{row}</b>,
        ...cells[rowIndex].map((state, colIndex) => (
          <i className={state} key={`${row}-${labels[colIndex]}`} />
        ))
      ])}
    </div>
  );
}

function FlowLoopDiagram() {
  return (
    <div className="pi0-flow-loop" aria-label="Flow matching inference loop">
      <div>
        <span>
          <MathInline>{"\\tau = 0"}</MathInline>
        </span>
        <strong>noise</strong>
      </div>
      <i />
      <div>
        <span>x10</span>
        <strong>expert pass</strong>
      </div>
      <i />
      <div>
        <span>
          <MathInline>{"\\tau = 1"}</MathInline>
        </span>
        <strong>action chunk</strong>
      </div>
    </div>
  );
}

function InferenceTimeline() {
  return (
    <div className="pi0-inference" aria-label="Inference timing from the paper">
      <span style={{ "--w": "14" } as CSSProperties}>image encoders 14 ms</span>
      <span style={{ "--w": "32" } as CSSProperties}>observation pass 32 ms</span>
      <span style={{ "--w": "27" } as CSSProperties}>10 action passes 27 ms</span>
      <span style={{ "--w": "13" } as CSSProperties}>off-board network 13 ms</span>
    </div>
  );
}

export const pi0VlaFlow: PaperModule = {
  meta,
  sections,
  VisualEssay: Pi0Essay
};
