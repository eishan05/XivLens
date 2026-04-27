import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { CSSProperties } from "react";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "pi05-knowledge-insulation",
  title: "π0.5 + KI: Knowledge Insulation",
  subtitle:
    "Physical Intelligence shows how to add a fast continuous action expert to a pretrained VLM without letting the new motor module corrupt the model's web-scale semantic knowledge.",
  abstract:
    "A mechanism-first read of knowledge insulating VLAs: train the backbone with FAST action tokens, train the action expert with flow matching, and stop the expert's gradients from rewriting the pretrained backbone.",
  authors: [
    "Danny Driess",
    "Jost Tobias Springenberg",
    "Brian Ichter",
    "Lili Yu",
    "Adrian Li-Bell",
    "Karl Pertsch",
    "Allen Z. Ren",
    "Homer Walke",
    "Quan Vuong",
    "Lucy Xiaoyang Shi",
    "Sergey Levine"
  ],
  venue: "Physical Intelligence preprint",
  publishedAt: "May 28, 2025",
  sourceUrl: "https://www.pi.website/download/pi05_KI.pdf",
  tags: ["robotics", "VLA", "knowledge insulation", "flow matching"],
  accent: "#2f7568",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "Continuous action experts create a knowledge-transfer problem" },
  { id: "objective", label: "Objective", title: "Two action targets split the training job from the runtime job" },
  { id: "insulation", label: "Insulation", title: "The action expert reads the backbone without training it" },
  { id: "mixture", label: "Mixture", title: "General VLM data keeps language and semantics alive" },
  { id: "evidence", label: "Evidence", title: "The gains show up in speed, language following, and transfer" },
  { id: "limits", label: "Limits", title: "Knowledge insulation helps, but it is not free or complete" }
];

function KnowledgeInsulationEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="The paper isolates a training-dynamics bug in continuous-action VLAs."
        aside={
          <PullNote label="Reading frame" tone="cool">
            This is not just another π0.5 result page. The paper asks why continuous action experts can make a VLA
            fast at control but worse at using the pretrained language and visual knowledge that made the VLM valuable.
          </PullNote>
        }
      >
        <KITermPrimer />
        <KITeachingFrame />
        <KIFailureStack />
        <StepList
          items={[
            {
              title: "Discrete action VLAs preserve the language-model training interface",
              body: "FAST-style action tokens let the backbone learn robot representations with a next-token loss, but token-by-token inference is slow for high-frequency control."
            },
            {
              title: "Continuous action experts run quickly",
              body: "A smaller flow-matching action expert can produce continuous action chunks fast enough for real-time robot control."
            },
            {
              title: "Naive joint training lets the new module perturb old knowledge",
              body: "The randomly initialized action expert sends gradients into a pretrained VLM backbone, which the paper links to slower convergence and weaker language following."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="objective"
        kicker="Training contract"
        title="The backbone and the action expert get different jobs."
        aside={<KILossNote />}
      >
        <KITrainingLanes />
        <PipelineFlow
          stages={[
            {
              label: "Represent",
              body: "Encode robot action chunks as FAST tokens so the VLM backbone receives a familiar next-token learning signal."
            },
            {
              label: "Control",
              body: "Train a separate action expert with flow matching so the deployed policy can output continuous action chunks."
            },
            {
              label: "Discard",
              body: "At inference time, use the action expert for motor control; the discrete action tokens served their purpose during representation learning."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="If you only use FAST"
          rightTitle="If you add KI"
          rows={[
            {
              label: "Training",
              left: "The backbone gets a strong next-token signal over compressed action symbols.",
              right: "The backbone still gets that signal while the action expert also learns continuous control."
            },
            {
              label: "Runtime",
              left: "Actions are decoded autoregressively, which is accurate but slow for fluent manipulation.",
              right: "Actions come from the smaller flow expert, so runtime resembles π0-style continuous control."
            },
            {
              label: "Risk",
              left: "No randomly initialized continuous head pushes gradients through the pretrained backbone.",
              right: "The new head is present, but its gradient is blocked from the backbone."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="insulation"
        kicker="Mechanism"
        title="Stop-gradient is the membrane between semantics and motor control."
        aside={<KIAttentionMask />}
      >
        <KIInsulationDiagram />
        <ComparisonRows
          leftTitle="Gradient flow"
          rightTitle="Information flow"
          rows={[
            {
              label: "Backbone",
              left: "Updated by language, VLM, planning, and FAST action-token losses.",
              right: "Produces representations that the action expert can condition on."
            },
            {
              label: "Action expert",
              left: "Updated by the flow-matching loss on continuous action chunks.",
              right: "Attends to the observation and language prefix, then denoises future actions."
            },
            {
              label: "Boundary",
              left: "The flow loss does not backpropagate into the pretrained VLM weights.",
              right: "The action expert still sees the backbone features, so this is insulation, not isolation."
            }
          ]}
        />
        <PullNote label="Mental model" tone="warm">
          Freezing the whole backbone would also protect knowledge, but it would stop the VLM from learning robot
          representations. KI is narrower: the backbone keeps learning from discrete action tokens, just not from the
          randomly initialized continuous expert.
        </PullNote>
      </PaperSpread>

      <PaperSpread
        id="mixture"
        kicker="Data recipe"
        title="The insulation only works because the backbone still receives useful token losses."
        aside={<KIMixtureStats />}
      >
        <KIDataMixture />
        <ComparisonRows
          leftTitle="Data source"
          rightTitle="What it teaches"
          rows={[
            {
              label: "FAST action data",
              left: "Robot demonstrations converted into compressed discrete action tokens.",
              right: "How visual and language context should become robot-useful representations."
            },
            {
              label: "Continuous actions",
              left: "The same kind of robot episodes viewed as real-valued action chunks.",
              right: "How the action expert should denoise and emit precise motions."
            },
            {
              label: "General VLM data",
              left: "Captioning, VQA, object localization, and related image-language tasks.",
              right: "Semantic grounding, object knowledge, and resistance to language forgetting."
            },
            {
              label: "Planning labels",
              left: "Robot data annotated with language descriptions of the next behavior.",
              right: "A bridge between task language and the motor-control representation."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The result is a three-way tradeoff point: train fast, run fast, generalize better."
        aside={<KIEvidenceScorecard />}
      >
        <MetricDelta
          leftLabel="training steps"
          leftValue="7.5x"
          center="π0 needs more steps to reach similar table-bussing performance in the reported generalist comparison"
          rightLabel="action expert"
          rightValue="300M"
        />
        <KIEvidenceBars />
        <KILiberoTable />
        <ComparisonRows
          leftTitle="Question"
          rightTitle="What the paper reports"
          rows={[
            {
              label: "Training speed",
              left: "Does continuous action training slow convergence?",
              right: "π0 trains much more slowly; KI trains about as quickly as π0-FAST while keeping continuous inference."
            },
            {
              label: "Language following",
              left: "Does the model still attend to the command?",
              right: "Stopping action-expert gradients improves language following compared with naive π0-style training."
            },
            {
              label: "Transfer",
              left: "Does non-robot VLM data matter after adding actions?",
              right: "The paper finds VLM co-training especially important for out-of-distribution object following."
            },
            {
              label: "Benchmarks",
              left: "Does the recipe survive outside the in-house tasks?",
              right: "It is evaluated on DROID and LIBERO, with strong LIBERO-90 and LIBERO-Spatial results from the generalist model."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="Knowledge insulation is a recipe, not a universal guarantee.">
        <KILimitGrid />
        <PullNote label="Takeaway" tone="cool">
          The useful claim in the paper is precise: when adding a continuous action expert to a pretrained VLM, give the
          backbone a discrete action-token learning signal and block expert gradients from rewriting it. That
          keeps the fast control path without giving up as much pretrained semantic transfer.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function KITermPrimer() {
  const terms = [
    {
      term: "VLA",
      body: "A vision-language-action model: it reads images and language, then outputs robot actions."
    },
    {
      term: "Action expert",
      body: "A smaller transformer module specialized for continuous action chunks, trained with flow matching."
    },
    {
      term: "Knowledge insulation",
      body: "A training rule that lets the action expert use VLM features while blocking its gradients from changing the VLM backbone."
    },
    {
      term: "FAST tokens",
      body: "Compressed discrete symbols for action chunks, used here as a training-time representation objective."
    }
  ];

  return (
    <div className="term-primer" aria-label="Knowledge insulation term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function KITeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "Robots need continuous, high-frequency actions, but pretrained VLMs were trained to predict discrete text-like tokens."
    },
    {
      label: "Assumption",
      body: "The pretrained backbone contains useful semantic knowledge, and we should avoid damaging it while adding motor control."
    },
    {
      label: "Method",
      body: "Train discrete FAST actions for representation learning and continuous flow actions for execution, then stop the flow loss at the backbone."
    },
    {
      label: "Result",
      body: "The model trains like a token VLA, runs like a continuous-control VLA, and transfers VLM knowledge better than naive joint training."
    }
  ];

  return (
    <div className="teaching-frame" aria-label="Knowledge insulation teaching frame">
      {items.map((item) => (
        <div className="teaching-card" key={item.label}>
          <span>{item.label}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function KIFailureStack() {
  const cards = [
    {
      label: "AR VLA",
      title: "token actions",
      body: "Good representation learning, but slow sequential inference for a one-second action chunk.",
      tone: "blue"
    },
    {
      label: "π0-style VLA",
      title: "flow actions",
      body: "Fast continuous control, but naive action-expert gradients can degrade language following.",
      tone: "warm"
    },
    {
      label: "frozen VLM",
      title: "protected but rigid",
      body: "Preserves pretraining, but the backbone does not adapt enough to robot control.",
      tone: "muted"
    },
    {
      label: "π0.5 + KI",
      title: "split and insulate",
      body: "Token losses train the backbone; flow losses train the action expert; gradients stop at the boundary.",
      tone: "accent"
    }
  ];

  return (
    <div className="ki-failure-stack" aria-label="VLA recipe comparison">
      {cards.map((card) => (
        <div className={`ki-method-card ${card.tone}`} key={card.label}>
          <span>{card.label}</span>
          <strong>{card.title}</strong>
          <p>{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function KITrainingLanes() {
  return (
    <div className="ki-training-lanes" aria-label="Joint discrete and continuous action training">
      <div className="ki-training-lane tokens">
        <LabelPill>backbone learning</LabelPill>
        <strong>next-token prediction</strong>
        <div className="ki-token-strip">
          {["image", "prompt", "state", "a17", "a04", "a91"].map((token) => (
            <span key={token}>{token}</span>
          ))}
        </div>
        <p>FAST actions look like symbols, so the VLM backbone can adapt through a familiar cross-entropy loss.</p>
      </div>

      <div className="ki-training-lane flow">
        <LabelPill>runtime control</LabelPill>
        <strong>flow matching</strong>
        <div className="ki-flow-strip">
          {["noise", "v(t)", "v(t)", "v(t)", "action chunk"].map((token, index) => (
            <span className={index === 4 ? "done" : ""} key={`${token}-${index}`}>
              {token}
            </span>
          ))}
        </div>
        <p>The action expert learns a vector field that transforms noise into a continuous action chunk.</p>
      </div>
    </div>
  );
}

function KILossNote() {
  return (
    <div className="ki-equation" aria-label="Knowledge insulation loss">
      <span>one loss, two boundaries</span>
      <strong>
        <MathInline>
          {
            "\\mathcal{L}_{\\mathrm{KI}}=\\mathcal{L}_{\\mathrm{text+FAST}}+\\alpha\\mathcal{L}_{\\mathrm{flow}},\\quad \\nabla_{\\theta_b}\\mathcal{L}_{\\mathrm{flow}}=0"
          }
        </MathInline>
      </strong>
      <p>
        Here <MathInline>{"\\theta_b"}</MathInline> means the backbone parameters, and <MathInline>{"\\alpha"}</MathInline>{" "}
        controls how much weight the continuous action loss receives. In plain English: train both outputs, but do not
        let the continuous action loss update the pretrained backbone.
      </p>
    </div>
  );
}

function KIInsulationDiagram() {
  return (
    <div className="ki-insulation" aria-label="Knowledge insulation mechanism">
      <div className="ki-backbone">
        <span>VLM backbone</span>
        <strong>semantic features</strong>
        <p>images, text, state, FAST action tokens, VLM data</p>
      </div>
      <div className="ki-boundary">
        <span>features pass</span>
        <strong>stop gradient</strong>
        <span>flow loss blocked</span>
      </div>
      <div className="ki-expert">
        <span>action expert</span>
        <strong>continuous actions</strong>
        <p>300M-parameter flow model for action chunks</p>
      </div>
    </div>
  );
}

function KIAttentionMask() {
  const rows = [
    ["text / image prefix", "on", "off", "off"],
    ["FAST action tokens", "on", "on", "off"],
    ["flow action tokens", "on", "off", "on"]
  ];

  return (
    <div className="ki-mask" aria-label="Attention and gradient boundary sketch">
      <span>attention sketch</span>
      <div className="ki-mask-grid">
        <b />
        <b>prefix</b>
        <b>FAST</b>
        <b>flow</b>
        {rows.flatMap((row) => [
          <b key={`${row[0]}-label`}>{row[0]}</b>,
          ...row.slice(1).map((cell, index) => (
            <i className={cell} key={`${row[0]}-${index}`}>
              {cell}
            </i>
          ))
        ])}
      </div>
      <p>
        The paper also avoids leakage between the two action representations: FAST tokens and continuous action tokens
        do not attend to each other.
      </p>
    </div>
  );
}

function KIMixtureStats() {
  return (
    <div className="ki-stats" aria-label="Knowledge insulation model statistics">
      <StatBlock label="backbone" value="3B" body="PaliGemma-style VLM initialized from pretrained weights" />
      <StatBlock label="action expert" value="300M" body="smaller flow model trained for continuous control" />
      <StatBlock label="horizon" value="50" body="future actions in each generated chunk" />
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

function KIDataMixture() {
  const items = [
    { code: "FAST", label: "discrete robot actions", tone: "accent", amount: "backbone signal" },
    { code: "FLOW", label: "continuous action chunks", tone: "warm", amount: "expert signal" },
    { code: "CAP", label: "image captioning", tone: "blue", amount: "web semantics" },
    { code: "VQA", label: "visual question answering", tone: "blue", amount: "language grounding" },
    { code: "LOC", label: "object localization", tone: "blue", amount: "spatial grounding" },
    { code: "PLAN", label: "robot planning labels", tone: "accent", amount: "task bridge" }
  ];

  return (
    <div className="ki-data-map" aria-label="Knowledge insulation data mixture">
      {items.map((item) => (
        <div className={`ki-data-card ${item.tone}`} key={item.code}>
          <span>{item.code}</span>
          <strong>{item.label}</strong>
          <p>{item.amount}</p>
        </div>
      ))}
    </div>
  );
}

function KIEvidenceScorecard() {
  return (
    <div className="ki-evidence-card" aria-label="Knowledge insulation evidence scorecard">
      <StatBlock label="control rate" value="10 Hz" body="reported for π0-style action expert control, versus 1.3 Hz autoregressive VLAs" />
      <StatBlock label="DROID score" value="0.55" body="+/- 0.09, compared with 0.49 for π0 and 0.45 for π0-FAST" />
      <StatBlock label="training overhead" value="+20%" body="from training both continuous and discrete outputs" />
    </div>
  );
}

function KIEvidenceBars() {
  const rows = [
    {
      label: "π0.5 + KI",
      score: 96,
      body: "fast convergence, fast continuous inference, strong language following"
    },
    {
      label: "π0",
      score: 58,
      body: "fast inference, but slower convergence and weaker language-following behavior"
    },
    {
      label: "π0-FAST",
      score: 72,
      body: "strong token training, but slower wall-clock task completion from autoregressive decoding"
    },
    {
      label: "frozen backbone",
      score: 18,
      body: "protects pretrained weights but under-adapts to robot-control representations"
    }
  ];

  return (
    <div className="ki-evidence-bars" aria-label="Qualitative evidence summary">
      {rows.map((row) => (
        <div className="ki-evidence-row" key={row.label}>
          <span>{row.label}</span>
          <i style={{ "--score": `${row.score}%` } as CSSProperties} />
          <p>{row.body}</p>
        </div>
      ))}
    </div>
  );
}

function KILiberoTable() {
  const rows = [
    { method: "π0", spatial: "96.8", object: "98.8", goal: "95.8", long: "85.2", libero90: "-" },
    { method: "π0-FAST", spatial: "96.4", object: "96.8", goal: "88.6", long: "60.2", libero90: "-" },
    { method: "Ours, from scratch", spatial: "96.6", object: "97.2", goal: "94.6", long: "84.8", libero90: "92.7" },
    { method: "Ours, from generalist", spatial: "98.0", object: "97.8", goal: "95.6", long: "85.8", libero90: "96.0" }
  ];

  return (
    <div className="ki-libero" aria-label="LIBERO success rates">
      <div className="ki-libero-header">
        <span>method</span>
        <span>spatial</span>
        <span>object</span>
        <span>goal</span>
        <span>long</span>
        <span>90</span>
      </div>
      {rows.map((row) => (
        <div className={row.method.startsWith("Ours") ? "ki-libero-row ours" : "ki-libero-row"} key={row.method}>
          <strong>{row.method}</strong>
          <span>{row.spatial}</span>
          <span>{row.object}</span>
          <span>{row.goal}</span>
          <span>{row.long}</span>
          <span>{row.libero90}</span>
        </div>
      ))}
      <p>Success rates in percent, reproduced from the LIBERO comparison table in the paper.</p>
    </div>
  );
}

function KILimitGrid() {
  const limits = [
    {
      label: "Not just freezing",
      body: "A frozen VLM backbone preserves knowledge but lacks robot-control representations, so the paper reports poor real-task performance for that strategy."
    },
    {
      label: "Extra train cost",
      body: "Training both discrete and continuous outputs adds about 20% compute, even though faster convergence can more than compensate in wall-clock time."
    },
    {
      label: "Language still fails",
      body: "The authors state that language following remains far from perfect because dataset correlations can still overpower the command."
    },
    {
      label: "Recipe dependence",
      body: "The result depends on the data mixture, FAST representation learning, stop-gradient placement, and attention boundaries working together."
    }
  ];

  return (
    <div className="ki-limits" aria-label="Knowledge insulation limitations">
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

export const pi05KnowledgeInsulation: PaperModule = {
  meta,
  sections,
  VisualEssay: KnowledgeInsulationEssay
};
