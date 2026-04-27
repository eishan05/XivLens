import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties, ReactNode } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pi0-vla-flow",
  title: "π0: Vision-Language-Action Flow Model",
  subtitle:
    "PaliGemma, a pretrained vision-language model (VLM), becomes a vision-language-action (VLA) robot policy through an action expert, robot-scale data, and flow matching, a way to turn noise into action chunks.",
  abstract:
    "A thorough read of π0, the Physical Intelligence model that combines Internet-scale image-language pretraining with cross-embodiment robot data and continuous noise-to-action control.",
  authors: [
    "Kevin Black",
    "Noah Brown",
    "Danny Driess",
    "Adnan Esmail",
    "Michael Equi",
    "Chelsea Finn",
    "Niccolo Fusai",
    "Lachy Groom",
    "Karol Hausman",
    "Brian Ichter",
    "Szymon Jakubczak",
    "Tim Jones",
    "Liyiming Ke",
    "Sergey Levine",
    "Adrian Li-Bell",
    "Mohith Mothukuri",
    "Suraj Nair",
    "Karl Pertsch",
    "Lucy Xiaoyang Shi",
    "James Tanner",
    "Quan Vuong",
    "Anna Walling",
    "Haohuan Wang",
    "Ury Zhilinsky"
  ],
  venue: "RSS 2025 / arXiv 2410.24164v4",
  publishedAt: "Submitted Oct 31, 2024; revised Jan 8, 2026",
  sourceUrl: "https://arxiv.org/pdf/2410.24164",
  tags: ["robotics", "VLA", "flow matching", "foundation models"],
  accent: "#6b6f2c",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "thesis", label: "Thesis", title: "Robot foundation models need three ingredients at once" },
  { id: "contract", label: "Contract", title: "The policy predicts a future action chunk from a multimodal observation" },
  { id: "architecture", label: "Architecture", title: "A pretrained VLM carries semantics while an action expert learns control" },
  { id: "flow", label: "Flow", title: "Actions are solved as a short conditional flow trajectory" },
  { id: "training", label: "Training", title: "Pretraining teaches breadth; post-training teaches fluency" },
  { id: "evidence", label: "Evidence", title: "The evaluation asks for more than single-stage picking" },
  { id: "limits", label: "Limits", title: "The result is broad, but not yet a universal robot policy" }
];

