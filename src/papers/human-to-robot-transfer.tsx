import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "human-to-robot-transfer",
  title: "Human-to-Robot Transfer in VLAs",
  subtitle:
    "pi0.5 + ego treats egocentric human video as another embodiment and shows that transfer appears only after broad robot pretraining.",
  abstract:
    "A mechanism-first read of Physical Intelligence's human-to-robot transfer result: how 3D hand tracks, subtask labels, and robot co-finetuning let a VLA use skills shown only in human demonstrations.",
  authors: [
    "Simar Kareer",
    "Karl Pertsch",
    "James Darpinian",
    "Judy Hoffman",
    "Danfei Xu",
    "Sergey Levine",
    "Chelsea Finn",
    "Suraj Nair"
  ],
  venue: "arXiv 2512.22414",
  publishedAt: "Submitted Dec 27, 2025",
  sourceUrl: "https://www.pi.website/download/human_to_robot.pdf",
  tags: ["robotics", "VLA", "human video", "transfer"],
  accent: "#55713f",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Human video is useful only if the model can bridge embodiments" },
  { id: "recipe", label: "Recipe", title: "The human data is converted into the same targets as robot data" },
  { id: "scale", label: "Scale", title: "Transfer emerges as pretraining diversity increases" },
  { id: "benchmark", label: "Benchmark", title: "The tests hide the new concept from robot data" },
  { id: "ablations", label: "Ablations", title: "The ablations make the cross-embodiment story precise" },
  { id: "limits", label: "Limits", title: "The result is strong, but not a free pass to raw video" }
];

function HumanToRobotEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="The paper asks whether alignment can be a scaling outcome."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The claim is not that any human video teaches any robot. The claim is narrower and more interesting:
            after enough diverse robot pretraining, a VLA can treat instrumented human demonstrations as another
            embodiment during ordinary co-training.
          </PullNote>
        }
      >
        <HumanRobotTermPrimer />
        <HumanRobotTeachingFrame />
        <EmbodimentBridge />
        <StepList
          items={[
            {
              title: "The data source is tempting",
              body: "Human videos cover far more objects, homes, and task variants than robot teleoperation can cheaply cover."
            },
            {
              title: "The action gap is the hard part",
              body: "A human hand is not a robot gripper, so small systems often need explicit visual, kinematic, or latent alignment."
            },
            {
              title: "The hypothesis is scale",
              body: "If pretraining spans enough scenes, tasks, and robot embodiments, the model may learn a shared task representation before human data arrives."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="recipe"
        kicker="Co-training recipe"
        title="Human episodes become action targets and subtask text."
        aside={<ActionSpaceNote />}
      >
        <HumanDataRecipe />
        <PipelineFlow
          stages={[
            {
              label: "Capture",
              body: "Collectors wear a head camera and optional wrist cameras while repeating task demonstrations in the target setting."
            },
            {
              label: "Recover motion",
              body: "Visual SLAM reconstructs head motion, while 17 tracked 3D hand keypoints per hand define a human end-effector pose."
            },
            {
              label: "Train like robot data",
              body: "The model predicts subtask language and low-level future action chunks using the same objectives used for robot demonstrations."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Robot teleoperation"
          rightTitle="Egocentric human video"
          rows={[
            {
              label: "Low level",
              left: "Predict future robot end-effector trajectories with FAST token and flow-matching losses.",
              right: "Predict future hand-derived end-effector trajectories with the same loss types."
            },
            {
              label: "High level",
              left: "Predict dense subtask text from the visual observation and task command.",
              right: "Use annotated human subtasks as the same next-token language target."
            },
            {
              label: "Mixture",
              left: "Nearest-neighbor robot data keeps the original robot skill grounded.",
              right: "Human data is mixed 50-50 with the related robot task during fine-tuning."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="scale"
        kicker="Emergence test"
        title="Human data helps only after the VLA has enough robot diversity."
        aside={<ScalingReadout />}
      >
        <PretrainingScale />
        <ComparisonRows
          leftTitle="Limited pretraining"
          rightTitle="Diverse pretraining"
          rows={[
            {
              label: "What the model sees",
              left: "Base VLM weights or a narrow target-robot dataset.",
              right: "Many scene-task combinations, then the full pi0.5 cross-embodiment mixture."
            },
            {
              label: "Human co-training",
              left: "Little or no lift at the 0% and 25% checkpoints.",
              right: "Clear gains at 75%, 100%, and strongest gains with extra non-target embodiments."
            },
            {
              label: "Representation",
              left: "Human and robot embeddings stay separated after co-training.",
              right: "The TSNE view shows more overlap, suggesting a shared task representation."
            }
          ]}
        />
        <PullNote label="Why this matters" tone="cool">
          The paper separates two effects. More robot pretraining can improve zero-shot robot behavior, but it can also
          make the model better at absorbing human demonstrations, even when zero-shot performance itself has plateaued.
        </PullNote>
      </PaperSpread>

      <PaperSpread
        id="benchmark"
        kicker="Generalization axes"
        title="Each benchmark adds a missing concept through human data."
        aside={<BenchmarkScorecard />}
      >
        <TransferResults />
        <ComparisonRows
          leftTitle="Robot-only coverage"
          rightTitle="Human-only addition"
          rows={[
            {
              label: "Scene",
              left: "Spice and Dresser robot data covers related homes, but not the target home.",
              right: "Human episodes are collected in the unseen kitchen or bedroom."
            },
            {
              label: "Object",
              left: "Bussing robot data covers trash and dinnerware.",
              right: "Human episodes introduce new kitchen tools and related objects."
            },
            {
              label: "Task",
              left: "Egg robot data covers picking and placing eggs into cartons.",
              right: "Human episodes introduce sorting white and brown eggs by carton."
            }
          ]}
        />
        <MetricDelta
          leftLabel="human video"
          leftValue="14h"
          center="3 hours each for bussing, spice, and dresser, plus 5 hours for sort eggs"
          rightLabel="evaluations"
          rightValue="20-40"
        />
      </PaperSpread>

      <PaperSpread
        id="ablations"
        kicker="Mechanism checks"
        title="The evidence looks like cross-embodiment transfer, not magic video imitation."
        aside={
          <PullNote label="Best interpretation" tone="warm">
            Human data is valuable here because the scaled VLA already has a cross-embodiment frame. The paper treats
            the human as a difficult embodiment, then asks when ordinary co-training becomes enough.
          </PullNote>
        }
      >
        <AblationGrid />
        <ComparisonRows
          leftTitle="Question"
          rightTitle="What the paper reports"
          rows={[
            {
              label: "Human vs target robot",
              left: "Is human data as good as collecting the target robot task directly?",
              right: "Nearly so for Sort Eggs and Dresser, but not Bussing, where target robot data reaches 65% versus 25% for human data alone."
            },
            {
              label: "Human vs other robot",
              left: "Does human transfer resemble robot-to-robot transfer?",
              right: "On Bussing, 400 UR5 demonstrations, or 7.45 hours, improve ARX behavior in the same broad pattern as human data."
            },
            {
              label: "Transfer level",
              left: "Is the gain only high-level language semantics?",
              right: "No. Bussing and Eggs have no high-level policy at evaluation, and Spice/Dresser work best when both high and low levels are co-trained."
            },
            {
              label: "Sensors",
              left: "Do wrist cameras matter?",
              right: "They help on Dresser and Bussing, while Spice and Eggs are similar with or without them."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="The result narrows the path, but it does not remove the hard parts.">
        <LimitGrid />
        <PullNote label="Plain-English summary" tone="cool">
          pi0.5 + ego shows that sufficiently pretrained VLAs can learn from targeted, instrumented human episodes
          without a special alignment loss. It does not show that small policies, raw web video, or untracked passive
          demonstrations are enough by themselves.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function HumanRobotTermPrimer() {
  const terms = [
    {
      label: "Embodiment",
      body: "The body that generates the data, such as a mobile robot, a UR5 arm, or a human wearing cameras."
    },
    {
      label: "VLA",
      body: "A vision-language-action model: it reads images and language, then predicts robot actions or action-like tokens."
    },
    {
      label: "Emergence",
      body: "A capability that is weak or absent in small/narrow training regimes but appears after enough scale or diversity."
    }
  ];

  return (
    <div className="term-primer">
      {terms.map((term) => (
        <div className="term-card" key={term.label}>
          <span>{term.label}</span>
          <p>{term.body}</p>
        </div>
      ))}
    </div>
  );
}

function HumanRobotTeachingFrame() {
  const frames = [
    {
      label: "Problem",
      body: "Human demonstrations are abundant, but they do not naturally contain robot joint or gripper commands."
    },
    {
      label: "Assumption",
      body: "Tasks share structure across bodies: move toward an object, grasp it, carry it, place it, and recover."
    },
    {
      label: "Method",
      body: "Turn human episodes into subtask labels and hand-motion targets, then co-finetune them with related robot data."
    },
    {
      label: "Result",
      body: "Transfer improves sharply when the base VLA has already seen enough diverse robot scenes, tasks, and embodiments."
    },
    {
      label: "Why it matters",
      body: "It suggests human data can become a scalable supervision source, but only after robot pretraining builds the bridge."
    }
  ];

  return (
    <div className="teaching-frame">
      {frames.map((frame) => (
        <div className="teaching-card" key={frame.label}>
          <span>{frame.label}</span>
          <p>{frame.body}</p>
        </div>
      ))}
    </div>
  );
}

function EmbodimentBridge() {
  return (
    <div className="h2r-bridge" aria-label="Human and robot data co-training bridge">
      <div className="h2r-source human">
        <span>human episodes</span>
        <strong>head + wrist views</strong>
        <p>3D hand tracks and subtask text</p>
      </div>
      <i aria-hidden="true" />
      <div className="h2r-core">
        <span>same VLA</span>
        <strong>pi0.5 + ego</strong>
        <p>ordinary co-training, no explicit alignment loss</p>
      </div>
      <i aria-hidden="true" />
      <div className="h2r-source robot">
        <span>robot episodes</span>
        <strong>end-effector actions</strong>
        <p>flow actions, FAST tokens, subtasks</p>
      </div>
    </div>
  );
}

function ActionSpaceNote() {
  return (
    <div className="h2r-action-note" aria-label="Action representation note">
      <div>
        <span>robot action chunk</span>
        <strong>
          <MathInline>{"a\\in\\mathbb{R}^{H\\times16}"}</MathInline>
        </strong>
        <p>left arm pose + gripper, right arm pose + gripper, and two base-action dimensions.</p>
      </div>
      <div>
        <span>human action proxy</span>
        <strong>
          <MathInline>{"2\\times6+6=18"}</MathInline>
        </strong>
        <p>two 6-DoF hand poses plus a 6-DoF base proxy; gripper openness is learned only from robot data.</p>
      </div>
    </div>
  );
}

function HumanDataRecipe() {
  const items = [
    ["3h", "bussing"],
    ["3h", "spice"],
    ["3h", "dresser"],
    ["5h", "sort eggs"]
  ];

  return (
    <div className="h2r-recipe" aria-label="Human data collection recipe">
      <div className="h2r-camera-stack">
        <LabelPill>human rig</LabelPill>
        <span>head camera</span>
        <span>left wrist</span>
        <span>right wrist</span>
      </div>
      <div className="h2r-data-hours">
        {items.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="h2r-mixture">
        <LabelPill>fine-tuning mix</LabelPill>
        <div>
          <span>human generalization task</span>
          <span>nearest robot task</span>
        </div>
        <p>balanced 50-50 to add the missing concept without forgetting the robot skill.</p>
      </div>
    </div>
  );
}

function ScalingReadout() {
  return (
    <div className="h2r-scale-card" aria-label="Pretraining scale summary">
      <div>
        <span>weak regime</span>
        <strong>0-25%</strong>
        <p>Human co-training adds little useful transfer.</p>
      </div>
      <div>
        <span>emergent regime</span>
        <strong>75%+</strong>
        <p>Transfer becomes visible across the benchmark.</p>
      </div>
      <div>
        <span>strongest regime</span>
        <strong>+X-emb</strong>
        <p>Adding non-target robot embodiments further improves the lift.</p>
      </div>
    </div>
  );
}

function PretrainingScale() {
  const steps = [
    { label: "0%", body: "VLM only", lift: "low", width: 10 },
    { label: "25%", body: "narrow robot VLA", lift: "low", width: 18 },
    { label: "50%", body: "more scenes/tasks", lift: "mid", width: 36 },
    { label: "75%", body: "transfer appears", lift: "high", width: 62 },
    { label: "100%", body: "broad target robots", lift: "high", width: 76 },
    { label: "100% + X-emb", body: "full cross-embodiment mix", lift: "peak", width: 94 }
  ];

  return (
    <div className="h2r-scale" aria-label="Pretraining diversity ladder">
      {steps.map((step) => (
        <div className={`h2r-scale-step ${step.lift}`} key={step.label}>
          <span>{step.label}</span>
          <strong>{step.body}</strong>
          <i style={{ "--w": `${step.width}%` } as CSSProperties} />
        </div>
      ))}
    </div>
  );
}

function BenchmarkScorecard() {
  return (
    <div className="h2r-benchmark-card" aria-label="Benchmark scorecard">
      <div>
        <span>axes</span>
        <strong>3</strong>
        <p>scene, object, and task generalization.</p>
      </div>
      <div>
        <span>tasks</span>
        <strong>4</strong>
        <p>Spice, Dresser, Bussing, and Sort Eggs.</p>
      </div>
      <div>
        <span>new concept</span>
        <strong>human</strong>
        <p>The target concept is shown in human data, not robot data.</p>
      </div>
    </div>
  );
}

function TransferResults() {
  const rows = [
    { task: "Spice", axis: "scene", before: 32, after: 71, note: "unseen kitchen" },
    { task: "Dresser", axis: "scene", before: 25, after: 50, note: "unseen bedroom" },
    { task: "Bussing", axis: "object", before: 53, after: 63, note: "new object set" },
    { task: "Sort Eggs", axis: "task", before: 57, after: 78, note: "sorting accuracy" }
  ];

  return (
    <div className="h2r-results" aria-label="Human to robot transfer results">
      <div className="h2r-results-header">
        <span>task</span>
        <span>robot only</span>
        <span>human + robot</span>
        <span>axis</span>
      </div>
      {rows.map((row) => (
        <div className="h2r-results-row" key={row.task}>
          <strong>{row.task}</strong>
          <ResultBar value={row.before} tone="muted" />
          <ResultBar value={row.after} tone="accent" />
          <p>
            <span>{row.axis}</span>
            {row.note}
          </p>
        </div>
      ))}
      <p>Sort Eggs also placed about four more eggs correctly on average after human co-training.</p>
    </div>
  );
}

function ResultBar({ value, tone }: { value: number; tone: "muted" | "accent" }) {
  return (
    <span className={`h2r-result-bar ${tone}`} style={{ "--score": `${value}%` } as CSSProperties}>
      <i />
      <em>{value}%</em>
    </span>
  );
}

function AblationGrid() {
  const items = [
    {
      label: "target robot upper bound",
      title: "Bussing gap",
      body: "Human-only fine-tuning trails target-robot data on Bussing: 25% versus 65%."
    },
    {
      label: "other robot comparison",
      title: "400 UR5 demos",
      body: "Human-to-ARX and UR5-to-ARX both lift the policy but do not match target ARX data."
    },
    {
      label: "level of transfer",
      title: "HL + LL",
      body: "Mobile tasks need both high-level subtask prediction and low-level action prediction to be co-trained."
    },
    {
      label: "sensor ablation",
      title: "wrist views",
      body: "Wrist cameras help when close-up manipulation observability matters most."
    }
  ];

  return (
    <div className="h2r-ablation-grid">
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
      label: "Scale dependency",
      body: "The method relies on a VLA that already has broad robot pretraining. Limited-pretraining models fail to benefit much."
    },
    {
      label: "Human data type",
      body: "The demonstrations are episodic, first-person, instrumented, and processed with tracking, not unstructured web video."
    },
    {
      label: "Action proxy",
      body: "The recipe approximates hand and base motion but does not estimate human gripper openness."
    },
    {
      label: "Benchmark scope",
      body: "The evidence covers four targeted transfer settings, not a universal rule for every robot, task, or sensor setup."
    }
  ];

  return (
    <div className="h2r-limits">
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

export const humanToRobotTransfer: PaperModule = {
  meta,
  sections,
  VisualEssay: HumanToRobotEssay
};
