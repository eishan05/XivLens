import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pistar06-recap",
  title: "π*0.6: Learning From Experience",
  subtitle:
    "Physical Intelligence trains a VLA with RECAP, combining demonstrations, autonomous rollouts, human corrections, a value function, and advantage-conditioned policy updates.",
  abstract:
    "A mechanism-first read of RECAP, the reinforcement-learning loop that turns π0.6 into π*0.6 for espresso making, laundry folding, and box assembly.",
  authors: [
    "Physical Intelligence",
    "Ali Amin",
    "Raichelle Aniceto",
    "Ashwin Balakrishna",
    "Kevin Black",
    "Ken Conley",
    "Grace Connors",
    "James Darpinian",
    "Karan Dhabalia",
    "Jared DiCarlo",
    "Danny Driess",
    "Michael Equi",
    "Adnan Esmail",
    "Yunhao Fang",
    "Chelsea Finn",
    "Catherine Glossop",
    "Thomas Godden",
    "Ivan Goryachev",
    "Lachy Groom",
    "Hunter Hancock",
    "Karol Hausman",
    "Gashon Hussein",
    "Brian Ichter",
    "Szymon Jakubczak",
    "Rowan Jen",
    "Tim Jones",
    "Ben Katz",
    "Liyiming Ke",
    "Chandra Kuchi",
    "Marinda Lamb",
    "Devin LeBlanc",
    "Sergey Levine",
    "Adrian Li-Bell",
    "Yao Lu",
    "Vishnu Mano",
    "Mohith Mothukuri",
    "Suraj Nair",
    "Karl Pertsch",
    "Allen Z. Ren",
    "Charvi Sharma",
    "Lucy Xiaoyang Shi",
    "Laura Smith",
    "Jost Tobias Springenberg",
    "Kyle Stachowicz",
    "Will Stoeckle",
    "Alex Swerdlow",
    "James Tanner",
    "Marcel Torne",
    "Quan Vuong",
    "Anna Walling",
    "Haohuan Wang",
    "Blake Williams",
    "Sukwon Yoo",
    "Lili Yu",
    "Ury Zhilinsky",
    "Zhiyuan Zhou"
  ],
  venue: "Physical Intelligence technical report",
  publishedAt: "Nov 17, 2025",
  sourceUrl: "https://www.pi.website/download/pistar06.pdf",
  tags: ["robotics", "VLA", "reinforcement learning", "RECAP"],
  accent: "#6f6a28",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Imitation alone does not teach recovery" },
  { id: "loop", label: "RECAP", title: "Deployment becomes the next training set" },
  { id: "advantage", label: "Advantage", title: "A value function turns outcomes into action labels" },
  { id: "model", label: "Model", title: "π*0.6 adds advantage conditioning to π0.6" },
  { id: "evidence", label: "Evidence", title: "The gains show up as throughput and reliability" },
  { id: "limits", label: "Limits", title: "The loop still depends on people and batches" }
];

