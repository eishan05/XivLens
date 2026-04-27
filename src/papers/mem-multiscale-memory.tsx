import { ComparisonRows, PaperShell, PaperSpread, PullNote, StepList } from "@/components/PaperEssay";
import { MathInline } from "@/components/MathInline";
import { LabelPill, MetricDelta, PipelineFlow } from "@/components/VisualPrimitives";
import type { PaperModule, PaperSection } from "./types";

const meta = {
  slug: "mem-multiscale-memory",
  title: "MEM: Multi-Scale Embodied Memory",
  subtitle:
    "Multi-Scale Embodied Memory gives a vision-language-action robot policy two memories at once: dense recent video for control details and compressed language for long-horizon task state.",
  abstract:
    "A mechanism-first read of MEM, the Physical Intelligence memory architecture for π0.6-style VLAs that combines short-term video memory with long-term language memory.",
  authors: [
    "Marcel Torne",
    "Karl Pertsch",
    "Homer Walke",
    "Kyle Vedder",
    "Suraj Nair",
    "Brian Ichter",
    "Allen Z. Ren",
    "Haohuan Wang",
    "Jiaming Tang",
    "Kyle Stachowicz",
    "Karan Dhabalia",
    "Michael Equi",
    "Quan Vuong",
    "Jost Tobias Springenberg",
    "Sergey Levine",
    "Chelsea Finn",
    "Danny Driess"
  ],
  venue: "arXiv 2603.03596v2",
  publishedAt: "Submitted Mar 4, 2026; revised Mar 8, 2026",
  sourceUrl: "https://www.pi.website/download/Mem.pdf",
  tags: ["robotics", "VLA", "memory", "long-horizon control"],
  accent: "#2f7568",
  status: "paper" as const
};

const sections: PaperSection[] = [
  { id: "problem", label: "Problem", title: "A robot needs different memories for different timescales" },
  { id: "factorization", label: "Split", title: "MEM factorizes action prediction into high and low levels" },
  { id: "language", label: "Language", title: "Long-term memory is a compressed text state" },
  { id: "video", label: "Video", title: "Short-term memory is encoded as recent video" },
  { id: "training", label: "Training", title: "π0.6-MEM trains memory before stretching the horizon" },
  { id: "evidence", label: "Evidence", title: "The experiments test memory, adaptation, and dexterity" },
  { id: "limits", label: "Limits", title: "MEM extends episode memory, not lifelong memory" }
];

