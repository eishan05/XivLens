import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "rl-token",
  title: "RL Token: Online RL for VLAs",
  subtitle:
    "Physical Intelligence adds a compact RL token to a pretrained vision-language-action model so a small actor-critic can refine action chunks with minutes to hours of robot practice.",
  abstract:
    "A mechanism-first read of RLT: expose a compact VLA state, freeze the large model, and use online reinforcement learning to improve precision-critical robot manipulation phases.",
  authors: [
    "Charles Xu",
    "Jost Tobias Springenberg",
    "Michael Equi",
    "Ali Amin",
    "Adnan Esmail",
    "Sergey Levine",
    "Liyiming Ke"
  ],
  venue: "Physical Intelligence technical report",
  publishedAt: "Mar 19, 2026",
  sourceUrl: "https://www.pi.website/download/rlt.pdf",
  tags: ["robotics", "VLA", "online RL", "precision manipulation"],
  accent: "#4f7f5f",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Generalist VLAs can still fail at the last millimeter" },
  { id: "token", label: "RL Token", title: "The RL token turns VLA internals into a compact state" },
  { id: "policy", label: "Actor-Critic", title: "Online RL edits the VLA action proposal locally" },
  { id: "system", label: "System", title: "Robot time is concentrated on the precision-critical phase" },
  { id: "evidence", label: "Evidence", title: "RLT improves speed and reliability on contact-rich tasks" },
  { id: "limits", label: "Limits", title: "The method is efficient, but not fully autonomous yet" }
];

function RlTokenEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="RLT keeps the VLA as a prior and lets RL specialize only where practice matters."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The paper is not trying to train a billion-parameter VLA with online RL. It asks how to reuse the VLA&apos;s
            perception and action prior while giving a small learner enough state to improve precision.
          </PullNote>
        }
      >
        <RltTermPrimer />
        <RltTeachingFrame />
        <PrecisionBottleneck />
        <StepList
          items={[
            {
              title: "The base policy already knows the task shape",
              body: "π0.6 can grasp, move, and approach objects, but precise insertion, fastening, or screw driving can still be slow and brittle."
            },
            {
              title: "The expensive part is online exploration",
              body: "Real robot episodes cost time and wear, so the policy must improve from minutes to a few hours rather than millions of simulator steps."
            },
            {
              title: "The solution is a narrow interface",
              body: "RLT freezes the large VLA and trains a small actor-critic on a compact RL token plus the VLA's own proposed action chunk."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="token"
        kicker="Representation"
        title="The RL token is a learned bottleneck over the VLA&apos;s hidden tokens."
        aside={<RlTokenEquation />}
      >
        <RlTokenDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Read VLA features",
              body: "Run the pretrained VLA on images, language, and robot state, then take its final hidden embeddings as the rich but high-dimensional source."
            },
            {
              label: "Compress through a token",
              body: "Append a learned RL token to those embeddings and process the sequence with a lightweight encoder transformer."
            },
            {
              label: "Train by reconstruction",
              body: "A decoder tries to reconstruct the original VLA embeddings from the RL token, forcing the token to retain task-relevant information."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Raw VLA internals"
          rightTitle="RL token"
          rows={[
            {
              label: "Size",
              left: "Many transformer tokens with high-dimensional embeddings.",
              right: "A single compact readout vector, 2048 dimensions in the paper's diagram."
            },
            {
              label: "Training signal",
              left: "Comes from broad VLA pretraining and task demonstrations.",
              right: "Trained as a bottleneck that reconstructs the VLA embeddings while the VLA features are stop-gradient targets."
            },
            {
              label: "RL role",
              left: "Too large and expensive for fast online actor-critic updates.",
              right: "Small enough to feed a lightweight critic and actor during real robot practice."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="policy"
        kicker="Learning rule"
        title="The actor learns local edits around a sampled VLA action chunk."
        aside={<ActorObjective />}
      >
        <LocalEditingDiagram />
        <ComparisonRows
          leftTitle="Unconstrained online RL"
          rightTitle="RLT actor"
          rows={[
            {
              label: "State",
              left: "Often a small visual encoder and proprioception, trained without the VLA's internal representation.",
              right: (
                <>
                  <MathInline>{"x=(z_{rl},s^p)"}</MathInline>, the RL token plus proprioception, meaning the robot&apos;s
                  measured internal state.
                </>
              )
            },
            {
              label: "Action",
              left: "Searches directly over the action space.",
              right: "Conditions on the VLA reference chunk and outputs a refined chunk."
            },
            {
              label: "Stability",
              left: "Sparse rewards can make early exploration drift far from competent behavior.",
              right: "A behavior-cloning-style penalty keeps actions near the VLA proposal unless the critic predicts a benefit."
            },
            {
              label: "Escape hatch",
              left: "May need many episodes before the critic can shape useful behavior.",
              right: "Reference-action dropout sometimes hides the VLA proposal so the actor cannot learn only to copy it."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="system"
        kicker="Training loop"
        title="The complete system narrows credit assignment to the hard segment."
        aside={<ChunkStats />}
      >
        <RltLoop />
        <PipelineFlow
          stages={[
            {
              label: "Adapt",
              body: "Fine-tune the VLA on a small task demonstration set while training the RL token interface, then freeze both."
            },
            {
              label: "Warm up",
              body: "Roll out the VLA reference policy to seed the replay buffer before the actor starts controlling the robot."
            },
            {
              label: "Practice",
              body: "At chunk boundaries, extract the RL token, sample a VLA reference action, let the actor refine it, and store the transition."
            },
            {
              label: "Intervene",
              body: "A human can provide sparse success labels, corrections, and the handoff point from base VLA to RL during the critical phase."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Whole task"
          rightTitle="Critical phase"
          rows={[
            {
              label: "Duration",
              left: "The evaluated manipulation tasks span about 30-120 seconds.",
              right: "The hard segment usually lasts about 5-20 seconds."
            },
            {
              label: "Policy split",
              left: "The base VLA handles easier setup behavior such as grasping, transport, and approach.",
              right: "RLT controls the insertion, fastening, or rotation segment where contact precision decides success."
            },
            {
              label: "Why it helps",
              left: "Sparse terminal rewards across thousands of 50 Hz control steps make credit assignment hard.",
              right: "Chunked actions and focused data collection shorten the horizon that the critic must reason over."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The main result is better throughput without giving up success."
        aside={
          <MetricDelta
            leftLabel="speedup"
            leftValue="3x"
            center="reported on the hardest phase of the evaluated precision tasks"
            rightLabel="robot tasks"
            rightValue="4"
          />
        }
      >
        <TaskGrid />
        <ComparisonRows
          leftTitle="Question"
          rightTitle="What the paper reports"
          rows={[
            {
              label: "Base VLA",
              left: "Can π0.6 already do the task?",
              right: "Often yes, but it slows down, probes, retries, or fails in the final contact-heavy phase."
            },
            {
              label: "Critical phase",
              left: "Does RLT improve the isolated bottleneck?",
              right: "Across screw installation, zip tie fastening, Ethernet insertion, and charger insertion, RLT improves speed and often success."
            },
            {
              label: "Full task",
              left: "Does the local improvement survive earlier task variation?",
              right: "For the harder screw and zip tie full-task settings, RLT still improves success despite compounding errors from earlier stages."
            },
            {
              label: "Strategy",
              left: "Is it just copying demonstrations faster?",
              right: "On Ethernet insertion, the learned policy has median critical-phase length 66 steps versus 146 for teleoperation and 228 for the base policy."
            }
          ]}
        />
        <BaselinePanel />
      </PaperSpread>

      <PaperSpread
        id="limits"
        kicker="Interpretation"
        title="RLT is best read as a practical refinement layer over a strong VLA."
        aside={
          <PullNote label="Future direction" tone="warm">
            The authors explicitly note that rewards, corrections, and phase switching still use human input during
            training. Automating those pieces is the natural next step.
          </PullNote>
        }
      >
        <RltLimits />
        <ComparisonRows
          leftTitle="What changes"
          rightTitle="Tradeoff"
          rows={[
            {
              label: "Compute",
              left: "The billion-parameter VLA stays frozen during online RL.",
              right: "The online learner can adapt quickly, but the VLA itself does not absorb the new behavior unless a later distillation step is added."
            },
            {
              label: "Data",
              left: "The system learns from a few hours or less of real robot experience.",
              right: "It still needs task demonstrations, human labels, and sometimes human corrections."
            },
            {
              label: "Scope",
              left: "The experiments target precision-critical phases of four manipulation tasks.",
              right: "The paper does not show a fully autonomous, all-phase, open-ended robot improvement loop."
            }
          ]}
        />
        <PullNote label="Takeaway" tone="cool">
          RLT shows a clean division of labor: use the VLA for broad competence, use the RL token as a compact state,
          and let a small actor-critic discover the final precision strategy through real practice.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function RltTeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "A generalist VLA can get close to success but still be slow or unreliable during tight contact."
    },
    {
      label: "Assumption",
      body: "The VLA already contains useful perceptual and behavioral structure; online RL should refine it, not relearn it."
    },
    {
      label: "Method",
      body: "Compress VLA hidden features into an RL token, then train a small actor-critic to improve VLA action chunks."
    },
    {
      label: "Result",
      body: "RLT improves throughput and success on real precision tasks with minutes to a few hours of practice."
    },
    {
      label: "Why it matters",
      body: "It gives foundation robot policies a path to improve on the job without full-model online RL."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="First-principles teaching frame for RLT">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function RltTermPrimer() {
  const terms = [
    {
      term: "VLA",
      body: "A vision-language-action policy: it reads camera images and a text instruction, then outputs robot actions."
    },
    {
      term: "Online RL",
      body: "Reinforcement learning while the robot is actually collecting new experience, instead of only learning from a fixed dataset."
    },
    {
      term: "Actor-critic",
      body: "Two networks: the actor chooses actions, while the critic predicts how good a state-action pair is."
    },
    {
      term: "Action chunk",
      body: "A short future sequence of low-level commands predicted as one unit, rather than a single motor command."
    },
    {
      term: "Sparse reward",
      body: "A reward signal that appears only at the end, such as success or failure, instead of scoring every tiny movement."
    },
    {
      term: "Off-policy",
      body: "The learner can train from replayed data produced by older policies, the VLA, or human interventions."
    }
  ];

  return (
    <div className="term-primer" aria-label="Key terms for RLT">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function PrecisionBottleneck() {
  const phases = [
    { label: "approach", value: "broad VLA skill", tone: "cool" },
    { label: "contact", value: "precision bottleneck", tone: "warm" },
    { label: "finish", value: "success or retry", tone: "neutral" }
  ];

  return (
    <div className="rlt-bottleneck" aria-label="Task phases and precision bottleneck">
      {phases.map((phase) => (
        <div className={`rlt-phase ${phase.tone}`} key={phase.label}>
          <span>{phase.label}</span>
          <strong>{phase.value}</strong>
        </div>
      ))}
    </div>
  );
}

function RlTokenEquation() {
  return (
    <PullNote label="Bottleneck equation" tone="neutral">
      <MathInline ariaLabel="z r l equals g phi of z one through m and e r l at position m plus one">
        {"z_{rl}=g_\\phi([z_{1:M},e_{rl}])_{M+1}"}
      </MathInline>
      . The VLA produces hidden embeddings <MathInline>{"z_{1:M}"}</MathInline>; a learned token{" "}
      <MathInline>{"e_{rl}"}</MathInline> is appended; the small encoder <MathInline>{"g_\\phi"}</MathInline> returns
      the compact RL state at the appended-token position.
    </PullNote>
  );
}

function RlTokenDiagram() {
  return (
    <div className="rlt-token-diagram" aria-label="RL token extraction diagram">
      <RltBlock label="pretrained VLA" value="images + instruction + proprioception" tone="vla" />
      <RltArrow />
      <RltBlock label="hidden tokens" value="z1 ... zM" tone="features" />
      <RltArrow />
      <RltBlock label="encoder bottleneck" value="<rl> readout" tone="token" />
      <RltArrow />
      <RltBlock label="RL state" value="zrl" tone="state" />
    </div>
  );
}

function RltBlock({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "vla" | "features" | "token" | "state";
}) {
  return (
    <div className={`rlt-block ${tone}`}>
      <LabelPill>{label}</LabelPill>
      <strong>{value}</strong>
    </div>
  );
}

function RltArrow() {
  return <span className="rlt-arrow" aria-hidden="true" />;
}

function ActorObjective() {
  return (
    <PullNote label="Actor objective" tone="warm">
      <MathInline>
        {"L_\\pi=\\mathbb{E}[-Q_\\psi(x,a_{1:C})+\\beta\\lVert a_{1:C}-\\tilde a_{1:C}\\rVert_2^2]"}
      </MathInline>
      . The first term asks for high critic value; the second keeps the action chunk near the VLA reference{" "}
      <MathInline>{"\\tilde a"}</MathInline>, with <MathInline>{"\\beta"}</MathInline> controlling the strength of
      that anchor.
    </PullNote>
  );
}

function LocalEditingDiagram() {
  const reference = ["r0", "r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"];
  const refined = ["a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9"];

  return (
    <div className="rlt-editing" aria-label="Reference action chunk edited by actor">
      <div>
        <span>VLA reference chunk</span>
        <ActionStrip cells={reference} active={[4, 5, 6]} />
      </div>
      <div>
        <span>RLT refined chunk</span>
        <ActionStrip cells={refined} active={[4, 5, 6]} />
      </div>
      <p>The actor does not start from a blank policy; it changes the part of the chunk that improves predicted return.</p>
    </div>
  );
}

function ActionStrip({ cells, active }: { cells: string[]; active: number[] }) {
  return (
    <div className="rlt-action-strip">
      {cells.map((cell, index) => (
        <i className={active.includes(index) ? "active" : ""} key={cell}>
          {cell}
        </i>
      ))}
    </div>
  );
}

function ChunkStats() {
  return (
    <div className="rlt-stats" aria-label="RLT control statistics">
      <StatBlock label="VLA horizon" value="H=50" body="one second of predicted actions" />
      <StatBlock label="RL chunk" value="C=10" body="a shorter, more reactive control chunk" />
      <StatBlock label="control" value="50 Hz" body="robot command frequency" />
      <StatBlock label="actor output" value="140D" body="10 steps times 14 action dimensions" />
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

function RltLoop() {
  const steps = [
    { label: "VLA", body: "sample reference action chunk" },
    { label: "token", body: "extract compact state" },
    { label: "actor", body: "refine and execute chunk" },
    { label: "critic", body: "update from replay" }
  ];

  return (
    <div className="rlt-loop" aria-label="RLT online training loop">
      {steps.map((step, index) => (
        <div className="rlt-loop-step" key={step.label}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{step.label}</strong>
          <p>{step.body}</p>
          <i aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}

function TaskGrid() {
  const tasks = [
    { label: "screw", body: "sub-millimeter screwdriver alignment" },
    { label: "zip tie", body: "bimanual deformable-object threading" },
    { label: "Ethernet", body: "recessed connector insertion" },
    { label: "charger", body: "power-strip alignment and insertion" }
  ];

  return (
    <div className="rlt-task-grid" aria-label="RLT evaluation tasks">
      {tasks.map((task) => (
        <div key={task.label}>
          <span>{task.label}</span>
          <strong>{task.body}</strong>
        </div>
      ))}
    </div>
  );
}

function BaselinePanel() {
  const rows = [
    { label: "HIL-SERL", value: 0.25, body: "small RL policy without VLA representation" },
    { label: "PLD", value: 0.22, body: "single-step residual policy" },
    { label: "DSRL", value: 0.68, body: "steers VLA diffusion noise, slower throughput" },
    { label: "RLT", value: 1, body: "chunked actor-critic with RL token and VLA reference" }
  ];

  return (
    <div className="rlt-baselines" aria-label="Qualitative baseline comparison">
      {rows.map((row) => (
        <div key={row.label}>
          <span>{row.label}</span>
          <i style={{ "--rlt-bar": row.value } as CSSProperties} />
          <p>{row.body}</p>
        </div>
      ))}
    </div>
  );
}

function RltLimits() {
  const limits = [
    {
      label: "Human signals",
      body: "The training loop still uses human success labels, optional corrections, and handoff choices."
    },
    {
      label: "Focused scope",
      body: "Most learning is concentrated on the critical phase, not every stage of every long-horizon task."
    },
    {
      label: "Strong prior needed",
      body: "The method assumes the base VLA is already close enough that local refinement is useful."
    },
    {
      label: "No universal proof",
      body: "The evidence is four real-robot tasks on the π0.6 system, so broader morphology coverage remains open."
    }
  ];

  return (
    <div className="rlt-limits" aria-label="RLT limitations">
      {limits.map((limit) => (
        <div key={limit.label}>
          <span>{limit.label}</span>
          <strong>{limit.body}</strong>
        </div>
      ))}
    </div>
  );
}

export const rlToken: PaperModule = {
  meta,
  sections,
  VisualEssay: RlTokenEssay
};
