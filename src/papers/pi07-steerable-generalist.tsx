import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pi07-steerable-generalist",
  title: "π0.7: Steerable Generalist Robot Model",
  subtitle:
    "Physical Intelligence trains one VLA to use richer context - language, episode metadata, control labels, and generated subgoal images - so diverse robot data becomes steerable instead of noisy.",
  abstract:
    "A mechanism-first read of π0.7, the 5B-parameter robotic foundation model that uses diverse context conditioning to improve out-of-the-box dexterity, language following, cross-embodiment transfer, and compositional task generalization.",
  authors: [
    "Physical Intelligence",
    "Bo Ai",
    "Ali Amin",
    "Raichelle Aniceto",
    "Ashwin Balakrishna",
    "Kevin Black",
    "Chelsea Finn",
    "Sergey Levine",
    "Karl Pertsch",
    "Allen Z. Ren",
    "Ury Zhilinsky",
    "et al."
  ],
  venue: "arXiv 2604.15483",
  publishedAt: "Submitted Apr 16, 2026",
  sourceUrl: "https://www.pi.website/download/pi07.pdf",
  tags: ["robotics", "VLA", "steerability", "generalization"],
  accent: "#2f7d73",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Diverse robot data creates ambiguity, not just scale" },
  { id: "context", label: "Context", title: "The prompt specifies the task, strategy, and target state" },
  { id: "architecture", label: "Architecture", title: "A 5B VLA keeps the π0 control recipe and widens the prompt" },
  { id: "data", label: "Data", title: "Metadata lets mixed-quality episodes become useful supervision" },
  { id: "evidence", label: "Evidence", title: "The experiments test dexterity, language, embodiment, and coaching" },
  { id: "limits", label: "Limits", title: "The model generalizes broadly, but the boundary is still visible" }
];

