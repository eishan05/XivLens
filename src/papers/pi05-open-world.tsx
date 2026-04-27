import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pi05-open-world",
  title: "π0.5: Open-World Generalization",
  subtitle:
    "Physical Intelligence turns π0 into an open-world mobile manipulation system by co-training one VLA on robot actions, semantic subtasks, verbal guidance, and web vision-language data.",
  abstract:
    "A mechanism-first read of π0.5, the VLA training recipe for cleaning kitchens and bedrooms in homes that were not in the training data.",
  authors: [
    "Physical Intelligence",
    "Kevin Black",
    "Noah Brown",
    "James Darpinian",
    "Karan Dhabalia",
    "Danny Driess",
    "Adnan Esmail",
    "Michael Equi",
    "Chelsea Finn",
    "Niccolo Fusai",
    "Manuel Y. Galliker",
    "Dibya Ghosh",
    "Lachy Groom",
    "Karol Hausman",
    "Brian Ichter",
    "Szymon Jakubczak",
    "Tim Jones",
    "Liyiming Ke",
    "Devin LeBlanc",
    "Sergey Levine",
    "Adrian Li-Bell",
    "Mohith Mothukuri",
    "Suraj Nair",
    "Karl Pertsch",
    "Allen Z. Ren",
    "Lucy Xiaoyang Shi",
    "Laura Smith",
    "Jost Tobias Springenberg",
    "Kyle Stachowicz",
    "James Tanner",
    "Quan Vuong",
    "Homer Walke",
    "Anna Walling",
    "Haohuan Wang",
    "Lili Yu",
    "Ury Zhilinsky"
  ],
  venue: "arXiv 2504.16054",
  publishedAt: "Submitted Apr 22, 2025",
  sourceUrl: "https://www.pi.website/download/pi05.pdf",
  tags: ["robotics", "VLA", "open-world generalization", "co-training"],
  accent: "#7a5b9a",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Open-world robot tasks require transfer at many levels" },
  { id: "architecture", label: "Architecture", title: "One model predicts the next subtask, then the action chunk" },
  { id: "hybrid", label: "Hybrid", title: "Discrete action tokens make pretraining cheap; flow actions make control fast" },
  { id: "training", label: "Training", title: "The recipe is a mixture, not a single robot dataset" },
  { id: "evidence", label: "Evidence", title: "The tests isolate new homes, new objects, and missing ingredients" },
  { id: "limits", label: "Limits", title: "The system generalizes broadly, but still has brittle edges" }
];