function PiStar06Essay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="π*0.6 is about practice: the robot learns from the states it creates."
        aside={
          <PullNote label="Reading frame" tone="warm">
            The paper is not just a new robot policy. It is a training recipe for taking a capable VLA, watching it
            fail in the real world, and converting those failures into better action choices.
          </PullNote>
        }
      >
        <PiStarTermPrimer />
        <PiStarTeachingFrame />
        <CompoundingErrorDiagram />
        <StepList
          items={[
            {
              title: "Demonstrations cover clean behavior",
              body: "Supervised fine-tuning teaches the policy to imitate successful human-operated trajectories."
            },
            {
              title: "Deployment creates messy states",
              body: "A small grasp error, cloth wrinkle, or misaligned portafilter moves the robot into states that were rare in the demonstrations."
            },
            {
              title: "Copying mistakes is not enough",
              body: "Autonomous rollouts contain exactly the states the robot must learn from, but the training signal must distinguish useful actions from bad ones."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="loop"
        kicker="Training loop"
        title="RECAP alternates between doing the task, judging the data, and retraining the policy."
        aside={<LoopScorecard />}
      >
        <RecapLoopDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Collect",
              body: "Run the current VLA on the real task, label each episode outcome, and optionally let a teleoperator intervene when the robot makes a large mistake."
            },
            {
              label: "Critic",
              body: "Train a value function on all task data so it predicts progress toward completion from images, robot state, and language."
            },
            {
              label: "Extract",
              body: "Fine-tune the VLA on the same data while adding an advantage indicator that tells the action head whether each action improved the state."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Imitation-only"
          rightTitle="RECAP"
          rows={[
            {
              label: "Data source",
              left: "Mostly successful demonstrations from people.",
              right: "Demonstrations, autonomous attempts, and expert corrections from the robot's own deployment distribution."
            },
            {
              label: "Training signal",
              left: "Copy the action that appears in the dataset.",
              right: "Copy all actions, but condition action generation on whether the value function says the action was improving."
            },
            {
              label: "Failure handling",
              left: "Failures are underrepresented unless people demonstrate recovery.",
              right: "Failures become informative because the value function can mark which earlier choices led away from success."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="advantage"
        kicker="Credit assignment"
        title="The advantage label asks whether an action made the future look better."
        aside={<AdvantageEquation />}
      >
        <ValueTraceDiagram />
        <ComparisonRows
          leftTitle="Value"
          rightTitle="Advantage"
          rows={[
            {
              label: "Question",
              left: "How close does this state look to task completion?",
              right: "Did this action move the robot to states that look closer to completion?"
            },
            {
              label: "Format",
              left: "A distribution over 201 value bins, normalized per task in implementation.",
              right: "A binary input token: Advantage: positive or Advantage: negative."
            },
            {
              label: "Why it helps",
              left: "Outcome rewards arrive late, so the value function spreads the signal backward through the episode.",
              right: "The VLA can keep all trajectories in training while learning to execute the positive-advantage subset at test time."
            },
            {
              label: "Corrections",
              left: "A human takeover shows what to do in a state created by the policy.",
              right: "The paper forces human correction actions to be positive-advantage examples."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="model"
        kicker="Implementation"
        title="π*0.6 keeps the π0.6 structure, then inserts advantage before action generation."
        aside={<RewardPanel />}
      >
        <PiStarArchitecture />
        <MetricDelta
          leftLabel="base VLM"
          leftValue="4B"
          center="Gemma 3 initializes the VLA backbone; an action expert and a smaller value VLM specialize the robot learning pieces"
          rightLabel="action expert"
          rightValue="860M"
        />
        <ComparisonRows
          leftTitle="π0.6"
          rightTitle="π*0.6"
          rows={[
            {
              label: "Backbone",
              left: "A Gemma 3-based VLA with high-level text output and a flow-matching action expert.",
              right: "The same model family, trained so actions can condition on a positive or negative advantage marker."
            },
            {
              label: "Action path",
              left: "Predict a subtask, then generate chunked continuous joint and gripper commands at 50 Hz.",
              right: "Insert the advantage input after the subtask and before the action targets, so the action distribution changes."
            },
            {
              label: "Critic",
              left: "No separate value function is needed for pure supervised learning.",
              right: "A 670M-parameter value VLM estimates progress and supplies the advantage labels during training."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The strongest result is practical: harder tasks get faster and fail less."
        aside={<EvidenceNumbers />}
      >
        <TaskSuiteDiagram />
        <ResultLadder />
        <ComparisonRows
          leftTitle="Evaluation question"
          rightTitle="What the paper reports"
          rows={[
            {
              label: "Real tasks",
              left: "Can the method handle long, physical tasks rather than tabletop toy skills?",
              right: "The evaluations cover espresso drinks, box assembly, and laundry, including deformable cloth, liquids, cardboard, and multi-stage execution."
            },
            {
              label: "Learning source",
              left: "Are demonstrations enough after offline RL pretraining?",
              right: "The final model improves further after on-robot experience, especially on the hardest tasks."
            },
            {
              label: "Policy extraction",
              left: "Could PPO or advantage-weighted regression replace the advantage token recipe?",
              right: "The paper reports that both alternatives trail RECAP in their comparisons, with PPO constrained for stability and AWR producing slower policies."
            },
            {
              label: "Failure removal",
              left: "Can the loop target one recurring mistake?",
              right: "On an adversarial T-shirt setup, two RL-only iterations with 600 trajectories each reach 97% success."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="RECAP is a strong batch RL recipe, not full autonomy yet.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          π*0.6 matters because it gives VLA training a scalable route beyond imitation: keep the model architecture,
          collect the robot&apos;s own attempts, use a value model for credit assignment, and condition the policy on
          improvement.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function PiStarTermPrimer() {
  const terms = [
    {
      term: "VLA",
      body: "A vision-language-action model: it reads images and language, then emits robot actions."
    },
    {
      term: "Rollout",
      body: "One execution episode of the policy in the environment, such as one attempt to fold a shirt."
    },
    {
      term: "Value function",
      body: "A model that estimates how promising the current state is for eventually completing the task."
    },
    {
      term: "Advantage",
      body: "A score for whether a particular action is better than the policy's average behavior in that state."
    }
  ];

  return (
    <div className="term-primer" aria-label="π*0.6 term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function PiStarTeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A robot policy trained only to imitate successful trajectories can fall apart when its own small errors create unfamiliar states."
    },
    {
      label: "Assumption",
      body: "The current policy is already competent enough to produce useful attempts, and people can label outcomes or correct major failures."
    },
    {
      label: "Method",
      body: "Use a value function to convert rollouts into advantage labels, then train the VLA to condition action generation on those labels."
    },
    {
      label: "Result",
      body: "The final π*0.6 policies improve throughput and success on realistic tasks like espresso making, laundry, and box assembly."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="π*0.6 teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function CompoundingErrorDiagram() {
  const states = [
    { label: "demo state", body: "expert path", tone: "blue" },
    { label: "small error", body: "shifted grip", tone: "accent" },
    { label: "new state", body: "rare in data", tone: "warm" },
    { label: "failure", body: "task stalls", tone: "muted" }
  ];

  return (
    <div className="pistar-cascade" aria-label="Compounding error path">
      {states.map((state, index) => (
        <div className={`pistar-cascade-step ${state.tone}`} key={state.label}>
          <span>{state.label}</span>
          <strong>{state.body}</strong>
          {index < states.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function LoopScorecard() {
  return (
    <div className="pistar-scorecard" aria-label="RECAP loop facts">
      <StatBlock label="loop data" value="3" body="demonstrations, autonomous rollouts, and interventions" />
      <StatBlock label="value bins" value="201" body="discrete bins used to train the distributional value function" />
      <StatBlock label="task loop" value="1+" body="the paper reports that even one iteration often improves results" />
    </div>
  );
}

function RecapLoopDiagram() {
  const steps = [
    {
      label: "01",
      title: "Pretrain",
      body: "offline RL over broad demonstration data"
    },
    {
      label: "02",
      title: "Specialize",
      body: "supervised fine-tuning on task demos"
    },
    {
      label: "03",
      title: "Practice",
      body: "autonomous rollouts plus corrections"
    },
    {
      label: "04",
      title: "Rebuild",
      body: "train value and policy from pretrain"
    }
  ];

  return (
    <div className="pistar-loop" aria-label="RECAP iterative loop">
      {steps.map((step, index) => (
        <div className="pistar-loop-step" key={step.label}>
          <span>{step.label}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          {index < steps.length - 1 ? <i aria-hidden="true" /> : null}
        </div>
      ))}
    </div>
  );
}

function AdvantageEquation() {
  return (
    <div className="pistar-equation" aria-label="Advantage equation explanation">
      <span>n-step advantage</span>
      <strong>
        <MathInline>{"A(o_t,a_t,\\ell)=\\sum_{k=t}^{t+N-1} r_k + V(o_{t+N},\\ell) - V(o_t,\\ell)"}</MathInline>
      </strong>
      <p>
        Here <MathInline>{"o_t"}</MathInline> is the current observation, <MathInline>{"a_t"}</MathInline> is the
        action, <MathInline>{"\\ell"}</MathInline> is the language command, <MathInline>{"r_k"}</MathInline> is reward,
        and <MathInline>{"V"}</MathInline> is the value function. In plain English: add the short-term reward and the
        new state value, then subtract where you started.
      </p>
    </div>
  );
}

function ValueTraceDiagram() {
  const points = [
    { label: "start", value: "-0.82", tone: "low" },
    { label: "grasp", value: "-0.58", tone: "up" },
    { label: "slip", value: "-0.74", tone: "down" },
    { label: "recover", value: "-0.39", tone: "up" },
    { label: "finish", value: "0.00", tone: "done" }
  ];

  return (
    <div className="pistar-value-trace" aria-label="Value trace across a rollout">
      {points.map((point) => (
        <div className={`pistar-value-point ${point.tone}`} key={point.label}>
          <span>{point.label}</span>
          <strong>{point.value}</strong>
        </div>
      ))}
      <p>Values are normalized so 0 means successful completion; upward moves become positive-advantage evidence.</p>
    </div>
  );
}

function RewardPanel() {
  return (
    <div className="pistar-equation" aria-label="Reward function used for value learning">
      <span>task reward</span>
      <strong>
        <MathInline>{"r_t = 0\\;\\text{on success},\\;-C_{fail}\\;\\text{on failure},\\;-1\\;\\text{otherwise}"}</MathInline>
      </strong>
      <p>
        This reward is intentionally sparse. It says: finish successfully, avoid failed terminal episodes, and prefer
        fewer steps because every nonterminal step costs one.
      </p>
    </div>
  );
}

function PiStarArchitecture() {
  return (
    <div className="pistar-architecture" aria-label="π*0.6 architecture and training signals">
      <div className="pistar-model-column">
        <ModelBlock tone="vision" label="VLA backbone" title="Gemma 3 VLM" body="images, language, state, subtask text" />
        <ModelBlock tone="action" label="action expert" title="flow chunk" body="joint and gripper commands at 50 Hz" />
      </div>
      <div className="pistar-token-path">
        {["images", "prompt", "subtask", "advantage", "actions"].map((token, index) => (
          <span className={index === 3 ? "active" : ""} key={token}>
            {token}
          </span>
        ))}
        <p>The advantage token appears before the discrete and continuous action targets, so it gates action behavior.</p>
      </div>
      <div className="pistar-model-column">
        <ModelBlock tone="critic" label="value VLM" title="670M critic" body="predicts progress toward completion" />
        <ModelBlock tone="data" label="training set" title="all rollouts" body="demos, autonomous data, corrections" />
      </div>
    </div>
  );
}

function ModelBlock({
  tone,
  label,
  title,
  body
}: {
  tone: "vision" | "action" | "critic" | "data";
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`pistar-model-block ${tone}`}>
      <span>{label}</span>
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function EvidenceNumbers() {
  return (
    <div className="pistar-scorecard" aria-label="π*0.6 evidence summary">
      <StatBlock label="hard-task throughput" value="2x+" body="reported improvement on some of the hardest tasks" />
      <StatBlock label="failure rate" value="~2x" body="roughly halved in the paper's summary" />
      <StatBlock label="targeted fix" value="97%" body="success after two RL-only iterations on adversarial T-shirt folding" />
    </div>
  );
}

function TaskSuiteDiagram() {
  const tasks = [
    {
      label: "espresso",
      title: "liquids + timing",
      body: "professional machine, portafilter handling, waiting, pouring, cleanup"
    },
    {
      label: "laundry",
      title: "deformable cloth",
      body: "T-shirts, shorts, diverse garments, and adversarial folds"
    },
    {
      label: "boxes",
      title: "forceful assembly",
      body: "fold flaps, recover from stuck or doubled flattened boxes"
    }
  ];

  return (
    <div className="pistar-task-suite" aria-label="π*0.6 task suite">
      {tasks.map((task) => (
        <div key={task.label}>
          <span>{task.label}</span>
          <strong>{task.title}</strong>
          <p>{task.body}</p>
        </div>
      ))}
    </div>
  );
}

function ResultLadder() {
  const stages = [
    { label: "π0.6", body: "supervised pretrain", score: 28 },
    { label: "π*0.6", body: "offline RL pretrain", score: 45 },
    { label: "+ SFT", body: "task demos", score: 63 },
    { label: "+ RECAP", body: "on-robot experience", score: 92 }
  ];

  return (
    <div className="pistar-ladder" aria-label="Training stages compared in the paper">
      {stages.map((stage) => (
        <div className="pistar-ladder-row" key={stage.label}>
          <strong>{stage.label}</strong>
          <i style={{ "--score": `${stage.score}%` } as CSSProperties} />
          <p>{stage.body}</p>
        </div>
      ))}
      <em>Conceptual ladder, not a reproduced chart: it shows the paper&apos;s evaluation progression.</em>
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Human effort",
      body: "Reward labels, interventions, and episode resets still rely on people."
    },
    {
      label: "Exploration",
      body: "The paper describes exploration as relatively greedy, helped by stochasticity and interventions."
    },
    {
      label: "Batch updates",
      body: "RECAP collects a batch, retrains, and repeats rather than updating fully online during collection."
    },
    {
      label: "Starting policy",
      body: "The recipe works best when the imitation-trained policy already produces reasonable attempts."
    }
  ];

  return (
    <div className="pistar-limits" aria-label="π*0.6 limitations">
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

function StatBlock({ label, value, body }: { label: string; value: string; body: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{body}</p>
    </div>
  );
}

export const piStar06Recap: PaperModule = {
  meta,
  sections,
  VisualEssay: PiStar06Essay
};