function Pi07Essay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="π0.7 turns messy data into a controllable training signal."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The central move is not a brand-new controller. It is a richer context interface: tell the same policy what
            was done, how well it was done, and what the near future should look like.
          </PullNote>
        }
      >
        <Pi07TermPrimer />
        <Pi07TeachingFrame />
        <StepList
          items={[
            {
              title: "A bigger robot dataset is not automatically better",
              body: "Different robots, operators, policies, failures, and speeds can teach contradictory strategies for what looks like the same command."
            },
            {
              title: "The missing variable is behavior mode",
              body: "A short command such as fold the shirt does not say whether an episode was fast, slow, clean, failed, or using a different control interface."
            },
            {
              title: "π0.7 makes that mode explicit",
              body: "The model receives additional context, so it can learn from many behavior modes while still being steered toward the high-quality one at test time."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="context"
        kicker="Prompt design"
        title="The context says what to do and how the behavior should be shaped."
        aside={<ContextObjective />}
      >
        <ContextBoard />
        <ComparisonRows
          leftTitle="Conventional VLA"
          rightTitle="π0.7 context"
          rows={[
            {
              label: "Task signal",
              left: "A language instruction is the main prompt, such as clean the kitchen.",
              right: "The prompt can include the overall task plus a changing semantic subtask, such as open the fridge door."
            },
            {
              label: "Strategy signal",
              left: "Fast, slow, successful, and failed episodes can look like conflicting labels.",
              right: "Episode metadata marks speed, quality, and mistake segments so the policy can separate behavior modes."
            },
            {
              label: "Spatial signal",
              left: "Language must carry details such as grasp location and desired object layout.",
              right: "Generated subgoal images show the desired near-future scene across camera views."
            },
            {
              label: "Deployment",
              left: "The test prompt usually matches the training prompt format.",
              right: "Prompt parts are randomly dropped during training, so the model can run with any subset at test time."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="architecture"
        kicker="System shape"
        title="The low-level policy stays flow-based; the surrounding context becomes richer."
        aside={<ArchitectureStats />}
      >
        <ArchitectureDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Plan text",
              body: "A high-level semantic policy, or a person, proposes the next subtask instruction for long-horizon behavior."
            },
            {
              label: "Imagine target",
              body: "A lightweight world model generates visual subgoal images from the current observation, subtask, and metadata."
            },
            {
              label: "Act",
              body: "The π0.7 VLA consumes observation memory and context, then its action expert produces a continuous action chunk."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Component"
          rightTitle="Role in π0.7"
          rows={[
            {
              label: "VLM backbone",
              left: "Gemma3 4B VLM with a 400M vision encoder.",
              right: "Carries image-language semantics and receives stable supervision through FAST-token knowledge insulation."
            },
            {
              label: "Memory encoder",
              left: "MEM-style video history compression.",
              right: "Keeps a fixed-size representation of recent multi-view observations."
            },
            {
              label: "Action expert",
              left: "860M flow-matching transformer expert.",
              right: "Predicts continuous robot action chunks while attending to the VLM activations."
            },
            {
              label: "Context producers",
              left: "High-level policy and BAGEL-initialized world model.",
              right: "Produce semantic subtask text and subgoal images that steer the same low-level model."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="data"
        kicker="Training mixture"
        title="Metadata is the label that makes weak and strong behavior coexist."
        aside={
          <PullNote label="Why it matters" tone="warm">
            If two episodes have the same command but one succeeds cleanly and the other fails, a plain imitation
            learner can average them. π0.7 gives the model enough context to learn both and request the better mode.
          </PullNote>
        }
      >
        <DataMixture />
        <MetricDelta
          leftLabel="quality"
          leftValue="1-5"
          center="episode metadata marks performance mode, while speed is discretized into 500-step bins"
          rightLabel="CFG"
          rightValue="1.3-2.2"
        />
        <ComparisonRows
          leftTitle="Without context labels"
          rightTitle="With π0.7 context labels"
          rows={[
            {
              label: "Failures",
              left: "A failed grasp can become a bad action target for the same command.",
              right: "Mistake labels identify bad segments instead of letting them silently define the task."
            },
            {
              label: "Autonomous data",
              left: "Rollouts from earlier policies vary widely in quality and can dilute demonstrations.",
              right: "Evaluation episodes can be distilled back into the model when speed and quality metadata identify the useful behavior."
            },
            {
              label: "Human and web data",
              left: "Non-robot videos do not directly provide robot actions.",
              right: "They still help the world model and subgoal images carry semantic and physical concepts into the VLA prompt."
            },
            {
              label: "Scaling",
              left: "More mixed-quality data can hurt if the policy cannot distinguish modes.",
              right: "The paper reports that metadata lets performance keep improving as lower-quality data is added."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The paper argues from breadth, not one isolated benchmark win."
        aside={<EvidenceNumbers />}
      >
        <EvidenceGrid />
        <ComparisonRows
          leftTitle="Claim tested"
          rightTitle="What the experiments support"
          rows={[
            {
              label: "Out of the box",
              left: "Can one model perform dexterous tasks without task-specific post-training?",
              right: "π0.7 matches specialist-level performance on reported laundry, espresso, and box-building tasks, with stronger throughput in some cases."
            },
            {
              label: "Instruction following",
              left: "Can the model respond to richer language in messy, underspecified scenes?",
              right: "The paper evaluates open-ended language, referential commands, and coached appliance tasks such as air fryer and toaster workflows."
            },
            {
              label: "Embodiment transfer",
              left: "Can a skill transfer to a robot that did not collect that task?",
              right: "On UR5e shirt folding, π0.7 reaches 85.6% task progress and 80% success, close to expert teleoperators at 90.9% and 80.6%."
            },
            {
              label: "New tasks",
              left: "Can language coaching create autonomous behavior without low-level teleoperation data?",
              right: "Coaching episodes are used to train high-level policies that prompt π0.7 for five unseen long-horizon tasks."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="Steerable generalization is real progress, but not solved autonomy.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          π0.7 is best read as evidence that context is a scaling interface for robotics: richer prompts make larger,
          messier datasets trainable, and those datasets make composition across skills more practical.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function Pi07TermPrimer() {
  const terms = [
    {
      term: "Steerable",
      body: "The model can be pushed toward a behavior mode, such as faster or higher-quality execution, through prompt context."
    },
    {
      term: "Context",
      body: "The non-action information given to the policy: language, recent observations, metadata, control labels, and subgoal images."
    },
    {
      term: "Mixed-quality data",
      body: "Training data that includes expert demonstrations, suboptimal autonomous rollouts, failures, human videos, and web data."
    },
    {
      term: "Compositional generalization",
      body: "Using learned parts of behavior in new combinations, such as applying appliance and manipulation skills to a new kitchen task."
    }
  ];

  return (
    <div className="term-primer" aria-label="π0.7 term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function Pi07TeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A generalist robot needs broad data, but broad data contains incompatible strategies and uneven quality."
    },
    {
      label: "Assumption",
      body: "A VLA can learn from a messy episode if the prompt explains the episode's intent, quality, and desired intermediate state."
    },
    {
      label: "Method",
      body: "Train with diverse context conditioning, then optionally provide the desired context at test time."
    },
    {
      label: "Result",
      body: "One model shows strong out-of-the-box dexterity, language following, cross-embodiment transfer, and coached task learning."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="π0.7 teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function ContextObjective() {
  return (
    <div className="pi07-equation" aria-label="π0.7 context-conditioned objective">
      <span>context-conditioned policy</span>
      <strong>
        <MathInline>{"\\max_\\theta\\;\\mathbb{E}_{D}[\\log\\pi_\\theta(a_{t:t+H}\\mid o_{t-T:t}, C_t)]"}</MathInline>
      </strong>
      <p>
        Here <MathInline>{"o_{t-T:t}"}</MathInline> is recent observation history, <MathInline>{"C_t"}</MathInline> is
        the prompt context, and <MathInline>{"a_{t:t+H}"}</MathInline> is the future action chunk. In plain English:
        learn the action that fits the world and the requested behavior mode.
      </p>
    </div>
  );
}

function ContextBoard() {
  const items = [
    { label: "task", title: "overall instruction", body: "clean up the kitchen", tone: "language" },
    { label: "subtask", title: "next semantic step", body: "open the fridge door", tone: "language" },
    { label: "metadata", title: "speed, quality, mistakes", body: "ask for the high-quality mode", tone: "metadata" },
    { label: "subgoal", title: "near-future images", body: "show object and gripper layout", tone: "subgoal" },
    { label: "control", title: "modality labels", body: "joint or end-effector control", tone: "control" }
  ];

  return (
    <div className="pi07-context-board" aria-label="π0.7 prompt context board">
      <div className="pi07-context-head">
        <LabelPill>prompt context</LabelPill>
        <strong>what + how + target state</strong>
      </div>
      <div className="pi07-context-grid">
        {items.map((item) => (
          <div className={`pi07-context-card ${item.tone}`} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>
      <div className="pi07-context-footer">
        <span>random dropout during training</span>
        <i aria-hidden="true" />
        <span>flexible subsets at inference</span>
      </div>
    </div>
  );
}

function ArchitectureStats() {
  return (
    <div className="pi07-stats" aria-label="π0.7 model statistics">
      <StatBlock label="total VLA" value="5B" body="4B VLM backbone plus memory and action expert components" />
      <StatBlock label="vision encoder" value="400M" body="Gemma3-initialized encoder with MEM-style history compression" />
      <StatBlock label="action expert" value="860M" body="flow-matching expert for continuous robot action chunks" />
      <StatBlock label="world model" value="14B" body="BAGEL-initialized image model used to generate subgoal images" />
    </div>
  );
}

function StatBlock({ label, value, body }: { label: string; value: string; body: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="pi07-architecture" aria-label="π0.7 architecture and runtime context">
      <div className="pi07-runtime-stack">
        <RuntimeNode tone="language" label="high-level policy" title="semantic subtask" body="language command for the next step" />
        <RuntimeNode tone="subgoal" label="world model" title="visual subgoal" body="generated near-future camera views" />
      </div>
      <div className="pi07-core">
        <span>π0.7 VLA</span>
        <strong>Gemma3 VLM + MEM history + action expert</strong>
        <div className="pi07-token-lane" aria-label="π0.7 token lane">
          {["obs", "memory", "task", "meta", "goal", "action"].map((token, index) => (
            <i className={index < 2 ? "sensor" : index < 5 ? "context" : "action"} key={token}>
              {token}
            </i>
          ))}
        </div>
        <p>FAST-token knowledge insulation stabilizes the VLM backbone while the action expert learns continuous control.</p>
      </div>
      <div className="pi07-output">
        <span>robot output</span>
        <strong>action chunk</strong>
        <p>parallel-jaw manipulation at 50 Hz on most robots and 20 Hz on the UR5e setup</p>
      </div>
    </div>
  );
}

function RuntimeNode({
  tone,
  label,
  title,
  body
}: {
  tone: "language" | "subgoal";
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`pi07-runtime-node ${tone}`}>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function DataMixture() {
  const items = [
    {
      label: "demonstrations",
      title: "human robot episodes",
      body: "high-quality skills, but still with varied strategies",
      tone: "robot"
    },
    {
      label: "autonomous",
      title: "policy rollouts",
      body: "evaluation data, specialist rollouts, suboptimal attempts, and failures",
      tone: "metadata"
    },
    {
      label: "non-robot",
      title: "human and web data",
      body: "egocentric videos, web image-language data, and video sources for semantic transfer",
      tone: "subgoal"
    },
    {
      label: "embodiments",
      title: "many robot platforms",
      body: "mobile bimanual robots, static bimanual robots, single arms, and UR5e transfer tests",
      tone: "control"
    }
  ];

  return (
    <div className="pi07-data-map" aria-label="π0.7 data mixture">
      {items.map((item) => (
        <div className={`pi07-data-card ${item.tone}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceNumbers() {
  return (
    <div className="pi07-evidence-numbers" aria-label="π0.7 evidence numbers">
      <StatBlock label="UR5e folding" value="80%" body="reported success rate for π0.7 zero-shot transfer" />
      <StatBlock label="expert operators" value="80.6%" body="human zero-shot success on the same UR5e folding setup" />
      <StatBlock label="unseen tasks" value="60-80%" body="discussion range for zero-shot generalization success rates" />
    </div>
  );
}

function EvidenceGrid() {
  const items = [
    {
      label: "dexterity",
      title: "specialist-level tasks",
      body: "laundry folding, espresso making, box building, trash removal, vegetable peeling, and other long-horizon skills"
    },
    {
      label: "memory",
      title: "explicit history tasks",
      body: "swap mugs, find object, scoop coffee, and window cleaning are compared against memory-specialized policies"
    },
    {
      label: "language",
      title: "coached appliances",
      body: "loading an air fryer, unloading an air fryer, and toasting a bagel are handled through step-by-step language"
    },
    {
      label: "transfer",
      title: "new robot morphology",
      body: "shirt folding transfers to a heavier bimanual UR5e setup that needs a distinct strategy"
    }
  ];

  return (
    <div className="pi07-evidence-grid" aria-label="π0.7 evaluation coverage">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Zero-shot gap",
      body: "The discussion says seen tasks often exceed 90% success, while unseen tasks or unseen task-robot combinations are lower, around 60-80%."
    },
    {
      label: "Novelty boundary",
      body: "With very large mixed datasets, it is hard to prove whether a task is truly unseen or a new combination of related seen behaviors."
    },
    {
      label: "Long tasks still need help",
      body: "The paper notes that simply prompting unseen multi-stage appliance tasks is not enough; coaching and high-level prompting matter."
    },
    {
      label: "Context quality",
      body: "Subgoal images, metadata, and high-level commands become new sources of error if the upstream model or labels are wrong."
    }
  ];

  return (
    <div className="pi07-limits" aria-label="π0.7 limitations">
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

export const pi07SteerableGeneralist: PaperModule = {
  meta,
  sections,
  VisualEssay: Pi07Essay
};