function Pi05Essay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="π0.5 treats generalization as a data-transfer problem."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The paper is not mainly claiming a new backbone. Its central claim is that the right heterogeneous
            co-training recipe lets a VLA reuse knowledge from other robots, web data, high-level labels, and human
            verbal guidance in homes it has never seen.
          </PullNote>
        }
      >
        <Pi05TermPrimer />
        <Pi05TeachingFrame />
        <OpenWorldStack />
        <StepList
          items={[
            {
              title: "The target task is under-covered",
              body: "Collecting every possible kitchen, bedroom, object, drawer, and spill configuration with the target mobile robot is not realistic."
            },
            {
              title: "Useful knowledge lives elsewhere",
              body: "Other robot embodiments teach manipulation, web data teaches object semantics, and subtask labels teach what step should come next."
            },
            {
              title: "A VLA can absorb mixed supervision",
              body: "Because images, text, object locations, and actions can all be represented as tokens or token-like inputs, one transformer can train across these sources."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="architecture"
        kicker="Inference structure"
        title="The hierarchy is implemented as two calls to the same VLA."
        aside={<SubtaskEquation />}
      >
        <UnifiedHierarchy />
        <ComparisonRows
          leftTitle="Flat VLA"
          rightTitle="π0.5"
          rows={[
            {
              label: "Input prompt",
              left: "The high-level task directly conditions low-level action generation.",
              right: "The high-level task is first rewritten into a situated subtask, such as pick up the cup."
            },
            {
              label: "Planning boundary",
              left: "Reasoning and motor control are blended in one low-level prediction.",
              right: "The text head predicts the subtask; the action expert predicts the continuous action chunk."
            },
            {
              label: "Model count",
              left: "Usually one policy, or a separate planner plus policy.",
              right: "One unified model handles both high-level and low-level inference."
            },
            {
              label: "Why it helps",
              left: "Works when the command is already close to an executable skill.",
              right: "Lets the model choose the next short behavior in a long, cluttered household task."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="hybrid"
        kicker="Action representation"
        title="π0.5 trains with action tokens before switching to flow-matched control."
        aside={
          <PullNote label="Tradeoff" tone="warm">
            FAST-style discrete actions are efficient for broad sequence pretraining, but expensive to decode
            autoregressively at runtime. Flow matching is better suited to real-time continuous action chunks.
          </PullNote>
        }
      >
        <HybridActionDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Pretrain",
              body: "Represent robot actions as FAST discrete tokens and train the VLA like a next-token model over text, object boxes, and action tokens."
            },
            {
              label: "Post-train",
              body: "Add an action expert with randomly initialized weights and train it with flow matching while preserving text prediction."
            },
            {
              label: "Run",
              body: "Decode text for the next subtask, then denoise a continuous action chunk conditioned on that subtask."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="FAST tokens"
          rightTitle="Flow action expert"
          rows={[
            {
              label: "Best use",
              left: "Scalable pretraining across heterogeneous robot logs.",
              right: "Low-latency continuous control at deployment time."
            },
            {
              label: "Generation",
              left: "Autoregressive token sampling.",
              right: "Iterative vector-field integration over an action chunk."
            },
            {
              label: "Isolation",
              left: "Discrete action tokens are treated like text targets.",
              right: "Continuous action tokens use separate expert weights and do not attend to the discrete action representation."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="training"
        kicker="Data recipe"
        title="Only a small fraction of the first training phase is target mobile-manipulator data."
        aside={<TrainingStats />}
      >
        <DataMixtureMap />
        <MetricDelta
          leftLabel="mobile data"
          leftValue="400h"
          center="from about 100 home environments, then amplified by other robot, semantic, verbal, and web supervision"
          rightLabel="non-MM pretrain"
          rightValue="97.6%"
        />
        <ComparisonRows
          leftTitle="Pre-training"
          rightTitle="Post-training"
          rows={[
            {
              label: "Purpose",
              left: "Build a broad VLA that can absorb robot, text, object, and web examples as sequence data.",
              right: "Specialize the model for mobile manipulation and add the continuous action expert."
            },
            {
              label: "Data",
              left: "MM, ME, CE, HL, and WD: mobile robots, non-mobile robots, cross-embodiment lab data, subtask labels, and web data.",
              right: "MM and ME successful episodes, WD to preserve semantics, HL from multi-environment data, and VI from language teleoperation."
            },
            {
              label: "Action form",
              left: "FAST encoded action tokens.",
              right: "Flow-matched continuous action chunks plus text next-token training."
            },
            {
              label: "Schedule",
              left: "280k gradient steps.",
              right: "80k additional steps."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The ablations point to transfer, not just more target data."
        aside={<EvidenceScorecard />}
      >
        <EvaluationMap />
        <ComparisonRows
          leftTitle="Question"
          rightTitle="What the paper reports"
          rows={[
            {
              label: "New homes",
              left: "Can the robot work in houses absent from training?",
              right: "The model is evaluated in three unseen real homes, with kitchens and bedrooms, and on mock homes for controlled comparisons."
            },
            {
              label: "More scenes",
              left: "Does mobile manipulation data from more locations help?",
              right: "Performance improves from small-location settings up to 104 training locations, and the 104-location model approaches a test-home-trained control."
            },
            {
              label: "Ingredients",
              left: "Which sources matter?",
              right: "Removing ME or CE hurts full-task and language-following results; removing WD especially hurts out-of-distribution object following and high-level inference."
            },
            {
              label: "Hierarchy",
              left: "Is high-level inference doing useful work?",
              right: "The full high-level plus low-level π0.5 setup is best in the reported high-level evaluation, while no VI, no WD, no HL, and GPT-4 high-level variants lag."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="Open-world does not mean unconstrained autonomy.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          π0.5 is strongest as evidence for a recipe: train one VLA across many supervision types, teach it to name the
          next subtask, and use a flow action expert for control. The remaining failures are physical, perceptual, and
          contextual rather than just benchmark-score gaps.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function Pi05TermPrimer() {
  const terms = [
    {
      term: "Open-world",
      body: "Evaluation outside the lab distribution: new homes, new layouts, new objects, and task situations not directly shown during training."
    },
    {
      term: "Co-training",
      body: "Training one model on several kinds of data at once so knowledge can transfer between them."
    },
    {
      term: "Semantic subtask",
      body: "A short text label for the next useful step, such as pick up the plate, predicted from the current scene and high-level command."
    },
    {
      term: "Action expert",
      body: "A smaller set of transformer weights specialized for continuous robot action generation through flow matching."
    }
  ];

  return (
    <div className="term-primer" aria-label="π0.5 term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function Pi05TeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A household robot must handle long tasks in new rooms without having seen every relevant room-object-task combination."
    },
    {
      label: "Assumption",
      body: "Different data sources teach different pieces of competence: motor skills, object semantics, task decomposition, and correction-like guidance."
    },
    {
      label: "Method",
      body: "Co-train a single VLA on heterogeneous examples, then use it hierarchically: first text subtask, then action chunk."
    },
    {
      label: "Result",
      body: "The robot performs multi-stage cleaning and tidying tasks in unseen kitchens and bedrooms, and ablations show that missing data sources degrade performance."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="π0.5 teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function OpenWorldStack() {
  return (
    <div className="pi05-stack" aria-label="Open-world transfer stack">
      <TransferCard tone="target" label="target experience" title="mobile homes" body="400 hours across about 100 homes" />
      <TransferCard tone="robot" label="motor transfer" title="other robots" body="fixed arms, bimanual data, lab tasks, OXE" />
      <TransferCard tone="semantic" label="semantic transfer" title="web + labels" body="captions, VQA, boxes, subtasks" />
      <TransferCard tone="runtime" label="runtime use" title="new home" body="choose subtask, then act at 50 Hz" />
    </div>
  );
}

function TransferCard({
  tone,
  label,
  title,
  body
}: {
  tone: "target" | "robot" | "semantic" | "runtime";
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`pi05-transfer-card ${tone}`}>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function UnifiedHierarchy() {
  const steps = [
    {
      label: "01",
      title: "Observe",
      body: "four cameras for high-level inference, robot state, and the household command"
    },
    {
      label: "02",
      title: "Name next step",
      body: "text logits produce a semantic subtask grounded in the scene"
    },
    {
      label: "03",
      title: "Act",
      body: "the action expert predicts the next continuous action chunk"
    }
  ];

  return (
    <div className="pi05-hierarchy" aria-label="π0.5 unified hierarchy">
      {steps.map((step, index) => (
        <div className="pi05-hierarchy-step" key={step.label}>
          <span>{step.label}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          {index < steps.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function SubtaskEquation() {
  return (
    <div className="pi05-equation" aria-label="π0.5 inference factorization">
      <span>same model, two outputs</span>
      <strong>
        <MathInline>{"p(s, A \\mid o, \\ell) = p(s \\mid o, \\ell)\\,p(A \\mid o, \\ell, s)"}</MathInline>
      </strong>
      <p>
        Here <MathInline>{"o"}</MathInline> is the observation, <MathInline>{"\\ell"}</MathInline> is the high-level
        language command, <MathInline>{"s"}</MathInline> is the predicted subtask, and <MathInline>{"A"}</MathInline> is
        the future action chunk. In plain English: first choose what short step to do, then generate motion for that
        step.
      </p>
    </div>
  );
}

function HybridActionDiagram() {
  return (
    <div className="pi05-hybrid" aria-label="Hybrid discrete and continuous action training">
      <div className="pi05-hybrid-row">
        <LabelPill>pre-training</LabelPill>
        <strong>images + text + FAST action tokens</strong>
        <div className="pi05-token-strip">
          {["img", "cmd", "box", "a12", "a47", "a09"].map((token) => (
            <span key={token}>{token}</span>
          ))}
        </div>
      </div>
      <span className="pi05-hybrid-arrow" aria-hidden="true" />
      <div className="pi05-hybrid-row flow">
        <LabelPill>post-training</LabelPill>
        <strong>subtask text + continuous action expert</strong>
        <div className="pi05-flow-strip">
          {["noise", "v1", "v2", "v3", "chunk"].map((token, index) => (
            <span className={index === 4 ? "done" : ""} key={token}>
              {token}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainingStats() {
  return (
    <div className="pi05-stats" aria-label="π0.5 training statistics">
      <StatBlock label="pretrain" value="280k" body="gradient steps with discrete token targets" />
      <StatBlock label="post-train" value="80k" body="additional steps with text loss plus flow matching" />
      <StatBlock label="control" value="50 Hz" body="target poses and base velocity commands with action chunking" />
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

function DataMixtureMap() {
  const items = [
    { code: "MM", label: "mobile manipulator homes", tone: "target", amount: "400h" },
    { code: "ME", label: "non-mobile robots in homes", tone: "robot", amount: "many scenes" },
    { code: "CE", label: "cross-embodiment lab tasks", tone: "robot", amount: "many robots" },
    { code: "HL", label: "semantic subtask labels", tone: "semantic", amount: "text targets" },
    { code: "WD", label: "caption, VQA, localization", tone: "semantic", amount: "web data" },
    { code: "VI", label: "verbal instruction demos", tone: "verbal", amount: "post-train" }
  ];

  return (
    <div className="pi05-data-map" aria-label="π0.5 data mixture">
      {items.map((item) => (
        <div className={`pi05-data-card ${item.tone}`} key={item.code}>
          <span>{item.code}</span>
          <strong>{item.label}</strong>
          <p>{item.amount}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceScorecard() {
  return (
    <div className="pi05-evidence-card" aria-label="π0.5 evaluation scorecard">
      <StatBlock label="real homes" value="3" body="each with kitchen and bedroom evaluations" />
      <StatBlock label="training locations" value="104" body="largest location-scaling condition" />
      <StatBlock label="real-task duration" value="2-5m" body="many quantitative tasks involve multiple stages" />
    </div>
  );
}

function EvaluationMap() {
  const rows = [
    { label: "real homes", score: 92, body: "novel kitchens and bedrooms" },
    { label: "scene scale", score: 82, body: "3 to 104 training locations" },
    { label: "mixture ablation", score: 72, body: "remove ME, CE, WD, HL, or VI" },
    { label: "VLA baseline", score: 62, body: "compare against π0 and π0-FAST+Flow" }
  ];

  return (
    <div className="pi05-evaluation" aria-label="π0.5 evaluation coverage">
      {rows.map((row) => (
        <div className="pi05-eval-row" key={row.label}>
          <span>{row.label}</span>
          <i style={{ "--score": `${row.score}%` } as CSSProperties} />
          <p>{row.body}</p>
        </div>
      ))}
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Physical edge cases",
      body: "Unfamiliar drawer handles and hard-to-open cabinets remain persistent challenges."
    },
    {
      label: "Partial observability",
      body: "The arm can occlude important scene state, such as a spill that should still be wiped."
    },
    {
      label: "High-level distraction",
      body: "The subtask policy can loop or chase the wrong step, such as repeatedly opening and closing a drawer."
    },
    {
      label: "Prompt and memory limits",
      body: "The paper uses relatively simple prompts and modest context; richer preferences and long-memory tasks are future work."
    }
  ];

  return (
    <div className="pi05-limits" aria-label="π0.5 limitations">
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

export const pi05OpenWorld: PaperModule = {
  meta,
  sections,
  VisualEssay: Pi05Essay
};