function Pi0Essay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="thesis"
        kicker="Main claim"
        title="π0 is a robot foundation-model recipe, not just a bigger policy."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The paper makes its claim through the combination: Internet-scale image-language initialization,
            cross-embodiment robot pretraining, and continuous action generation for high-frequency control.
          </PullNote>
        }
      >
        <Pi0TermPrimer />
        <Pi0TeachingFrame />
        <ThesisTriptych />
        <StepList
          items={[
            {
              title: "Import semantic priors",
              body: "Start from PaliGemma so the policy inherits image-language grounding instead of learning object semantics only from robot logs."
            },
            {
              title: "Train across embodiments",
              body: "Mix data from single-arm, bimanual, and mobile manipulators so one model sees varied robots, tasks, cameras, and action spaces."
            },
            {
              title: "Keep actions continuous",
              body: "Use flow matching over action chunks so the model can represent precise, multimodal robot commands at up to 50 Hz."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="contract"
        kicker="Input and output"
        title="One control call conditions on the world and emits 50 future actions."
        aside={
          <PullNote label="Observation" tone="warm">
            The paper defines the observation as images, language, and proprioception:
            {" "}
            <MathInline ariaLabel="o t equals images language and q t">
              {"o_t=[I_t^1,\\ldots,I_t^n,\\ell_t,q_t]"}
            </MathInline>
            . Here <MathInline>{"I_t^k"}</MathInline> is camera image <MathInline>{"k"}</MathInline> at time{" "}
            <MathInline>{"t"}</MathInline>, <MathInline>{"\\ell_t"}</MathInline> is the language instruction, and{" "}
            <MathInline>{"q_t"}</MathInline> is proprioception: the robot&apos;s internal state, such as joint
            positions.
          </PullNote>
        }
      >
        <TokenRouteDiagram />
        <ComparisonRows
          leftTitle="Conditioning prefix"
          rightTitle="Predicted suffix"
          rows={[
            {
              label: "Contents",
              left: "2 or 3 camera images, a language command, and robot joint state.",
              right: "An action chunk of future low-level motor commands."
            },
            {
              label: "Shape",
              left: "Missing image slots are masked; smaller robots are padded into the shared action space.",
              right: (
                <>
                  <MathInline>{"H=50"}</MathInline> means the chunk has 50 future action tokens, one per future
                  timestep.
                </>
              )
            },
            {
              label: "Runtime",
              left: "The observation prefix is encoded once for a new chunk.",
              right: "The noisy action suffix is updated on every flow step."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="architecture"
        kicker="Model design"
        title="Two routed weight sets share a single transformer sequence."
        aside={<ParameterStack />}
      >
        <Pi0ArchitectureDiagram />
        <ComparisonRows
          leftTitle="VLM backbone"
          rightTitle="Action expert"
          rows={[
            {
              label: "Initialization",
              left: "PaliGemma, an open 3B vision-language model.",
              right: "Initialized from scratch for robot-specific tokens."
            },
            {
              label: "Tokens",
              left: "Camera image embeddings and language prompt tokens.",
              right: "Robot state, noisy action chunk, and flow timestep conditioning."
            },
            {
              label: "Reason",
              left: "Preserve semantic and visual priors learned from web-scale data.",
              right: "Avoid forcing new continuous-control inputs through weights pretrained only for images and text."
            },
            {
              label: "Mask",
              left: "Image-language tokens cannot attend to the newer robot suffix.",
              right: "Action tokens can attend to the full prefix and to each other."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="flow"
        kicker="Action generation"
        title="The policy learns a vector field from noise to executable motion."
        aside={<FlowLoopDiagram />}
      >
        <FlowEquationPanel />
        <PipelineFlow
          stages={[
            {
              label: "Corrupt",
              body: "During training, the true action chunk is mixed with Gaussian noise, random values from a bell-shaped distribution, at flow timestep tau, a number that runs from 0 for pure noise to 1 for the real chunk."
            },
            {
              label: "Predict",
              body: "The action expert predicts the denoising vector field conditioned on the cached observation."
            },
            {
              label: "Integrate",
              body: "At inference, Euler integration, a repeated small-step update, runs 10 steps from random noise to the final action chunk."
            }
          ]}
        />
        <InferenceTimeline />
      </PaperSpread>

      <PaperSpread
        id="training"
        kicker="Data recipe"
        title="Scale is split between broad pretraining and task-specific post-training."
        aside={
          <PullNote label="Why both phases" tone="neutral">
            The paper argues that broad, messier pretraining teaches recovery behaviors, while curated post-training
            teaches consistent strategies for a target task.
          </PullNote>
        }
      >
        <DatasetMixture />
        <ComparisonRows
          leftTitle="Pretraining"
          rightTitle="Post-training"
          rows={[
            {
              label: "Purpose",
              left: "Build a base model with broad physical and semantic competence.",
              right: "Specialize the base model into fluent downstream behavior."
            },
            {
              label: "Data",
              left: "Over 10,000 robot hours, 7 robot configurations, 68 PI tasks, plus OXE, DROID, and Bridge.",
              right: "Task-specific, higher-quality demonstrations from about 5 hours to 100+ hours depending on difficulty."
            },
            {
              label: "Labels",
              left: "Task names plus fine-grained segment annotations around 2 seconds long.",
              right: "Curated examples of the strategy the deployed policy should imitate."
            },
            {
              label: "Result",
              left: "Can be prompted directly on in-distribution tasks.",
              right: "Needed for complex laundry, table bussing, box assembly, and other long-horizon skills."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The paper evaluates prompting, language following, fine-tuning, and long tasks."
        aside={<EvidenceScorecard />}
      >
        <BaseModelResults />
        <ComparisonRows
          leftTitle="What is measured"
          rightTitle="What the result supports"
          rows={[
            {
              label: "Base model",
              left: "Five out-of-box tasks: shirt folding, easy and hard bussing, grocery bagging, and toast removal.",
              right: "Full π0 beats π0-small, OpenVLA, and Octo across the reported tasks."
            },
            {
              label: "Language",
              left: "Flat task commands, human intermediate commands, and high-level VLM-generated commands.",
              right: "VLM pretraining improves instruction following enough for semantic guidance to help."
            },
            {
              label: "Fine-tuning",
              left: "New downstream tasks such as stack bowls, towel folding, microwave use, drawer packing, and paper towel replacement.",
              right: "Pretraining often improves sample efficiency, sometimes by as much as 2x over scratch."
            },
            {
              label: "Long tasks",
              left: "Laundry from a bin, mobile laundry, dryer unloading, table bussing, box building, to-go packing, and eggs.",
              right: "The full pretrain plus fine-tune recipe is strongest on tasks requiring many coordinated sub-behaviors."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="What remains open" title="The paper is careful about the boundary of the claim.">
        <LimitStack />
        <PullNote label="Takeaway" tone="cool">
          π0 is best read as evidence that VLM priors, large robot mixtures, and flow-based action chunks compose into
          a stronger generalist policy recipe. It is not a proof that one model can yet control any robot on any task.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function Pi0TeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "Robot policies are usually narrow: a model trained for one robot, camera setup, or task often fails when any of those change."
    },
    {
      label: "Assumption",
      body: "Image-language pretraining can supply object and instruction knowledge, but control still needs real robot data and a continuous action model."
    },
    {
      label: "Method",
      body: "Keep PaliGemma for perception and language, add a robot-specific action expert, and train the combined model on many robot demonstrations."
    },
    {
      label: "Result",
      body: "The reported model transfers better than smaller or less pretrained baselines, then improves further with task-specific post-training."
    },
    {
      label: "Why it matters",
      body: "The paper is evidence for a scaling recipe: semantics, robot data, and continuous action generation help each other when trained together."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="First-principles teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function Pi0TermPrimer() {
  const terms = [
    {
      term: "VLM",
      body: "A vision-language model: a neural network trained to connect images and text. By itself, it does not output robot motor commands."
    },
    {
      term: "VLA",
      body: "A vision-language-action model: a policy that reads images and language, then produces robot actions."
    },
    {
      term: "Embodiment",
      body: "The physical robot body and control interface, such as one arm, two arms, a mobile base, joint control, or gripper control."
    },
    {
      term: "Action chunk",
      body: "A short planned sequence of future low-level commands. π0 predicts 50 future commands at a time instead of only the next command."
    },
    {
      term: "Flow matching",
      body: "A training method that teaches a model which direction to move a noisy sample so it becomes a real data sample."
    },
    {
      term: "Vector field",
      body: "A rule that assigns a direction to every point. Here, each direction says how to move a noisy action chunk toward an executable one."
    }
  ];

  return (
    <div className="term-primer" aria-label="Key terms for pi0">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function ThesisTriptych() {
  const items = [
    {
      label: "semantic prior",
      value: "PaliGemma",
      body: "Web-scale image-language features anchor object, scene, and instruction understanding.",
      tone: "vision"
    },
    {
      label: "physical data",
      value: "10k+ hours",
      body: "Robot demonstrations cover many tasks, platforms, and recovery situations.",
      tone: "language"
    },
    {
      label: "control head",
      value: "flow chunks",
      body: "Continuous vector fields generate smooth high-frequency action trajectories.",
      tone: "action"
    }
  ] as const;

  return (
    <div className="pi0-thesis" aria-label="Three core pi0 ingredients">
      {items.map((item) => (
        <div className={`pi0-thesis-card ${item.tone}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function TokenRouteDiagram() {
  const tokens: Array<{ id: string; label: ReactNode; tone: "vision" | "language" | "state" | "action" }> = [
    { id: "i1", label: <MathInline>{"I_t^1"}</MathInline>, tone: "vision" },
    { id: "i2", label: <MathInline>{"I_t^2"}</MathInline>, tone: "vision" },
    { id: "i3", label: <MathInline>{"I_t^3"}</MathInline>, tone: "vision" },
    { id: "lang", label: <MathInline>{"\\ell_t"}</MathInline>, tone: "language" },
    { id: "state", label: <MathInline>{"q_t"}</MathInline>, tone: "state" },
    { id: "a0", label: <MathInline>{"a_t^{\\tau}"}</MathInline>, tone: "action" },
    { id: "a1", label: <MathInline>{"a_{t+1}^{\\tau}"}</MathInline>, tone: "action" },
    { id: "dots", label: "...", tone: "action" },
    { id: "a49", label: <MathInline>{"a_{t+49}^{\\tau}"}</MathInline>, tone: "action" }
  ];

  return (
    <div className="pi0-token-route" aria-label="Observation prefix and noisy action suffix">
      {tokens.map((token) => (
        <span className={token.tone} key={token.id}>
          {token.label}
        </span>
      ))}
      <em>
        <MathInline>{"\\tau"}</MathInline> is embedded into every noisy action token through an MLP, a small
        feed-forward network; it is not a standalone token.
      </em>
    </div>
  );
}

function Pi0ArchitectureDiagram() {
  return (
    <div className="pi0-architecture" aria-label="pi0 architecture overview">
      <div className="pi0-inputs">
        <ArchitectureBlock label="images" value="2-3 views" tone="vision" />
        <ArchitectureBlock label="language" value="task or step" tone="language" />
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
          <p>PaliGemma processes image-language tokens and keeps its inputs close to what it saw during pretraining.</p>
        </div>
        <div>
          <LabelPill>new expert</LabelPill>
          <strong>Action expert</strong>
          <p>
            Separate Gemma-style weights process state and noisy action tokens, while self-attention, the transformer
            step where tokens exchange information, lets both experts interact.
          </p>
        </div>
      </div>
      <AttentionMaskDiagram />
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
    <div className={`pi0-architecture-block ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ParameterStack() {
  return (
    <div className="pi0-parameter-stack" aria-label="Parameter split">
      <div>
        <span>3B</span>
        <strong>PaliGemma backbone</strong>
        <p>image-language model initialized from Internet-scale pretraining</p>
      </div>
      <div>
        <span>300M</span>
        <strong>Action expert</strong>
        <p>smaller robot-state and action-token expert initialized from scratch</p>
      </div>
      <div>
        <span>470M</span>
          <strong>π0-small</strong>
        <p>non-VLM baseline used to isolate the effect of VLM initialization</p>
      </div>
    </div>
  );
}

function AttentionMaskDiagram() {
  const labels = ["img/lang", "state", "actions"];
  const cells = [
    ["on", "off", "off"],
    ["on", "on", "off"],
    ["on", "on", "on"]
  ];

  return (
    <div className="pi0-mask" aria-label="Blockwise causal attention mask">
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
      <p>Rows attend left-to-right through blocks; actions see everything, but the VLM prefix never sees robot suffixes.</p>
    </div>
  );
}

function FlowEquationPanel() {
  return (
    <div className="pi0-equations" aria-label="Flow matching equations">
      <div>
        <span>training path</span>
        <strong>
          <MathInline>{"A_t^{\\tau}=\\tau A_t+(1-\\tau)\\epsilon"}</MathInline>
        </strong>
        <p>
          <MathInline>{"A_t"}</MathInline> is the real action chunk starting at time <MathInline>{"t"}</MathInline>,{" "}
          <MathInline>{"\\epsilon"}</MathInline> is random Gaussian noise, and <MathInline>{"\\tau"}</MathInline> is
          the flow time from 0 to 1. The equation says: make a training example by blending noise with the real
          action chunk, so the model sees every stage between them.
        </p>
      </div>
      <div>
        <span>target field</span>
        <strong>
          <MathInline>{"u(A_t^{\\tau}|A_t)=A_t-\\epsilon"}</MathInline>
        </strong>
        <p>
          <MathInline>{"u"}</MathInline> is the target vector field, meaning the direction the model should learn at
          the noisy point <MathInline>{"A_t^{\\tau}"}</MathInline>. The equation says: the correct direction is the
          straight-line move from the sampled noise <MathInline>{"\\epsilon"}</MathInline> toward the real action
          chunk <MathInline>{"A_t"}</MathInline>.
        </p>
      </div>
      <div>
        <span>inference step</span>
        <strong>
          <MathInline>{"A_t^{\\tau+\\delta}=A_t^{\\tau}+\\delta v_{\\theta}(A_t^{\\tau},o_t)"}</MathInline>
        </strong>
        <p>
          <MathInline>{"v_{\\theta}"}</MathInline> is the model&apos;s predicted direction,{" "}
          <MathInline>{"\\theta"}</MathInline> means its learned weights, <MathInline>{"o_t"}</MathInline> is the
          observation, and <MathInline>{"\\delta"}</MathInline> is the step size. The equation says: start from the
          current noisy chunk, move a small distance in the predicted direction, and repeat. With{" "}
          <MathInline>{"\\delta=0.1"}</MathInline>, the paper uses 10 Euler updates per generated chunk.
        </p>
      </div>
    </div>
  );
}

function FlowLoopDiagram() {
  return (
    <div className="pi0-flow-loop" aria-label="Flow matching inference loop">
      <div>
        <span>
          <MathInline>{"\\tau=0"}</MathInline>
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
          <MathInline>{"\\tau=1"}</MathInline>
        </span>
        <strong>action chunk</strong>
      </div>
    </div>
  );
}

function InferenceTimeline() {
  const items = [
    ["image encoders", "14 ms", "14"],
    ["observation pass", "32 ms", "32"],
    ["10 action passes", "27 ms", "27"],
    ["off-board network", "13 ms", "13"]
  ];

  return (
    <div className="pi0-inference" aria-label="Inference timing from the paper">
      {items.map(([label, value, width]) => (
        <span style={{ "--w": width } as CSSProperties} key={label}>
          <strong>{label}</strong>
          <em>{value}</em>
        </span>
      ))}
      <p>Reported on an RTX 4090 with three camera images: 73 ms on-board, 86 ms off-board.</p>
    </div>
  );
}

function DatasetMixture() {
  const robots = ["UR5e", "Bi-UR5e", "Franka", "Bi-Trossen", "Bi-ARX", "Mobile", "Fibocom"];

  return (
    <div className="pi0-data" aria-label="π0 training mixture">
      <div className="pi0-data-stats">
        <Metric label="PI timesteps" value="903M" />
        <Metric label="Open data mix" value="9.1%" />
        <Metric label="Action width" value="18" />
      </div>
      <div className="pi0-data-flow">
        <DataBlock label="Open datasets" value="OXE / DROID / Bridge" tone="vision" />
        <span aria-hidden="true" />
        <DataBlock label="PI dataset" value="7 robot configs / 68 tasks" tone="language" />
        <span aria-hidden="true" />
        <DataBlock label="Training recipe" value="pretrain -> post-train" tone="action" />
      </div>
      <div className="pi0-robot-strip" aria-label="Robot configurations">
        {robots.map((robot) => (
          <span key={robot}>{robot}</span>
        ))}
      </div>
    </div>
  );
}

function DataBlock({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "vision" | "language" | "action";
}) {
  return (
    <div className={`pi0-data-block ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EvidenceScorecard() {
  return (
    <div className="pi0-evidence-card" aria-label="Evaluation summary">
      <div>
        <span>base model tasks</span>
        <strong>5</strong>
        <p>out-of-box tasks averaged over 10 episodes per method</p>
      </div>
      <div>
        <span>fine-tuning tasks</span>
        <strong>20+</strong>
        <p>downstream tasks across easier and harder transfer settings</p>
      </div>
      <div>
        <span>complex episodes</span>
        <strong>5-20 min</strong>
        <p>multi-stage tasks such as laundry, bussing, boxes, eggs, and food packing</p>
      </div>
    </div>
  );
}

function BaseModelResults() {
  const rows = [
    { task: "Bussing easy", pi0: 0.971, small: 0.443, openvla: 0.343, octo: 0.043 },
    { task: "Bussing hard", pi0: 0.875, small: 0.333, openvla: 0, octo: 0 },
    { task: "Shirt fold", pi0: 1, small: 0.5, openvla: 0, octo: 0 },
    { task: "Grocery bag", pi0: 0.786, small: 0.271, openvla: 0, octo: 0 },
    { task: "Toast", pi0: 0.75, small: 0, openvla: 0, octo: 0 }
  ];

  return (
    <div className="pi0-results" aria-label="Normalized base model scores from the project page">
      <div className="pi0-results-header">
        <span>task</span>
        <span>π0</span>
        <span>π0-small</span>
        <span>OpenVLA*</span>
        <span>Octo</span>
      </div>
      {rows.map((row) => (
        <div className="pi0-results-row" key={row.task}>
          <strong>{row.task}</strong>
          <ScoreBar value={row.pi0} tone="accent" />
          <ScoreBar value={row.small} tone="warm" />
          <ScoreBar value={row.openvla} tone="blue" />
          <ScoreBar value={row.octo} tone="muted" />
        </div>
      ))}
      <p>*For the UR5e tasks, this visual uses the stronger UR5e-only OpenVLA baseline reported on the project page.</p>
    </div>
  );
}

function ScoreBar({ value, tone }: { value: number; tone: "accent" | "warm" | "blue" | "muted" }) {
  return (
    <span className={`pi0-score ${tone}`} style={{ "--score": value } as CSSProperties}>
      <i />
      <em>{value.toFixed(3).replace(/\.?0+$/, "")}</em>
    </span>
  );
}

function LimitStack() {
  const limits = [
    {
      label: "Data composition",
      body: "The authors combined available data and leave open which datasets, tasks, and weighting rules matter most."
    },
    {
      label: "Reliability",
      body: "Not all evaluation tasks work reliably, and the paper does not provide a predictive rule for how much data is enough."
    },
    {
      label: "Transfer boundary",
      body: "Positive transfer across much more distinct domains, such as driving, navigation, or legged locomotion, remains future work."
    },
    {
      label: "System scope",
      body: "Long-horizon performance can still require high-level language guidance plus task-specific post-training."
    }
  ];

  return (
    <div className="pi0-limits" aria-label="Limitations and future work">
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

export const pi0VlaFlow: PaperModule = {
  meta,
  sections,
  VisualEssay: Pi0Essay
};
