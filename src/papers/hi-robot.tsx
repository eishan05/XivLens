import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "hi-robot",
  title: "Hi Robot",
  subtitle:
    "Open-ended instruction following with hierarchical vision-language-action models: a high-level VLM turns prompts and live feedback into atomic commands, then a low-level VLA executes them.",
  abstract:
    "A first-principles read of Hi Robot, the ICML 2025 system for open-ended instruction following with hierarchical vision-language-action models.",
  authors: [
    "Lucy Xiaoyang Shi",
    "Brian Ichter",
    "Michael Equi",
    "Liyiming Ke",
    "Karl Pertsch",
    "Quan Vuong",
    "James Tanner",
    "Anna Walling",
    "Haohuan Wang",
    "Niccolo Fusai",
    "Adrian Li-Bell",
    "Danny Driess",
    "Lachy Groom",
    "Sergey Levine",
    "Chelsea Finn"
  ],
  venue: "ICML 2025 / arXiv 2502.19417v2",
  publishedAt: "Submitted Feb 26, 2025; revised Jul 15, 2025",
  sourceUrl: "https://arxiv.org/pdf/2502.19417",
  tags: ["robotics", "VLA", "hierarchical control", "instruction following"],
  accent: "#536f95",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Open-ended prompts are not atomic robot commands" },
  { id: "hierarchy", label: "Hierarchy", title: "A high-level VLM chooses the next command" },
  { id: "interaction", label: "Interaction", title: "Feedback interrupts the plan and refreshes the command" },
  { id: "data", label: "Data", title: "Synthetic interactions teach the high-level policy what to say next" },
  { id: "evidence", label: "Evidence", title: "The gains show up in instruction accuracy and task progress" },
  { id: "limits", label: "Limits", title: "The hierarchy works, but the layers are still loosely coupled" }
];

function HiRobotEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="Hi Robot separates thinking about the task from physically doing the next step."
        aside={
          <PullNote label="Mental model" tone="cool">
            A flat policy hears the whole request at every moment. Hi Robot asks a slower reasoning model to translate
            that request into the next short command that a fast control policy can execute.
          </PullNote>
        }
      >
        <HiRobotTermPrimer />
        <HiRobotTeachingFrame />
        <StepList
          items={[
            {
              title: "The user gives a broad request",
              body: "The prompt may include goals, constraints, preferences, and later corrections, such as asking for a vegetarian sandwich and then rejecting an ingredient."
            },
            {
              title: "The robot must ground the request",
              body: "Grounding means connecting words to the current camera observations, robot state, and objects that are actually reachable."
            },
            {
              title: "The controller still needs simple actions",
              body: "The low-level policy is strongest when it receives short skill labels such as pick up one slice of bread or place bowl in bin."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="hierarchy"
        kicker="Architecture"
        title="The interface between reasoning and control is language."
        aside={<HierarchyEquations />}
      >
        <HierarchyDiagram />
        <ComparisonRows
          leftTitle="Flat VLA"
          rightTitle="Hi Robot"
          rows={[
            {
              label: "Prompt",
              left: "The full user request conditions action generation directly.",
              right: "A high-level VLM rewrites the request into the next atomic command."
            },
            {
              label: "Cadence",
              left: "The same model must reason and control on the control loop.",
              right: "High-level inference runs more slowly; low-level control keeps producing action chunks."
            },
            {
              label: "Strength",
              left: "Good at familiar atomic commands.",
              right: "Better at multi-stage requests, constraints, and mid-task feedback."
            },
            {
              label: "Tradeoff",
              left: "Simpler system boundary.",
              right: "More moving parts, with coordination between two policies."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="interaction"
        kicker="Runtime loop"
        title="The high-level policy reruns on a timer or when the user intervenes."
        aside={
          <PullNote label="Situated feedback" tone="warm">
            The phrase &quot;that is not trash&quot; only becomes useful because the high-level model also sees the
            current camera views. The correction is interpreted against the object in hand, not as free-floating text.
          </PullNote>
        }
      >
        <InteractionLoop />
        <PipelineFlow
          stages={[
            {
              label: "Observe",
              body: "Base and wrist cameras provide visual context while the robot state supplies joint and gripper information."
            },
            {
              label: "Interpret",
              body: "The high-level VLM reads the prompt, current images, and any new user interjection, then emits a command and optionally a verbal response."
            },
            {
              label: "Act",
              body: "The low-level pi0-style VLA uses the command, images, and state to produce continuous action chunks."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="data"
        kicker="Training signal"
        title="The high-level model is trained on imagined but visually grounded interactions."
        aside={<SyntheticDataNotes />}
      >
        <SyntheticDataDiagram />
        <StepList
          items={[
            {
              title: "Collect demonstrations",
              body: "Teleoperated episodes are annotated with coarse goals such as make a sandwich or clean the table."
            },
            {
              title: "Segment short skills",
              body: "Episodes are broken into one-to-three-second commands and basic movement primitives that the low-level policy can execute."
            },
            {
              title: "Generate prompts",
              body: "A large VLM receives the images and skill labels, then invents plausible user prompts, corrections, constraints, and robot utterances."
            },
            {
              title: "Train the high level",
              body: "The high-level policy learns next-token prediction over the command and optional response, while the low level learns action chunks with flow matching."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="Hierarchy improves both intent alignment and physical progress."
        aside={<EvaluationProtocol />}
      >
        <MetricDelta
          leftLabel="average IA"
          leftValue="76"
          center="Hi Robot averaged 76 instruction accuracy against 30 for GPT-4o high-level and 36 for flat VLA."
          rightLabel="average TP"
          rightValue="81"
        />
        <ResultsGrid />
        <ComparisonRows
          leftTitle="What the result supports"
          rightTitle="What it does not settle"
          rows={[
            {
              label: "Reasoning",
              left: "The high-level policy aligns commands with prompts, observations, and live user updates.",
              right: "It does not prove that two separate models are the final architecture; the paper names unified models as future work."
            },
            {
              label: "Control",
              left: "Expert human high-level guidance shows the low-level policy can execute many of the required skills.",
              right: "Dropped objects, out-of-distribution recovery, and proximal-object bias remain failure modes."
            },
            {
              label: "Generality",
              left: "The system is tested on table bussing, sandwich making, and grocery shopping across three robot platforms.",
              right: "The paper trains separate high-level policies per task for benchmarking, rather than one universal high-level model."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="The main open problem is making the hierarchy self-aware.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          Hi Robot is strongest as evidence for a system design: keep the controller grounded in practiced skills, and
          add a visually grounded reasoning layer that can translate messy human intent into those skills. The hard next
          step is closing the loop so each layer knows what the other layer can and cannot do.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function HiRobotTermPrimer() {
  const terms = [
    {
      term: "VLM",
      body: "A vision-language model: a language model that can also read images and answer in text."
    },
    {
      term: "VLA",
      body: "A vision-language-action model: a VLM adapted so its output controls a robot."
    },
    {
      term: "Atomic command",
      body: "A short instruction for a learned skill, such as pick up lettuce, rather than a full user goal."
    },
    {
      term: "Action chunk",
      body: "A short sequence of future motor commands predicted together, so control can stay smooth."
    }
  ];

  return (
    <div className="term-primer" aria-label="Hi Robot term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function HiRobotTeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A user request can be compositional, ambiguous, or revised while the robot is already acting."
    },
    {
      label: "Assumption",
      body: "Short robot skills are easier to execute than broad human goals, and language can connect the two levels."
    },
    {
      label: "Method",
      body: "Use a high-level VLM for situated reasoning and a low-level VLA for continuous robot control."
    },
    {
      label: "Result",
      body: "The robot can handle constraints, feedback, and task variants better than flat VLA or GPT-4o high-level baselines."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="Hi Robot teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function HierarchyDiagram() {
  return (
    <div className="hirobot-hierarchy" aria-label="Hi Robot hierarchical VLA diagram">
      <div className="hirobot-layer inputs">
        <span>inputs</span>
        <strong>images + prompt + state</strong>
        <p>Camera observations, user language, and robot configuration enter the system.</p>
      </div>
      <div className="hirobot-bridge">to</div>
      <div className="hirobot-layer reason">
        <span>system 2</span>
        <strong>high-level VLM</strong>
        <p>Reads the scene and prompt, then emits the next command and optional speech.</p>
      </div>
      <div className="hirobot-bridge">to</div>
      <div className="hirobot-layer act">
        <span>system 1</span>
        <strong>low-level VLA</strong>
        <p>Converts the command into continuous action chunks for the robot.</p>
      </div>
    </div>
  );
}

function HierarchyEquations() {
  return (
    <div className="hirobot-equations" aria-label="High-level and low-level policy equations">
      <div>
        <span>high level</span>
        <strong>
          <MathInline>{"p^{hi}(\\hat{\\ell}_t\\mid I_t^1,\\ldots,I_t^n,\\ell_t)"}</MathInline>
        </strong>
        <p>
          This says: given images and the user prompt, predict the intermediate language command{" "}
          <MathInline>{"\\hat{\\ell}_t"}</MathInline>.
        </p>
      </div>
      <div>
        <span>low level</span>
        <strong>
          <MathInline>{"p^{lo}(A_t\\mid I_t^1,\\ldots,I_t^n,\\hat{\\ell}_t,q_t)"}</MathInline>
        </strong>
        <p>
          This says: given images, that command, and robot state <MathInline>{"q_t"}</MathInline>, predict the future
          action chunk <MathInline>{"A_t"}</MathInline>.
        </p>
      </div>
    </div>
  );
}

function InteractionLoop() {
  const steps = [
    {
      label: "01",
      title: "User intent",
      body: "Open-ended request or correction"
    },
    {
      label: "02",
      title: "High-level refresh",
      body: "Every one second or immediately on feedback"
    },
    {
      label: "03",
      title: "Atomic command",
      body: "Skill label plus optional robot utterance"
    },
    {
      label: "04",
      title: "Action chunks",
      body: "Fast low-level motor execution"
    }
  ];

  return (
    <div className="hirobot-loop" aria-label="Interactive control loop">
      {steps.map((step, index) => (
        <div className="hirobot-loop-step" key={step.label}>
          <span>{step.label}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          {index < steps.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function SyntheticDataDiagram() {
  return (
    <div className="hirobot-data-map" aria-label="Synthetic data generation pipeline">
      <div className="hirobot-data-node demo">
        <span>D demo</span>
        <strong>teleoperated episodes</strong>
        <p>full task demonstrations with coarse goals</p>
      </div>
      <b>to</b>
      <div className="hirobot-data-node labels">
        <span>D labeled</span>
        <strong>short skill labels</strong>
        <p>one-to-three-second commands and movement primitives</p>
      </div>
      <b>to</b>
      <div className="hirobot-data-node synthetic">
        <span>D syn</span>
        <strong>imagined interactions</strong>
        <p>grounded prompts, interjections, constraints, and responses</p>
      </div>
    </div>
  );
}

function SyntheticDataNotes() {
  const chips = [
    "negative task",
    "situated correction",
    "specific constraint",
    "confirmation",
    "clarification",
    "error handling"
  ];

  return (
    <div className="hirobot-synthetic-notes" aria-label="Synthetic interaction types">
      <p>
        The generator is prompted to cover scenario types and response types, so training examples include not just
        direct requests, but also constraints like dietary preferences and corrections based on the current scene.
      </p>
      <div>
        {chips.map((chip) => (
          <LabelPill key={chip}>{chip}</LabelPill>
        ))}
      </div>
    </div>
  );
}

function EvaluationProtocol() {
  return (
    <div className="hirobot-protocol" aria-label="Evaluation protocol">
      <div>
        <span>trials</span>
        <strong>20</strong>
        <p>per task per method</p>
      </div>
      <div>
        <span>metric 1</span>
        <strong>IA</strong>
        <p>instruction accuracy: whether behavior matches user intent and the current observation</p>
      </div>
      <div>
        <span>metric 2</span>
        <strong>TP</strong>
        <p>task progress: how many intended objects reach the correct location or configuration</p>
      </div>
    </div>
  );
}

const resultRows = [
  {
    task: "Table bussing",
    instruction: { flat: 36, gpt: 35, hi: 74, human: 100 },
    progress: { flat: 61, gpt: 63, hi: 77, human: 82 }
  },
  {
    task: "Sandwich making",
    instruction: { flat: 34, gpt: 13, hi: 83, human: 100 },
    progress: { flat: 42, gpt: 56, hi: 80, human: 92 }
  },
  {
    task: "Grocery shopping",
    instruction: { flat: 39, gpt: 41, hi: 72, human: 100 },
    progress: { flat: 28, gpt: 72, hi: 85, human: 93 }
  }
];

function ResultsGrid() {
  return (
    <div className="hirobot-results" aria-label="Hi Robot task results">
      <div className="hirobot-results-header">
        <span>task</span>
        <span>instruction accuracy</span>
        <span>task progress</span>
      </div>
      {resultRows.map((row) => (
        <div className="hirobot-results-row" key={row.task}>
          <strong>{row.task}</strong>
          <ScoreCluster values={row.instruction} />
          <ScoreCluster values={row.progress} />
        </div>
      ))}
    </div>
  );
}

function ScoreCluster({ values }: { values: { flat: number; gpt: number; hi: number; human: number } }) {
  return (
    <div className="hirobot-score-cluster">
      <ScoreBar label="flat" score={values.flat} tone="muted" />
      <ScoreBar label="gpt" score={values.gpt} tone="warm" />
      <ScoreBar label="hi" score={values.hi} tone="accent" />
      <ScoreBar label="human" score={values.human} tone="cool" />
    </div>
  );
}

function ScoreBar({
  label,
  score,
  tone
}: {
  label: string;
  score: number;
  tone: "muted" | "warm" | "accent" | "cool";
}) {
  return (
    <div className={`hirobot-score ${tone}`} style={{ "--score": `${score}%` } as CSSProperties}>
      <span>{label}</span>
      <i />
      <em>{score}</em>
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Prompt engineering",
      body: "The high-level training data depends on generated examples shaped by task descriptions and prompt choices."
    },
    {
      label: "Layer mismatch",
      body: "The high-level and low-level policies are trained separately, so the high level does not directly know when the low level is struggling."
    },
    {
      label: "Memory",
      body: "The appendix reports difficulty with instructions that require long-context reasoning because the current system lacks memory."
    },
    {
      label: "Recovery",
      body: "Low-level failures include dropped objects, out-of-distribution states, and occasional bias toward nearby objects."
    }
  ];

  return (
    <div className="hirobot-limits" aria-label="Hi Robot limitations">
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

export const hiRobot: PaperModule = {
  meta,
  sections,
  VisualEssay: HiRobotEssay
};