function MemEssay() {
  return (
    <PaperShell paper={meta} sections={sections}>
      <PaperSpread
        id="problem"
        kicker="Core idea"
        title="MEM says robot memory should be multi-scale, not just longer."
        aside={
          <PullNote label="Reading frame" tone="cool">
            The paper&apos;s central move is simple: pixels are good for recent geometry and motion, while language is
            good for remembering abstract task progress over many minutes.
          </PullNote>
        }
      >
        <MemTermPrimer />
        <MemTeachingFrame />
        <MemoryNeedDiagram />
        <StepList
          items={[
            {
              title: "The short past is visually dense",
              body: "A robot may need to remember where an object went when its arm occluded it, or how a failed grasp approached the object."
            },
            {
              title: "The long past is semantically sparse",
              body: "For a recipe or cleanup task, the important state may be only that the butter was fetched, the dish was soaped, or a cabinet is still open."
            },
            {
              title: "One representation wastes something",
              body: "Raw video is too expensive for fifteen minutes of context, while text alone loses precise spatial details needed for control."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="factorization"
        kicker="Policy contract"
        title="The model keeps a text memory upstairs and a video memory downstairs."
        aside={<FactorizationEquation />}
      >
        <PolicySplitDiagram />
        <ComparisonRows
          leftTitle="High-level policy"
          rightTitle="Low-level policy"
          rows={[
            {
              label: "Question",
              left: "What should the robot do next, and what should it remember after this step?",
              right: "Given that subtask and recent observations, what continuous action chunk should the robot execute?"
            },
            {
              label: "Memory",
              left: (
                <>
                  Reads and updates <MathInline>{"m_t"}</MathInline>, a language summary of previous semantic events.
                </>
              ),
              right: (
                <>
                  Reads <MathInline>{"o_{t-K:t}"}</MathInline>, a short dense observation window where{" "}
                  <MathInline>{"K \\ll T"}</MathInline>.
                </>
              )
            },
            {
              label: "Interface",
              left: (
                <>
                  Emits a subtask instruction <MathInline>{"l_{t+1}"}</MathInline> and new memory{" "}
                  <MathInline>{"m_{t+1}"}</MathInline>.
                </>
              ),
              right: (
                <>
                  Emits the future action chunk <MathInline>{"a_{t:t+H}"}</MathInline>.
                </>
              )
            },
            {
              label: "Why split",
              left: "Language can carry task state for minutes without holding every frame.",
              right: "Video can preserve local geometry, timing, and failed attempts without polluting long-term memory."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="language"
        kicker="Long horizon"
        title="The memory summary is actively rewritten, not blindly appended."
        aside={
          <PullNote label="Compression" tone="warm">
            The model is trained to keep information that will matter later and discard details that no longer change
            future actions. That is the difference between memory and a transcript.
          </PullNote>
        }
      >
        <LanguageMemoryUpdate />
        <PipelineFlow
          stages={[
            {
              label: "Label episodes",
              body: "Robot episodes have subtask annotations and success or failure markers."
            },
            {
              label: "Summarize",
              body: "An off-the-shelf LLM turns prior subtasks into compact summaries of only future-relevant events."
            },
            {
              label: "Train update",
              body: "The high-level VLA learns to predict the next subtask and the next memory summary from the current observation, goal, and previous summary."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Naive text history"
          rightTitle="MEM language memory"
          rows={[
            {
              label: "Storage",
              left: "Concatenate prior subtask instructions until the context limit is reached.",
              right: "Maintain a compact state such as which objects were placed, cleaned, cooked, or still need attention."
            },
            {
              label: "Failure case",
              left: "Repeated failed attempts create repeated instructions that look unlike expert demonstrations.",
              right: "Failed attempts can be omitted once they no longer help future decisions."
            },
            {
              label: "Benefit",
              left: "Simple, but brittle under long rollouts.",
              right: "Less train-inference shift and faster inference because fewer irrelevant tokens are carried forward."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="video"
        kicker="Short horizon"
        title="The video encoder lets recent frames influence the current image tokens."
        aside={<VideoEncoderNotes />}
      >
        <VideoEncoderDiagram />
        <PipelineFlow
          stages={[
            {
              label: "Patchify frames",
              body: "Each camera frame is split into ViT-style image patches, preserving the usual single-image initialization."
            },
            {
              label: "Mix time cheaply",
              body: "Every fourth layer adds causal temporal attention over the same patch location across frames, alongside normal spatial attention."
            },
            {
              label: "Drop old tokens",
              body: "Upper layers keep the current timestep representation and discard past-frame tokens before the VLA backbone sees them."
            }
          ]}
        />
        <ComparisonRows
          leftTitle="Naive frame history"
          rightTitle="MEM video encoder"
          rows={[
            {
              label: "Backbone load",
              left: "Pass many frames into the VLA backbone, so token count and latency grow quickly.",
              right: "Compress temporal evidence into the current frame tokens before the backbone."
            },
            {
              label: "Attention cost",
              left: (
                <>
                  Joint time-space attention scales like <MathInline>{"O(n^2K^2)"}</MathInline>.
                </>
              ),
              right: (
                <>
                  Factorized attention scales like <MathInline>{"O(Kn^2+nK^2)"}</MathInline>.
                </>
              )
            },
            {
              label: "Initialization",
              left: "Long video support risks changing the pretrained visual interface.",
              right: "The paper adds fixed temporal positions and no new learnable ViT parameters."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="training"
        kicker="π0.6-MEM"
        title="The implementation teaches memory during pretraining, then stretches it at post-training."
        aside={<TrainingStats />}
      >
        <Pi06MemStack />
        <ComparisonRows
          leftTitle="Pretraining"
          rightTitle="Post-training and runtime"
          rows={[
            {
              label: "Data",
              left: "Teleoperated demonstrations, policy rollouts, human corrections, vision-language tasks, and video-language tasks.",
              right: "Task-specific robot data expands the observation horizon for the target evaluations."
            },
            {
              label: "Memory window",
              left: "Six observations: five past frames plus the current observation, spaced one second apart.",
              right: "Up to 18 frames and 54 seconds of observation-based memory in the reported experiments."
            },
            {
              label: "Backbone",
              left: "Initialized from a pretrained Gemma3-4B VLM with image encoders adapted for video.",
              right: "Uses real-time chunking variants so control can remain asynchronous and responsive."
            },
            {
              label: "Actions",
              left: "Trains both discrete FAST action token prediction and a flow-matching action expert.",
              right: "The 860M-parameter action expert does not send gradients back into the VLM backbone."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread
        id="evidence"
        kicker="Empirical read"
        title="The strongest evidence is that different memory failures separate cleanly."
        aside={
          <PullNote label="What to trust" tone="cool">
            The graphs mostly support a qualitative claim: neither video-only memory nor text-only memory is enough
            for the hardest long-horizon settings, and memory must be learned before deployment.
          </PullNote>
        }
      >
        <MetricDelta
          leftLabel="chopstick"
          leftValue="+11%"
          center="reported success-rate gain from memory on an in-context adaptation task"
          rightLabel="fridge"
          rightValue="+62%"
        />
        <EvidenceMatrix />
        <ComparisonRows
          leftTitle="What the experiments support"
          rightTitle="What they do not settle"
          rows={[
            {
              label: "Long horizon",
              left: "Recipe setup and kitchen cleanup need memory for up to fifteen minutes, and the full MEM model performs best in the paper's ablations.",
              right: "The result is still bounded to the evaluated kitchen tasks and rollout horizons."
            },
            {
              label: "Adaptation",
              left: "Short-term memory helps the policy change strategy after a failed chopstick grasp or wrong fridge-door opening attempt.",
              right: "The adaptation behavior is trained from targeted correction data, not discovered from arbitrary deployment experience."
            },
            {
              label: "Memory design",
              left: "Pool-memory and proprioception-only memory help in some cases, but do not cover partial observability, counting, timing, and spatial memory together.",
              right: "The paper does not prove that this exact high/low-level decomposition is the only viable memory architecture."
            }
          ]}
        />
      </PaperSpread>

      <PaperSpread id="limits" kicker="Boundary" title="MEM is a strong episode-memory system, not a solved robot memory stack.">
        <LimitGrid />
        <PullNote label="Takeaway" tone="cool">
          MEM is best read as a representation result: long robot tasks need a semantic ledger for what has happened
          and a visual buffer for what just happened. Combining the two lets the policy remember progress without
          throwing away the local evidence needed for control.
        </PullNote>
      </PaperSpread>
    </PaperShell>
  );
}

function MemTermPrimer() {
  const terms = [
    {
      term: "VLA",
      body: "A vision-language-action model: a model that reads images and instructions, then emits robot actions."
    },
    {
      term: "Partial observability",
      body: "The robot cannot see all task-relevant state at the current instant, so it must remember earlier evidence."
    },
    {
      term: "Proprioception",
      body: "The robot's internal state, such as joint angles or gripper position."
    },
    {
      term: "Memory horizon",
      body: "How far into the past useful context must reach: seconds for motion, minutes for task progress."
    }
  ];

  return (
    <div className="term-primer" aria-label="MEM term primer">
      {terms.map((item) => (
        <div className="term-card" key={item.term}>
          <span>{item.term}</span>
          <p>{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function MemTeachingFrame() {
  const items = [
    {
      label: "Problem",
      body: "Long robot tasks require remembering both precise recent visual facts and abstract old task facts."
    },
    {
      label: "Assumption",
      body: "Different facts should use different representations: video for local control, language for semantic progress."
    },
    {
      label: "Method",
      body: "Split the policy into a high-level memory updater and a low-level action policy with a video encoder."
    },
    {
      label: "Result",
      body: "The policy can handle long-horizon kitchen tasks and adapt manipulation strategies after recent failures."
    },
    {
      label: "Why it matters",
      body: "The paper turns memory from a bigger context window into a structured interface between planning and control."
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

function MemoryNeedDiagram() {
  const cards = [
    {
      label: "seconds",
      title: "visual details",
      body: "recent frames, occlusions, failed grasp angle, timing"
    },
    {
      label: "minutes",
      title: "semantic progress",
      body: "recipe steps done, surfaces wiped, cabinets left open"
    },
    {
      label: "control loop",
      title: "action chunk",
      body: "continuous motor commands conditioned on both memories"
    }
  ];

  return (
    <div className="mem-need" aria-label="MEM memory needs">
      {cards.map((card) => (
        <div className="mem-need-card" key={card.label}>
          <LabelPill>{card.label}</LabelPill>
          <strong>{card.title}</strong>
          <p>{card.body}</p>
        </div>
      ))}
    </div>
  );
}

function FactorizationEquation() {
  return (
    <div className="mem-equation">
      <span>paper equation</span>
      <strong>
        <MathInline>{"\\pi(a_{t:t+H},l_{t+1},m_{t+1}\\mid o_{t-T:t},m_t,g)"}</MathInline>
      </strong>
      <strong>
        <MathInline>{"\\approx \\pi_{LL}(a_{t:t+H}\\mid o_{t-K:t},l_{t+1},g)"}</MathInline>
      </strong>
      <strong>
        <MathInline>{"\\pi_{HL}(l_{t+1},m_{t+1}\\mid o_t,m_t,g)"}</MathInline>
      </strong>
      <p>
        Here <MathInline>{"T"}</MathInline> is the long history, <MathInline>{"K"}</MathInline> is the short dense
        window, <MathInline>{"m_t"}</MathInline> is language memory, and <MathInline>{"g"}</MathInline> is the task
        goal.
      </p>
    </div>
  );
}

function PolicySplitDiagram() {
  return (
    <div className="mem-policy-split" aria-label="MEM policy split">
      <div className="mem-policy-node input">
        <span>goal + observation</span>
        <strong>Clean the kitchen</strong>
        <p>Current images, state, and task prompt.</p>
      </div>
      <b>routes to</b>
      <div className="mem-policy-pair">
        <div className="mem-policy-node high">
          <span>high level</span>
          <strong>update memory</strong>
          <p>Track semantic task state and choose the next subtask.</p>
        </div>
        <div className="mem-policy-node low">
          <span>low level</span>
          <strong>act from video</strong>
          <p>Use recent frames and proprioception to produce continuous actions.</p>
        </div>
      </div>
    </div>
  );
}

function LanguageMemoryUpdate() {
  return (
    <div className="mem-language-update" aria-label="Language memory update">
      <div>
        <span>m_t</span>
        <p>I prepared the pot and got the potatoes, milk, and butter.</p>
      </div>
      <i />
      <div>
        <span>observation + subtask result</span>
        <p>The robot moved to the drawer and picked up the masher.</p>
      </div>
      <i />
      <div>
        <span>m_t+1</span>
        <p>I prepared the pot, got the ingredients, moved to the drawer, and picked up the masher.</p>
      </div>
    </div>
  );
}

function VideoEncoderNotes() {
  const notes = [
    {
      label: "300 ms",
      body: "The paper uses real-time latency thresholds from prior action-chunking work as the practical barrier."
    },
    {
      label: "4th layer",
      body: "Temporal attention is interleaved periodically rather than applied as one expensive joint operation."
    },
    {
      label: "0 params",
      body: "The video extension changes attention and adds fixed temporal positions, but no learnable ViT parameters."
    }
  ];

  return (
    <div className="mem-notes" aria-label="Video encoder notes">
      {notes.map((note) => (
        <div key={note.label}>
          <span>{note.label}</span>
          <p>{note.body}</p>
        </div>
      ))}
    </div>
  );
}

function VideoEncoderDiagram() {
  const frames = ["t-5", "t-4", "t-3", "t-2", "t-1", "t"];

  return (
    <div className="mem-video" aria-label="MEM video encoder">
      <div className="mem-video-frames">
        {frames.map((frame, index) => (
          <span className={index === frames.length - 1 ? "current" : ""} key={frame}>
            {frame}
          </span>
        ))}
      </div>
      <div className="mem-video-layers">
        <span>spatial attention</span>
        <span>temporal attention</span>
        <span>spatial attention</span>
        <span>drop past tokens</span>
      </div>
      <div className="mem-video-output">
        <strong>current image tokens</strong>
        <p>They now carry recent temporal evidence before entering the VLA backbone.</p>
      </div>
    </div>
  );
}

function TrainingStats() {
  return (
    <div className="mem-training-stats" aria-label="π0.6-MEM training facts">
      <div>
        <span>VLM init</span>
        <strong>Gemma3-4B</strong>
        <p>Base vision-language model used for the π0.6-MEM evaluation system.</p>
      </div>
      <div>
        <span>cameras</span>
        <strong>up to 4</strong>
        <p>Input streams at 448 x 448 pixels per camera.</p>
      </div>
      <div>
        <span>post-train memory</span>
        <strong>54s</strong>
        <p>Observation-based memory horizon reported with 18 frames.</p>
      </div>
    </div>
  );
}

function Pi06MemStack() {
  const blocks = [
    {
      label: "video memory",
      title: "recent frames",
      body: "Encoded by a ViT-derived video encoder."
    },
    {
      label: "state memory",
      title: "K state tokens",
      body: "Past proprioception is projected into continuous embeddings."
    },
    {
      label: "language memory",
      title: "semantic summary",
      body: "The high-level policy updates task progress in natural language."
    },
    {
      label: "action expert",
      title: "flow actions",
      body: "Continuous action chunks are generated by a separate expert."
    }
  ];

  return (
    <div className="mem-stack" aria-label="π0.6-MEM implementation stack">
      {blocks.map((block) => (
        <div className="mem-stack-block" key={block.label}>
          <span>{block.label}</span>
          <strong>{block.title}</strong>
          <p>{block.body}</p>
        </div>
      ))}
    </div>
  );
}

function EvidenceMatrix() {
  const rows = [
    {
      task: "Long-horizon tasks",
      memory: "recipe setup, kitchen cleanup",
      result: "needs video plus language memory"
    },
    {
      task: "In-context adaptation",
      memory: "chopstick grasp, fridge door",
      result: "uses recent failed attempts"
    },
    {
      task: "Core memory suite",
      memory: "drawers, groceries, coffee, grilled cheese, windows",
      result: "MEM covers more memory types than pool or proprio memory"
    },
    {
      task: "Dexterous tasks",
      memory: "bussing, folding, bed making, dishes, boxes",
      result: "matches π0.6 rather than degrading from added memory"
    }
  ];

  return (
    <div className="mem-evidence" aria-label="MEM evidence matrix">
      <div className="mem-evidence-header">
        <span>test</span>
        <span>memory demand</span>
        <span>paper result</span>
      </div>
      {rows.map((row) => (
        <div className="mem-evidence-row" key={row.task}>
          <strong>{row.task}</strong>
          <p>{row.memory}</p>
          <p>{row.result}</p>
        </div>
      ))}
    </div>
  );
}

function LimitGrid() {
  const limits = [
    {
      label: "Episode scope",
      body: "The conclusion names weeks, months, and continual deployment memory as future work."
    },
    {
      label: "Generated summaries",
      body: "The language-memory training labels come from an LLM summarization pipeline, so summary quality matters."
    },
    {
      label: "Correction data",
      body: "The adaptation examples are learned from targeted human corrections and exploration rollouts."
    },
    {
      label: "Architecture choice",
      body: "The experiments support this split strongly, but do not rule out other memory interfaces for VLAs."
    }
  ];

  return (
    <div className="mem-limits" aria-label="MEM limitations">
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

export const memMultiscaleMemory: PaperModule = {
  meta,
  sections,
  VisualEssay: MemEssay
};
